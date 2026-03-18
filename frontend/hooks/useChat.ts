
import { useState, useCallback, useRef } from 'react';
import { ChatMessage } from '../types';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const useChat = (systemInstruction: string) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const userLocation = useRef<{ latitude: number, longitude: number } | null>(null);

    const ai = useRef<GoogleGenerativeAI | null>(null);

    const getLocation = useCallback((): Promise<{ latitude: number, longitude: number }> => {
        return new Promise((resolve, reject) => {
            if (userLocation.current) {
                return resolve(userLocation.current);
            }
            if (!navigator.geolocation) {
                return reject(new Error("Geolocation is not supported by your browser."));
            }
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    };
                    userLocation.current = coords;
                    resolve(coords);
                },
                () => {
                    reject(new Error("Unable to retrieve your location. Please grant permission."));
                }
            );
        });
    }, []);

    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim()) return;

        setIsLoading(true);
        setError(null);
        
        const userMessage: ChatMessage = { role: 'user', parts: [{ text }] };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);

        const modelResponsePlaceholder: ChatMessage = { role: 'model', parts: [{ text: '' }], sources: [] };
        setMessages(prev => [...prev, modelResponsePlaceholder]);

        try {
            if (!ai.current) {
                ai.current = new GoogleGenerativeAI(process.env.API_KEY as string);
            }

            const model = ai.current.getGenerativeModel({
                model: 'gemini-2.5-flash',
                systemInstruction: systemInstruction,
                tools: [{ googleMaps: {} }],
            });

            let toolConfig: any = {};
            try {
                const location = await getLocation();
                toolConfig = {
                    retrievalConfig: { latLng: location }
                };
            } catch (locationError) {
                console.warn("Could not get user location:", (locationError as Error).message);
            }

            const result = await model.generateContentStream({
                contents: newMessages.map(msg => ({ role: msg.role, parts: msg.parts })),
                toolConfig,
            });
            
            let fullText = '';
            let sources: { uri: string; title: string }[] = [];
            const sourceUris = new Set<string>();

            for await (const chunk of result) {
                const chunkText = chunk.text;
                if(chunkText) {
                    fullText += chunkText;
                    setMessages(prev => prev.map((msg, index) => 
                        index === prev.length - 1 ? { ...msg, parts: [{ text: fullText }] } : msg
                    ));
                }

                if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
                     const chunkSources = chunk.candidates[0].groundingMetadata.groundingChunks
                        .map((c: any) => c.maps?.placeAnswerSources?.[0])
                        .filter(Boolean)
                        .map((s: any) => ({ uri: s.uri, title: s.placeInfo?.displayName?.text }))
                        .filter((s: any) => s.uri && s.title);
                    
                    for (const source of chunkSources) {
                        if (source.uri && !sourceUris.has(source.uri)) {
                            sources.push(source);
                            sourceUris.add(source.uri);
                        }
                    }
                }
            }
            
            setMessages(prev => prev.map((msg, index) => 
                index === prev.length - 1 ? { ...msg, parts: [{ text: fullText }], sources } : msg
            ));

        } catch (e) {
            console.error(e);
            const errorMessage = (e as Error).message;
            setError(errorMessage);
            setMessages(prev => prev.map((msg, index) => 
                index === prev.length - 1 ? { ...msg, parts: [{ text: `Sorry, an error occurred: ${errorMessage}` }] } : msg
            ));
        } finally {
            setIsLoading(false);
        }
    }, [messages, systemInstruction, getLocation]);

    return { messages, isLoading, error, sendMessage };
};
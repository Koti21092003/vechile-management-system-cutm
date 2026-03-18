import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';

declare const marked: any;

interface ChatbotProps {
    systemInstruction: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ systemInstruction }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const { messages, isLoading, sendMessage } = useChat(systemInstruction);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);
    
    const handleSend = () => {
        if (inputValue.trim()) {
            sendMessage(inputValue);
            setInputValue('');
        }
    };

    const renderMarkdown = (text: string) => {
        return { __html: marked.parse(text) };
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 rounded-full text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-110 z-50"
                aria-label="Open AI Assistant"
            >
                <i className={`fas ${isOpen ? 'fa-times' : 'fa-comments'} text-2xl transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 w-full max-w-sm h-[60vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col z-50 animate-fade-in-down border dark:border-gray-700">
                    <header className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">AI Assistant</h2>
                        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
                            <i className="fas fa-times"></i>
                        </button>
                    </header>
                    <main className="flex-1 p-4 overflow-y-auto space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100'}`}>
                                    <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={renderMarkdown(msg.parts[0].text)} />
                                    {msg.sources && msg.sources.length > 0 && (
                                        <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
                                            <h4 className="text-xs font-bold mb-1 opacity-70">Sources:</h4>
                                            <ul className="space-y-1">
                                                {msg.sources.map((source, i) => (
                                                    <li key={i}>
                                                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className={`text-xs ${msg.role === 'user' ? 'text-blue-200 hover:underline' : 'text-blue-600 dark:text-blue-400 hover:underline'}`}>
                                                            {i + 1}. {source.title}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && messages.length > 0 && messages[messages.length-1]?.role === 'model' && messages[messages.length-1]?.parts[0].text === '' && (
                             <div className="flex justify-start">
                                <div className="p-3 rounded-2xl bg-gray-200 dark:bg-gray-700">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </main>
                    <footer className="p-4 border-t dark:border-gray-700">
                        <div className="relative">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                                placeholder="Ask anything..."
                                className="w-full pl-4 pr-12 py-2 border rounded-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                            <button
                                onClick={handleSend}
                                disabled={isLoading || !inputValue.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                            >
                                <i className="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </footer>
                </div>
            )}
        </>
    );
};
export default Chatbot;

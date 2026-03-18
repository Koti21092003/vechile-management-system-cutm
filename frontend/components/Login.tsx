
import React, { useState } from 'react';

interface LoginProps {
    onLogin: (email: string, password: string) => boolean;
    onSwitchToSignup: () => void;
    onSwitchToForgotPassword: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToSignup, onSwitchToForgotPassword }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const success = onLogin(email, password);
        if (!success) {
            setErrorMessage('Invalid email or password');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-inter flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <img src="https://course.cutm.ac.in/wp-content/uploads/2022/07/CUTM_Logo.png" alt="Centurion University Logo" className="w-24 h-24 mx-auto mb-4 object-contain"/>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Centurion University</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Vehicle Management</p>
                </div>

                {errorMessage && (
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg">
                        <p className="text-red-700 dark:text-red-400 text-sm font-medium">{errorMessage}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                        <div className="relative">
                            <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                placeholder="Enter your email address"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                         <div className="relative">
                            <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-12 py-3 border bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                placeholder="Enter your password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                         <div className="text-right mt-2">
                            <button type="button" onClick={onSwitchToForgotPassword} className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">Forgot Password?</button>
                         </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold shadow-md hover:shadow-lg"
                    >
                        Login
                    </button>
                </form>
                
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-8">
                    Don't have an account?{' '}
                    <button onClick={onSwitchToSignup} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">Sign up</button>
                </p>
            </div>
        </div>
    );
};

export default Login;
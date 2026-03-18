
import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContext';

interface ForgotPasswordProps {
    onPasswordReset: (email: string, newPassword: string) => boolean;
    onSwitchToLogin: () => void;
}

const DEMO_OTP = "863924";

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onPasswordReset, onSwitchToLogin }) => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const { addToast } = useToast();
    
    const inputWrapperClass = "relative";
    const inputClass = "w-full pl-12 pr-4 py-3 border bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";
    const iconClass = "fas absolute left-4 top-1/2 -translate-y-1/2 text-gray-400";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2";

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(2);
        setErrorMessage('');
        addToast(`Demo OTP sent to ${email}: ${DEMO_OTP}`, 'info');
    };
    
    const handleOtpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (otp === DEMO_OTP) {
            setStep(3);
            setErrorMessage('');
        } else {
            setErrorMessage('Invalid OTP. Please try again.');
        }
    };
    
    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            setErrorMessage('Password must be at least 6 characters long.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            return;
        }
        
        const success = onPasswordReset(email, newPassword);
        if (success) {
            addToast('Password reset successfully! Please log in.', 'success');
        } else {
            setErrorMessage('Could not find an account with that email address.');
            setStep(1); // Go back to email step
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-inter flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <img src="https://cutm.ac.in/wp-content/uploads/2022/04/Centurion_University_of_Technology_and_Management_Logo-1.png" alt="Centurion University Logo" className="w-24 h-24 mx-auto mb-4 object-contain"/>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Reset Password</h1>
                     <p className="text-gray-600 dark:text-gray-400 mt-2">Centurion University - Vehicle Management</p>
                </div>

                {errorMessage && (
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg">
                        <p className="text-red-700 dark:text-red-400 text-sm font-medium">{errorMessage}</p>
                    </div>
                )}
                
                {step === 1 && (
                    <form onSubmit={handleEmailSubmit} className="space-y-6">
                        <p className="text-center text-sm text-gray-600 dark:text-gray-400">Enter your email to receive a reset code.</p>
                        <div>
                            <label className={labelClass}>Email Address</label>
                            <div className={inputWrapperClass}>
                                <i className={`${iconClass} fa-envelope`}></i>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email address" className={inputClass} required/>
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold shadow-md hover:shadow-lg">Send OTP</button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleOtpSubmit} className="space-y-6">
                        <p className="text-center text-sm text-gray-600 dark:text-gray-400">An OTP has been sent to {email}.</p>
                         <div>
                            <label className={labelClass}>OTP Code</label>
                             <div className={inputWrapperClass}>
                                <i className={`${iconClass} fa-key`}></i>
                                <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter 6-digit OTP" className={inputClass} required/>
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold shadow-md hover:shadow-lg">Verify OTP</button>
                    </form>
                )}

                {step === 3 && (
                     <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <p className="text-center text-sm text-gray-600 dark:text-gray-400">Create a new password for your account.</p>
                         <div>
                            <label className={labelClass}>New Password</label>
                            <div className={inputWrapperClass}>
                                <i className={`${iconClass} fa-lock`}></i>
                                <input type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password" className={`${inputClass} pr-12`} required/>
                                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"><i className={`fas ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i></button>
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Confirm New Password</label>
                             <div className={inputWrapperClass}>
                                <i className={`${iconClass} fa-lock`}></i>
                                <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className={`${inputClass} pr-12`} required/>
                                 <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"><i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i></button>
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold shadow-md hover:shadow-lg">Reset Password</button>
                    </form>
                )}

                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                    Remember your password?{' '}
                    <button onClick={onSwitchToLogin} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">Log in</button>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
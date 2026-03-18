
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { useToast } from '../contexts/ToastContext';

interface SignupProps {
    onRegister: (newUser: Omit<User, 'id' | 'joinDate'>) => { success: boolean, message: string };
    onSwitchToLogin: () => void;
}

const Signup: React.FC<SignupProps> = ({ onRegister, onSwitchToLogin }) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState<UserRole | ''>('');
    const [phone, setPhone] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [department, setDepartment] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const { addToast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        
        let validationError = '';        
        if (!fullName || !email || !password || !role) {
            validationError = 'All main fields are required.';
        } else if (password.length < 6) {
            validationError = 'Password must be at least 6 characters long.';
        } else if (role === 'driver' && (!phone || !licenseNumber)) {
            validationError = 'Phone number and license are required for drivers.';
        } else if (role === 'staff' && (!phone || !department)) {
            validationError = 'Phone number and branch are required for staff.';
        }

        if (validationError) {
            setErrorMessage(validationError);
            return;
        }

        const result = onRegister({
            fullName,
            email,
            password,
            role,
            username: email.split('@')[0],
            phone,
            licenseNumber: role === 'driver' ? licenseNumber : undefined,
            department: role === 'staff' ? department : undefined,
        });

        if (result.success) {
            addToast(result.message, 'success');
        } else {
            setErrorMessage(result.message);
        }
    };

    const inputWrapperClass = "relative";
    const inputClass = "w-full pl-12 pr-4 py-3 border bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";
    const iconClass = "fas absolute left-4 top-1/2 -translate-y-1/2 text-gray-400";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2";

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-inter flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                     <img src="https://cutm.ac.in/wp-content/uploads/2022/04/Centurion_University_of_Technology_and_Management_Logo-1.png" alt="Centurion University Logo" className="w-24 h-24 mx-auto mb-4 object-contain"/>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Create Account</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Centurion University - Vehicle Management</p>
                </div>

                {errorMessage && (
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg">
                        <p className="text-red-700 dark:text-red-400 text-sm font-medium">{errorMessage}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={labelClass}>Full Name</label>
                        <div className={inputWrapperClass}>
                            <i className={`${iconClass} fa-user`}></i>
                            <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name" className={inputClass} required />
                        </div>
                    </div>
                     <div>
                        <label className={labelClass}>Email Address</label>
                        <div className={inputWrapperClass}>
                            <i className={`${iconClass} fa-envelope`}></i>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className={inputClass} required />
                        </div>
                    </div>
                     <div>
                        <label className={labelClass}>Password</label>
                        <div className={inputWrapperClass}>
                            <i className={`${iconClass} fa-lock`}></i>
                            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" className={`${inputClass} pr-12`} required />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"><i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i></button>
                        </div>
                    </div>
                     <div>
                        <label className={labelClass}>Role</label>
                         <div className={inputWrapperClass}>
                            <i className={`${iconClass} fa-user-tag`}></i>
                            <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className={inputClass} required>
                                <option value="" disabled>Select your role</option>
                                <option value="staff">Staff</option>
                                <option value="driver">Driver</option>
                            </select>
                        </div>
                    </div>

                    {role === 'driver' && (
                        <>
                            <div>
                                <label className={labelClass}>Phone Number</label>
                                <div className={inputWrapperClass}>
                                    <i className={`${iconClass} fa-phone`}></i>
                                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter phone number" type="tel" className={inputClass} required />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Driving License</label>
                                <div className={inputWrapperClass}>
                                    <i className={`${iconClass} fa-id-card`}></i>
                                    <input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="Enter license number" className={inputClass} required />
                                </div>
                            </div>
                        </>
                    )}

                    {role === 'staff' && (
                        <>
                             <div>
                                <label className={labelClass}>Phone Number</label>
                                <div className={inputWrapperClass}>
                                    <i className={`${iconClass} fa-phone`}></i>
                                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter phone number" type="tel" className={inputClass} required />
                                </div>
                            </div>
                             <div>
                                <label className={labelClass}>Branch / Department</label>
                                <div className={inputWrapperClass}>
                                    <i className={`${iconClass} fa-building`}></i>
                                    <input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Enter branch or department" className={inputClass} required />
                                </div>
                            </div>
                        </>
                    )}

                    <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold shadow-md hover:shadow-lg">Sign Up</button>
                </form>

                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                    Already have an account?{' '}
                    <button onClick={onSwitchToLogin} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">Log in</button>
                </p>
            </div>
        </div>
    );
};

export default Signup;
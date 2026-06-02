import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
const apiUrl=import.meta.env.VITE_SERVER_URL;

const LoginPage = ({ setUser }) => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

   // Make sure to import axios at the top of your LoginPage.jsx
// import axios from 'axios';

const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
        // Determine if we are hitting the login or register route
        const endpoint = isLogin ? 'login' : 'register';
        
        // Make the actual API call to your backend
        const response = await axios.post(
            `${apiUrl}/api/v1/users/${endpoint}`, 
            formData,
            { withCredentials: true } // Crucial: This tells the browser to accept and store the JWT cookie
        );

        if (response.data.success) {
            console.log("Authentication successful!");
            
            // Set the user state with the real data from the database
            if (setUser) {
                // If your backend sends back a nested user object, use that, otherwise fallback to formData
                setUser(response.data.data.user || response.data.data || formData);
            }
            
            // Navigate to the chat page
            navigate('/chat'); 
        }
    } catch (error) {
        console.error("Auth Error:", error.response?.data || error.message);
        // You can replace this alert with a proper error state/UI later
        alert(error.response?.data?.message || "Authentication failed. Please check your credentials.");
    }
};

    const toggleMode = () => {
        setIsLogin(!isLogin);
        // Clear form when switching between Login and Sign Up
        setFormData({ name: '', email: '', password: '' }); 
    };

    return (
        <div className="min-h-screen bg-[#0F0F0F] flex flex-col items-center justify-center text-[#ECECEC] font-sans relative p-4">
            
            {/* Back Button */}
            <button 
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 text-[#A1A1AA] hover:text-white flex items-center gap-2 transition-colors"
            >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Back to Home
            </button>

            {/* Auth Card */}
            <div className="bg-[#171717] border border-[#2A2A2A] rounded-2xl p-8 w-full max-w-md shadow-2xl z-10">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2 text-white">
                        {isLogin ? 'Welcome back' : 'Create your account'}
                    </h2>
                    <p className="text-sm text-[#A1A1AA]">
                        {isLogin ? 'Enter your details to access your chats.' : 'Sign up to start chatting with AI.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Name Field - Only visible when Registering */}
                    {!isLogin && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-[#A1A1AA]">Name</label>
                            <input 
                                type="text" 
                                name="name"
                                required={!isLogin}
                                value={formData.name}
                                onChange={handleChange}
                                className="px-4 py-3 bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl focus:outline-none focus:border-[#10A37F] focus:ring-1 focus:ring-[#10A37F] text-[#ECECEC] transition-all"
                                placeholder="John Doe"
                            />
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-[#A1A1AA]">Email address</label>
                        <input 
                            type="email" 
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="px-4 py-3 bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl focus:outline-none focus:border-[#10A37F] focus:ring-1 focus:ring-[#10A37F] text-[#ECECEC] transition-all"
                            placeholder="name@example.com"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-[#A1A1AA]">Password</label>
                        <input 
                            type="password" 
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="px-4 py-3 bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl focus:outline-none focus:border-[#10A37F] focus:ring-1 focus:ring-[#10A37F] text-[#ECECEC] transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="w-full mt-4 bg-[#10A37F] hover:bg-[#0e8f6e] text-white font-semibold py-3.5 rounded-xl transition-colors shadow-lg shadow-[#10A37F]/20"
                    >
                        {isLogin ? 'Log in' : 'Sign up'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-[#A1A1AA]">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button 
                        type="button"
                        onClick={toggleMode}
                        className="text-[#10A37F] hover:text-[#20d4a8] font-medium transition-colors ml-1"
                    >
                        {isLogin ? 'Sign up' : 'Log in'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
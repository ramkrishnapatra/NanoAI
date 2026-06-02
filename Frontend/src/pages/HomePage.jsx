import React from 'react';
import {  useNavigate } from 'react-router-dom';

// --- HOME PAGE COMPONENT ---
const HomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0F0F0F] flex flex-col items-center justify-center text-[#ECECEC] font-sans selection:bg-[#10A37F] selection:text-white relative overflow-hidden">
            {/* Header */}
            <nav className="absolute top-0 w-full flex justify-between items-center p-6 max-w-7xl mx-auto z-20">
                <div className="text-xl font-bold tracking-tight">AI<span className="text-[#10A37F]">Chat</span></div>
                <button 
                    onClick={() => navigate('/login')}
                    className="text-sm font-medium text-[#A1A1AA] hover:text-white transition-colors"
                >
                    Log in
                </button>
            </nav>

            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-[#10A37F] opacity-10 blur-[120px] rounded-full pointer-events-none"></div>

            {/* Main Content */}
            <main className="flex flex-col items-center text-center px-6 max-w-3xl z-10 mt-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171717] border border-[#2A2A2A] text-xs font-medium text-[#A1A1AA] mb-8">
                    <span className="w-2 h-2 rounded-full bg-[#10A37F] animate-pulse"></span>
                    MERN Stack Powered AI
                </div>
                
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
                    Supercharge your <br />
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-[#10A37F] to-[#20d4a8]">
                        productivity with AI
                    </span>
                </h1>
                
                <p className="text-lg text-[#A1A1AA] mb-10 max-w-2xl">
                    Experience the next generation of conversational AI. Write code, brainstorm ideas, and solve complex problems instantly.
                </p>
                
                <button 
                    onClick={() => navigate('/login')}
                    className="bg-[#10A37F] hover:bg-[#0e8f6e] text-white text-lg font-semibold py-4 px-10 rounded-full transition-transform hover:scale-105 shadow-[0_0_30px_rgba(16,163,127,0.2)]"
                >
                    Get Started
                </button>
            </main>
        </div>
    );
};

export default HomePage
import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
const apiUrl=import.meta.env.VITE_SERVER_URL;

const ChatPage = ({ user, setUser }) => {
    const navigate = useNavigate();
    
    // THE FIX: Initialize sidebar state based on screen size so it starts closed on mobile
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        return typeof window !== 'undefined' ? window.innerWidth >= 768 : true;
    });
    
    const [input, setInput] = useState('');
    
    // Track the active conversation ID from MongoDB
    const [activeChatId, setActiveChatId] = useState(null);
    const [conversations, setConversations] = useState([]);
    
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your AI assistant. How can I help you today?' }
    ]);

    // Use a ref to prevent the fetch effect from wiping out our optimistic UI on the first message
    const skipNextFetch = useRef(false);

    // Extract the first letter for the avatar. Fallback to 'U' if no name is provided.
    const avatarLetter = user?.name
        ? user.name.charAt(0).toUpperCase()
        : (user?.email ? user.email.charAt(0).toUpperCase() : 'U');

    // Handle window resize dynamically to adjust sidebar visibility
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 1. Fetch all conversations when the page loads
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await axios.get(`${apiUrl}/api/v1/conversations`, {
                    withCredentials: true
                });
                if (response.data.success) {
                    setConversations(response.data.data);
                }
            } catch (error) {
                console.error("Failed to load conversations:", error);
            }
        };

        fetchConversations();
    }, []);

    // 2. Fetch messages whenever the activeChatId changes
    useEffect(() => {
        const fetchMessages = async () => {
            if (!activeChatId) return; // Don't fetch if we're on the "New Chat" screen

            // If we just created this chat, skip fetching so we don't wipe out our optimistic UI message
            if (skipNextFetch.current) {
                skipNextFetch.current = false; // Reset it for future clicks
                return;
            }

            try {
                const response = await axios.get(`${apiUrl}/api/v1/messages/${activeChatId}`, {
                    withCredentials: true
                });
                
                if (response.data.success) {
                    // Replace the current messages with the loaded history
                    setMessages(response.data.data);
                }
            } catch (error) {
                console.error("Failed to load message history:", error);
            }
        };

        fetchMessages();
    }, [activeChatId]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input.trim();

        // Add user message to UI immediately
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setInput('');

        try {
            let currentChatId = activeChatId;

            // IF NO ACTIVE CHAT, CREATE ONE IN THE DATABASE FIRST
            if (!currentChatId) {
                // Tell the useEffect to skip the upcoming fetch since we already have the optimistic UI
                skipNextFetch.current = true;

                const chatResponse = await axios.post(
                    `${apiUrl}/api/v1/conversations`, 
                    { title: userMessage.substring(0, 30) + '...' }, // Generate title from first msg
                    { withCredentials: true } 
                );
                
                // Get the real MongoDB _id and the new conversation object
                const newConversation = chatResponse.data.data;
                currentChatId = newConversation._id; 
                
                // Update React state so subsequent messages use this ID
                setActiveChatId(currentChatId);
                
                // Dynamically add the new chat to the sidebar list
                setConversations(prev => [newConversation, ...prev]);
            }

            // Prepare data with the REAL conversation ID
            let sendingData = {
                prompt: userMessage,
                conversationId: currentChatId 
            };

            // Send request to backend
            let response = await axios.post(
                `${apiUrl}/api/v1/ai/generate`, 
                sendingData,
                { withCredentials: true } 
            );

            // Update UI with AI response
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response.data.data.aiMessage.content
            }]);

        } catch (error) {
            console.error("Error communicating with AI:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Sorry, I encountered an error. Please check if the server is running!"
            }]);
        }
    };

    const handleLogout = async () => {
        try {
            // 1. Tell backend to destroy the HTTP-only cookie
            await axios.post(`${apiUrl}/api/v1/auth/logout`, {}, { withCredentials: true }); 
        } catch (error) {
            console.error("Backend logout failed:", error);
        } finally {
            // 2. Clear local storage tokens/user data
            localStorage.removeItem('token'); 
            localStorage.removeItem('user'); 
            
            // 3. THE FIX: Clear React States to prevent "Ghost Data"
            setConversations([]); 
            if (setUser) setUser(null);
            
            // 4. Redirect to login or home
            navigate('/');
        }
    };

    const handleNewChat = () => {
        // Reset messages and the activeChatId so a new DB entry is created on the next message
        setMessages([{ role: 'assistant', content: 'Hello! I am your AI assistant. How can I help you today?' }]);
        setActiveChatId(null);
        
        // THE FIX: Close sidebar after starting a new chat on mobile screens
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    };

    return (
        <div className="flex h-screen bg-[#0F0F0F] text-[#ECECEC] font-sans overflow-hidden relative">
            
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-10 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`${isSidebarOpen ? 'w-64 translate-x-0 opacity-100' : 'w-0 -translate-x-full opacity-0 md:w-0'} transition-all duration-300 ease-in-out bg-[#171717] border-r border-[#2A2A2A] flex flex-col shrink-0 md:relative fixed left-0 top-0 bottom-0 h-full z-20 overflow-hidden`}>
                {/* New Chat Button */}
                <div className="p-4 w-64">
                    <button
                        onClick={handleNewChat}
                        className="flex items-center gap-2 w-full px-4 py-3 bg-[#0F0F0F] hover:bg-[#212121] border border-[#2A2A2A] rounded-xl text-sm font-medium transition-colors"
                    >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path>
                        </svg>
                        New Chat
                    </button>
                </div>

                {/* Chat History List */}
                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 w-64">
                    <p className="px-3 py-2 text-xs font-semibold text-[#A1A1AA] mb-2 uppercase tracking-wider">Your Conversations</p>
                    
                    {conversations.length === 0 ? (
                        <p className="px-3 text-xs text-[#A1A1AA] italic">No conversations yet.</p>
                    ) : (
                        conversations.map((chat) => (
                            <button 
                                key={chat._id}
                                onClick={() => {
                                    setActiveChatId(chat._id);
                                    // THE FIX: Close sidebar after selecting a conversation on mobile screens
                                    if (window.innerWidth < 768) {
                                        setIsSidebarOpen(false);
                                    }
                                }}
                                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm truncate block transition-colors ${
                                    activeChatId === chat._id 
                                        ? 'bg-[#212121] text-[#ECECEC]' 
                                        : 'hover:bg-[#212121] text-[#A1A1AA]' 
                                }`}
                            >
                                {chat.title}
                            </button>
                        ))
                    )}
                </div>

                {/* Sidebar Footer (Logout) */}
                <div className="p-4 border-t border-[#2A2A2A] w-64">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-3 py-2 hover:bg-[#212121] rounded-lg text-sm text-[#A1A1AA] hover:text-white transition-colors"
                    >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                        </svg>
                        Log out
                    </button>
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col min-w-0 w-full h-full relative">
                {/* Header */}
                <header className="h-16 flex items-center justify-between px-4 border-b border-[#2A2A2A] bg-[#0F0F0F] shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 -ml-2 text-[#A1A1AA] hover:text-white rounded-md transition-colors focus:outline-none shrink-0"
                        >
                            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>
                        <h1 className="text-lg font-semibold truncate">NanoAI</h1>
                    </div>

                    {/* User Avatar (Top Right Corner) */}
                    <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-medium text-[#A1A1AA] hidden sm:block max-w-30 truncate">
                            {user?.name || user?.email || 'User'}
                        </span>
                        <div
                            className="w-9 h-9 rounded-full bg-linear-to-br from-[#10A37F] to-[#0e8f6e] flex items-center justify-center text-white font-bold text-sm shadow-md border-2 border-[#2A2A2A] cursor-pointer hover:opacity-90 transition-opacity shrink-0"
                            title={user?.name || user?.email || 'User Profile'}
                        >
                            {avatarLetter}
                        </div>
                    </div>
                </header>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 min-w-0">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex gap-3 sm:gap-4 max-w-3xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} min-w-0`}>
                            {/* Avatar for message */}
                            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${msg.role === 'user'
                                    ? 'bg-linear-to-br from-[#10A37F] to-[#0e8f6e] text-white'
                                    : 'bg-[#171717] border border-[#2A2A2A] text-[#10A37F]'
                                }`}>
                                {msg.role === 'user' ? avatarLetter : 'AI'}
                            </div>

                            {/* Message Content */}
                            <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm sm:text-base leading-relaxed shadow-sm wrap-break-word ${msg.role === 'user'
                                    ? 'bg-[#212121] text-[#ECECEC] rounded-tr-none'
                                    : 'bg-transparent text-[#ECECEC] flex-1 min-w-0'
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-3 sm:p-6 bg-[#0F0F0F] bg-opacity-90 backdrop-blur-sm border-t border-[#2A2A2A] shrink-0">
                    <form onSubmit={handleSend} className="max-w-3xl mx-auto relative flex items-end gap-2 bg-[#212121] border border-[#2A2A2A] focus-within:border-[#10A37F] focus-within:ring-1 focus-within:ring-[#10A37F] rounded-2xl p-2 transition-all shadow-lg">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(e);
                                }
                            }}
                            placeholder="Message AI..."
                            className="w-full bg-transparent text-[#ECECEC] px-3 py-2.5 max-h-32 min-h-11 resize-none focus:outline-none placeholder-[#A1A1AA] text-sm sm:text-base"
                            rows={1}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="p-2 rounded-xl bg-[#10A37F] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#0e8f6e] transition-colors shrink-0 mb-0.5"
                        >
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7"></path>
                            </svg>
                        </button>
                    </form>
                    <p className="text-center text-[10px] sm:text-xs text-[#A1A1AA] mt-2 sm:mt-3 px-2">
                        AI can make mistakes. Consider verifying important information.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default ChatPage;
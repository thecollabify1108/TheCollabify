import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ChatLayout from '../components/chat/ChatLayout';
import ConversationList from '../components/chat/ConversationList';
import ChatWindow from '../components/chat/ChatWindow';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../services/api';
import useWebSocket from '../hooks/useWebSocket';
import webSocketService from '../services/websocket';

const Messages = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [conversations, setConversations] = useState([]);
    const [activeConversationId, setActiveConversationId] = useState(null);

    // WebSocket Hook
    const { onlineUsers } = useWebSocket(user);

    const fetchConversations = useCallback(async () => {
        if (!user?.role) return;
        try {
            const res = await chatAPI.getConversations();
            const rawConversations = res?.data?.data?.conversations || [];

            // Normalize conversation data for UI
            const formatted = rawConversations.map(c => {
                const isSeller = user.role === 'seller';
                const otherUser = isSeller ? c.creatorUser : c.seller;
                const unreadCount = isSeller ? c.unreadCountSeller : c.unreadCountCreator;

                return {
                    ...c,
                    otherUser: otherUser || null,
                    unreadCount
                };
            });

            setConversations(formatted);

            const userParam = searchParams.get('user');
            if (!activeConversationId && userParam) {
                const matched = formatted.find(c => c.otherUser?.id === userParam);
                if (matched) {
                    setActiveConversationId(matched.id);
                }
            }

            // Auto-select first if none selected and desktop
            if (!activeConversationId && formatted.length > 0 && window.innerWidth >= 768) {
                // setActiveConversationId(formatted[0]._id);
            }
        } catch (error) {
            console.error('Failed to load chats', error);
        }
    }, [user?.role, searchParams, activeConversationId]);

    useEffect(() => {
        if (!user?.id || !user?.role) return;
        fetchConversations();
    }, [user?.id, user?.role, fetchConversations]);

    // Handle initial conversation from URL
    useEffect(() => {
        const convoId = searchParams.get('c') || searchParams.get('conversation');
        if (convoId) {
            setActiveConversationId(convoId);
        }
    }, [searchParams]);

    const activeConversation = conversations.find(c => c.id === activeConversationId);

    return (
        <ChatLayout>
            {/* Left Sidebar (Conversations) */}
            <ConversationList
                conversations={conversations}
                activeId={activeConversationId}
                onSelect={setActiveConversationId}
                onlineUsers={onlineUsers}
            />

            {/* Main Chat Window */}
            {activeConversation ? (
                <div className={`flex-1 h-full ${activeConversationId ? 'flex' : 'hidden md:flex'}`}>
                    <ChatWindow
                        conversation={activeConversation}
                        currentUser={user}
                        socketService={webSocketService}
                        onlineUsers={onlineUsers}
                        onBack={() => setActiveConversationId(null)}
                    />
                </div>
            ) : (
                <div className="hidden md:flex flex-1 items-center justify-center flex-col text-dark-400">
                    <div className="w-24 h-24 bg-dark-800 rounded-full flex items-center justify-center mb-6">
                        <span className="text-4xl">💬</span>
                    </div>
                    <h3 className="text-xl font-bold text-dark-200 mb-2">Your Messages</h3>
                    <p className="max-w-md text-center">Select a conversation from the left to start chatting with creators or brands.</p>
                </div>
            )}
        </ChatLayout>
    );
};

export default Messages;





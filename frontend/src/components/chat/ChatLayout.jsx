import { useState, useEffect } from 'react';
import Navbar from '../common/Navbar';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const ChatLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-dark-950 flex flex-col">
            <Navbar />

            <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-80px)]">
                <div className="h-full bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden shadow-2xl flex relative">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default ChatLayout;

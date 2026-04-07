import { useState, useEffect } from 'react';
import Navbar from '../common/Navbar';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const ChatLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-950 flex flex-col overflow-hidden">
            <Navbar />

            <div className="flex-1 w-full px-0 pt-24 pb-0 h-[calc(100dvh-6rem)]">
                <div className="h-full w-full bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-none overflow-hidden shadow-none flex relative">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default ChatLayout;

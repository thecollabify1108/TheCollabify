import { useState, useEffect } from 'react';
import Navbar from '../common/Navbar';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const ChatLayout = ({ children }) => {
    const { isDark } = useTheme();

    return (
        <div className={`min-h-screen flex flex-col overflow-hidden ${isDark ? 'bg-dark-950' : 'bg-slate-100'}`}>
            <Navbar />

            <div className="flex-1 w-full px-0 pt-24 pb-0 h-[calc(100dvh-6rem)]">
                <div className={`h-full w-full border rounded-none overflow-hidden shadow-none flex relative ${isDark ? 'bg-dark-900 border-dark-800' : 'bg-white border-slate-200'}`}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default ChatLayout;

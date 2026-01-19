import { useEffect, useState } from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { HiUsers, HiChevronDown, HiChevronUp } from 'react-icons/hi';
import { FaCircle } from 'react-icons/fa';
import useWebSocket from '../../hooks/useWebSocket';
import { useAuth } from '../../context/AuthContext';
import OnlineStatusIndicator from './OnlineStatusIndicator';

/**
 * OnlineUsersWidget
 * Shows a list of currently online users
 */
const OnlineUsersWidget = ({ maxVisible = 5, showInDashboard = true }) => {
    const { user } = useAuth();
    const { onlineUsers, isConnected } = useWebSocket(user);
    const [isExpanded, setIsExpanded] = useState(false);
    const [userDetails, setUserDetails] = useState([]);

    // Filter out current user from online list
    const filteredUsers = onlineUsers.filter(id => id !== user?.id);

    // Toggle expanded view
    const toggleExpanded = () => setIsExpanded(!isExpanded);

    // Determine how many to show
    const displayUsers = isExpanded ? filteredUsers : filteredUsers.slice(0, maxVisible);
    const hasMore = filteredUsers.length > maxVisible;

    if (!isConnected || filteredUsers.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-card p-4 ${showInDashboard ? 'border border-dark-700' : ''}`}
        >
            {/* Header */}
            <div className=\"flex items-center justify-between mb-4\">
                <div className=\"flex items-center gap-2\">
                    <div className=\"w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center\">
                        <HiUsers className=\"text-white text-lg\" />
                    </div>
                    <div>
                        <h3 className=\"font-semibold text-dark-100 text-sm\">Online Now</h3>
                        <p className=\"text-xs text-dark-400\">{filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}</p>
                    </div >
                </div >

    {/* Connection indicator */ }
    < div className =\"flex items-center gap-1 text-emerald-400\">
        < FaCircle className =\"w-2 h-2 animate-pulse\" />
            < span className =\"text-xs\">Live</span>
                </div >
            </div >

    {/* Online Users List */ }
    < div className =\"space-y-2\">
        < AnimatePresence mode =\"popLayout\">
{
    displayUsers.map((userId, index) => (
        <motion.div
            key={userId}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ delay: index * 0.05 }}
            className=\"flex items-center gap-3 p-2 rounded-lg hover:bg-dark-700/50 transition cursor-pointer\"
            >
            {/* Avatar */ }
    < div className =\"relative\">
    < div className =\"w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white text-xs font-bold\">
                                    U
                                </div >
        <OnlineStatusIndicator
            isOnline={true}
            size=\"xs\" 
                                    position =\"avatar\"
    />
                            </div >

        {/* User Info */ }
        < div className =\"flex-1 min-w-0\">
    < p className =\"text-sm text-dark-100 truncate\">User {userId.slice(-6)}</p>
    < p className =\"text-xs text-emerald-400\">Active now</p>
                            </div >
                        </motion.div >
                    ))
}
                </AnimatePresence >
            </div >

    {/* Show More/Less Button */ }
{
    hasMore && (
        <button
            onClick={toggleExpanded}
            className=\"w-full mt-3 py-2 text-xs text-primary-400 hover:text-primary-300 flex items-center justify-center gap-1 transition\"
                >
            {
                isExpanded?(
                        <>
                Show Less < HiChevronUp className =\"w-3 h-3\" />
                        </>
                    ) : (
        <>
            Show {filteredUsers.length - maxVisible} More <HiChevronDown className=\"w-3 h-3\" />
        </>
    )
}
                </button >
            )}
        </motion.div >
    );
};

export default OnlineUsersWidget;

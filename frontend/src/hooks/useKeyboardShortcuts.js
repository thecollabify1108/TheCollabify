import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

/**
 * useKeyboardShortcuts - Global keyboard shortcuts hook
 * @param {Object} shortcuts - Object mapping keys to handlers
 * @param {boolean} enabled - Whether shortcuts are enabled
 */
export const useKeyboardShortcuts = (shortcuts = {}, enabled = true) => {
    useEffect(() => {
        if (!enabled) return;

        const handleKeyPress = (e) => {
            // Check for modifier keys
            const isMod = e.ctrlKey || e.metaKey; // Ctrl on Windows, Cmd on Mac

            if (!isMod) return;

            const key = e.key.toLowerCase();
            const shortcut = shortcuts[key];

            if (shortcut) {
                e.preventDefault();
                shortcut();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [shortcuts, enabled]);
};

/**
 * KeyboardShortcutsHelper - Component to show available shortcuts
 */
export const KeyboardShortcutsHelper = ({ shortcuts }) => {
    return (
        <div className="fixed bottom-4 left-4 z-30 hidden lg:block">
            <div className="glass-card p-3 text-xs text-dark-400">
                <div className="font-semibold text-dark-200 mb-2">Keyboard Shortcuts</div>
                {Object.entries(shortcuts).map(([key, description]) => (
                    <div key={key} className="flex items-center gap-2 mb-1">
                        <kbd className="px-2 py-1 bg-dark-700 rounded text-xs border border-dark-600">
                            {key}
                        </kbd>
                        <span>{description}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * Default keyboard shortcuts for Creator Dashboard
 */
export const creatorShortcuts = (navigate, setActiveTab) => ({
    'k': () => {
        setActiveTab?.('opportunities');
        toast.success('Navigated to Opportunities');
    },
    'n': () => {
        setActiveTab?.('opportunities');
        toast.success('Browse new opportunities');
    },
    'm': () => {
        setActiveTab?.('messages');
        toast.success('Opened Messages');
    },
    'p': () => {
        setActiveTab?.('profile');
        toast.success('Opened Profile');
    },
    'h': () => {
        setActiveTab?.('dashboard');
        toast.success('Navigated to Home');
    }
});

/**
 * Default keyboard shortcuts for Seller Dashboard
 */
export const sellerShortcuts = (navigate, setActiveTab, setShowWizard) => ({
    'k': () => {
        setActiveTab?.('search');
        toast.success('Navigated to Search');
    },
    'n': () => {
        setShowWizard?.(true);
        toast.success('Opening Campaign Wizard');
    },
    'm': () => {
        setActiveTab?.('messages');
        toast.success('Opened Messages');
    },
    'd': () => {
        setActiveTab?.('dashboard');
        toast.success('Navigated to Dashboard');
    }
});

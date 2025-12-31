import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import './index.css'

// Google OAuth Client ID
const GOOGLE_CLIENT_ID = '420562433708-n0d7a1vqim121ft72g8igghu2b8p9m6g.apps.googleusercontent.com';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <BrowserRouter>
                <ThemeProvider>
                    <AuthProvider>
                        <NotificationProvider>
                            <App />
                            <Toaster
                                position="top-right"
                                toastOptions={{
                                    duration: 4000,
                                    style: {
                                        background: '#1e293b',
                                        color: '#f1f5f9',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(99, 102, 241, 0.2)',
                                    },
                                    success: {
                                        iconTheme: {
                                            primary: '#10b981',
                                            secondary: '#f1f5f9',
                                        },
                                    },
                                    error: {
                                        iconTheme: {
                                            primary: '#ef4444',
                                            secondary: '#f1f5f9',
                                        },
                                    },
                                }}
                            />
                        </NotificationProvider>
                    </AuthProvider>
                </ThemeProvider>
            </BrowserRouter>
        </GoogleOAuthProvider>
    </React.StrictMode>,
)


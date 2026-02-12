import axios from 'axios';

// Production Azure URL as fallback if env var not set
const AZURE_API_URL = 'https://thecollabify-api-hhc2huheexeqaqff.centralindia-01.azurewebsites.net';
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? AZURE_API_URL : '/api');

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true // Enable sending cookies with requests
});

// Request interceptor to add auth token (for backward compatibility with localStorage)
// Cookies are sent automatically when withCredentials is true
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // If no localStorage token, cookies will be used automatically
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || 'An error occurred';

        // Handle unauthorized errors
        if (error.response?.status === 401) {
            // Clear token and redirect to login
            localStorage.removeItem('token');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        return Promise.reject({ ...error, message });
    }
);

// Auth API
export const authAPI = {
    // OTP-based registration (NEW)
    sendRegistrationOTP: (data) => api.post('/auth/register/send-otp', data),
    verifyRegistrationOTP: (data) => api.post('/auth/register/verify-otp', data),
    resendRegistrationOTP: (data) => api.post('/auth/register/resend-otp', data),

    // Login with optional role for multi-role users
    login: (data) => api.post('/auth/login', data),  // Can include { email, password, role }

    // Legacy endpoints
    register: (data) => api.post('/auth/register', data),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/update', data),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
    changePassword: (data) => api.post('/auth/change-password', data),
    subscribeNewsletter: (email) => api.post('/auth/newsletter', { email })
};

// Creator API
export const creatorAPI = {
    getProfile: () => api.get('/creators/profile'),
    createProfile: (data) => api.post('/creators/profile', data),
    updateProfile: (data) => api.put('/creators/profile', data),
    getPromotions: () => api.get('/creators/promotions'),
    applyToPromotion: (promotionId) => api.post(`/creators/promotions/${promotionId}/apply`),
    getApplications: () => api.get('/creators/applications'),
    getAchievements: () => api.get('/achievements'),
    getAchievements: () => api.get('/achievements'),
    checkAchievements: () => api.post('/achievements/check'),
    respondToRequest: (promotionId, status) => api.post('/creators/respond-request', { promotionId, status }),
    updateAvailability: (status) => api.put('/creators/profile/availability', { status })
};

// Seller API
export const sellerAPI = {
    getRequests: (params) => api.get('/sellers/requests', { params }),
    createRequest: (data) => api.post('/sellers/requests', data),
    getRequest: (id) => api.get(`/sellers/requests/${id}`),
    updateRequest: (id, data) => api.put(`/sellers/requests/${id}`, data),
    deleteRequest: (id) => api.delete(`/sellers/requests/${id}`),
    acceptCreator: (requestId, creatorId) => api.post(`/sellers/requests/${requestId}/accept/${creatorId}`),
    rejectCreator: (requestId, creatorId) => api.post(`/sellers/requests/${requestId}/reject/${creatorId}`),
    updateStatus: (requestId, status) => api.put(`/sellers/requests/${requestId}/status`, { status }),
    getMatchDetails: (requestId, creatorId) => api.get(`/sellers/requests/${requestId}/match-details/${creatorId}`),
    getMatchDetails: (requestId, creatorId) => api.get(`/sellers/requests/${requestId}/match-details/${creatorId}`),
    searchCreators: (params) => api.get('/search/creators', { params }),
    requestCollaboration: (promotionId, creatorId) => api.post('/sellers/request-collaboration', { promotionId, creatorId })
};

// Notification API
export const notificationAPI = {
    getNotifications: (params) => api.get('/notifications', { params }),
    getUnreadCount: () => api.get('/notifications/unread-count'),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put('/notifications/read-all'),
    deleteNotification: (id) => api.delete(`/notifications/${id}`)
};

// Calendar API
export const calendarAPI = {
    getEvents: (params) => api.get('/calendar', { params }),
    createEvent: (data) => api.post('/calendar', data),
    updateEvent: (id, data) => api.put(`/calendar/${id}`, data),
    deleteEvent: (id) => api.delete(`/calendar/${id}`)
};

// Chat API
export const chatAPI = {
    getConversations: () => api.get('/chat/conversations'),
    getConversation: (id) => api.get(`/chat/conversations/${id}`),
    getMessages: (conversationId, params) => api.get(`/chat/conversations/${conversationId}/messages`, { params }),
    sendMessage: (conversationId, content) => api.post(`/chat/conversations/${conversationId}/messages`, { content }),
    getUnreadCount: () => api.get('/chat/unread-count'),
    editMessage: (messageId, content) => api.put(`/chat/messages/${messageId}`, { content }),
    deleteMessage: (messageId) => api.delete(`/chat/messages/${messageId}`),
    deleteConversation: (conversationId) => api.delete(`/chat/conversations/${conversationId}`),
    findOrRestoreConversation: (promotionId, creatorId) => api.post('/chat/find-or-restore', { promotionId, creatorId }),
    // Message request endpoints
    sendMessageRequest: (creatorId) => api.post('/chat/message-request', { creatorId }),
    getRequests: () => api.get('/chat/requests'),
    acceptRequest: (conversationId) => api.post(`/chat/message-request/${conversationId}/accept`),
    rejectRequest: (conversationId) => api.post(`/chat/message-request/${conversationId}/reject`),
    // PGP Key Management
    updatePGPKey: (publicKey) => api.put('/chat/pgp-key', { publicKey }),
    getPGPKey: (userId) => api.get(`/chat/pgp-key/${userId}`)
};

// Payment API
export const paymentAPI = {
    onboard: () => api.post('/payments/onboard'),
    createEscrowSession: (data) => api.post('/payments/create-escrow-session', data),
    verifySession: (sessionId) => api.get(`/payments/verify-session/${sessionId}`),
    getHistory: () => api.get('/payments/history'),
    releaseEscrow: (paymentId) => api.post(`/payments/release-escrow/${paymentId}`)
};

// Admin API
export const adminAPI = {
    getStats: () => api.get('/admin/stats'),
    getUsers: (params) => api.get('/admin/users', { params }),
    getUser: (id) => api.get(`/admin/users/${id}`),
    updateUserStatus: (id, isActive) => api.put(`/admin/users/${id}/status`, { isActive }),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    bulkDeleteUsers: (userIds) => api.post('/admin/bulk-delete', { userIds }),
    getRequests: (params) => api.get('/admin/requests', { params }),
    deleteRequest: (id) => api.delete(`/admin/requests/${id}`),
    getInsights: () => api.get('/admin/insights')
};

// Public API
export const publicAPI = {
    getLeaderboard: (params) => api.get('/leaderboard', { params })
};

// Analytics API
export const analyticsAPI = {
    getDashboard: (params) => api.get('/analytics/dashboard', { params }),
    getSummary: () => api.get('/analytics/summary'),
    getTopPerformers: (params) => api.get('/analytics/top-performers', { params }),
    getRange: (params) => api.get('/analytics/range', { params }),
    recordSnapshot: () => api.post('/analytics/snapshot'),
    getInsights: () => api.get('/analytics/insights')
};

// Team API
export const teamAPI = {
    getTeam: (params) => api.get('/team', { params }),
    inviteMember: (data) => api.post('/team/invite', data),
    updateRole: (id, role) => api.put(`/team/${id}/role`, { role }),
    removeMember: (id) => api.delete(`/team/${id}`),
    checkPermission: (params) => api.get('/team/permissions/check', { params })
};

// AI API
export const aiAPI = {
    generateCaption: (data) => api.post('/ai/generate-caption', data),
    generateHashtags: (data) => api.post('/ai/generate-hashtags', data),
    generateIdeas: (data) => api.post('/ai/generate-ideas', data),
    generateSchedule: (data) => api.post('/ai/generate-schedule', data),
    predictROI: (data) => api.post('/ai/predict-roi', data),
    getOptimalTime: (creatorId) => api.get(`/ai/optimal-time/${creatorId}`),
    getRecommendations: (campaignId) => api.get(`/ai/recommendations/${campaignId}`),
    getMarketInsights: () => api.get('/ai/market-insights'),
    getProfileTips: (data) => api.post('/ai/profile-tips', data)
};

// Collaboration API (Value Retention + Lifecycle State Machine)
export const collaborationAPI = {
    initializeCollaboration: (matchId) => api.post('/collaboration/initialize', { matchId }),
    getCollaboration: (matchId) => api.get(`/collaboration/${matchId}`),
    updateCollaboration: (id, data) => api.patch(`/collaboration/${id}`, data),
    transitionStatus: (id, newStatus) => api.post(`/collaboration/${id}/transition`, { newStatus }),
    submitFeedback: (id, data) => api.post(`/collaboration/${id}/feedback`, data)
};

export default api;

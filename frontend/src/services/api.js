import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
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
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/update', data),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
    changePassword: (data) => api.post('/auth/change-password', data)
};

// Creator API
export const creatorAPI = {
    getProfile: () => api.get('/creators/profile'),
    createProfile: (data) => api.post('/creators/profile', data),
    updateProfile: (data) => api.put('/creators/profile', data),
    getPromotions: () => api.get('/creators/promotions'),
    applyToPromotion: (promotionId) => api.post(`/creators/promotions/${promotionId}/apply`),
    getApplications: () => api.get('/creators/applications')
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
    getMatchDetails: (requestId, creatorId) => api.get(`/sellers/requests/${requestId}/match-details/${creatorId}`)
};

// Notification API
export const notificationAPI = {
    getNotifications: (params) => api.get('/notifications', { params }),
    getUnreadCount: () => api.get('/notifications/unread-count'),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put('/notifications/read-all'),
    deleteNotification: (id) => api.delete(`/notifications/${id}`)
};

// Chat API
export const chatAPI = {
    getConversations: () => api.get('/chat/conversations'),
    getConversation: (id) => api.get(`/chat/conversations/${id}`),
    getMessages: (conversationId, params) => api.get(`/chat/conversations/${conversationId}/messages`, { params }),
    sendMessage: (conversationId, content) => api.post(`/chat/conversations/${conversationId}/messages`, { content }),
    getUnreadCount: () => api.get('/chat/unread-count')
};

// Admin API
export const adminAPI = {
    getStats: () => api.get('/admin/stats'),
    getUsers: (params) => api.get('/admin/users', { params }),
    getUser: (id) => api.get(`/admin/users/${id}`),
    updateUserStatus: (id, isActive) => api.put(`/admin/users/${id}/status`, { isActive }),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    getRequests: (params) => api.get('/admin/requests', { params }),
    deleteRequest: (id) => api.delete(`/admin/requests/${id}`)
};

export default api;

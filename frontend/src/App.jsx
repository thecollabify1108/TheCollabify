import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';

// Pages
import Landing from './pages/Landing';
import ForBrands from './pages/ForBrands';
import ForCreators from './pages/ForCreators';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CreatorDashboard from './pages/CreatorDashboard';
import SellerDashboard from './pages/SellerDashboard';
import AdminPanel from './pages/AdminPanel';
import TermsConditions from './pages/TermsConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ScrollToTop from './components/common/ScrollToTop';
import PageTransition from './components/common/PageTransition';

// Loading spinner component
const LoadingSpinner = () => (
    <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="relative">
            <div className="w-16 h-16 border-4 border-primary-500/30 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
    </div>
);

// Protected route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        if (user.role === 'creator') {
            return <Navigate to="/creator/dashboard" replace />;
        } else if (user.role === 'seller') {
            return <Navigate to="/seller/dashboard" replace />;
        } else if (user.role === 'admin') {
            return <Navigate to="/admin" replace />;
        }
        return <Navigate to="/" replace />;
    }

    return children;
};

// Public route (redirect if authenticated)
const PublicRoute = ({ children }) => {
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (isAuthenticated) {
        // Redirect to dashboard based on role
        if (user.role === 'creator') {
            return <Navigate to="/creator/dashboard" replace />;
        } else if (user.role === 'seller') {
            return <Navigate to="/seller/dashboard" replace />;
        } else if (user.role === 'admin') {
            return <Navigate to="/admin" replace />;
        }
    }

    return children;
};

function App() {
    const location = useLocation();

    return (
        <>
            {/* 3D Animated Background */}
            <div className="floating-orbs">
                <div className="floating-orb orb-1"></div>
                <div className="floating-orb orb-2"></div>
                <div className="floating-orb orb-3"></div>
                <div className="floating-orb orb-4"></div>
                <div className="floating-orb orb-5"></div>
            </div>
            <div className="grid-pattern"></div>

            {/* Centered Watermark */}
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
                <img
                    src="/star-logo.png"
                    alt=""
                    className="w-96 h-auto opacity-10"
                />
            </div>

            <ScrollToTop />
            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    {/* Public routes */}
                    <Route
                        path="/"
                        element={
                            <PublicRoute>
                                <PageTransition>
                                    <Landing />
                                </PageTransition>
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <PageTransition>
                                    <Login />
                                </PageTransition>
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <PublicRoute>
                                <PageTransition>
                                    <Register />
                                </PageTransition>
                            </PublicRoute>
                        }
                    />
                    <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
                    <Route path="/reset-password/:token" element={<PageTransition><ResetPassword /></PageTransition>} />
                    <Route path="/for-brands" element={<PageTransition><ForBrands /></PageTransition>} />
                    <Route path="/for-creators" element={<PageTransition><ForCreators /></PageTransition>} />
                    <Route path="/terms" element={<PageTransition><TermsConditions /></PageTransition>} />
                    <Route path="/privacy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />

                    {/* Creator routes */}
                    <Route
                        path="/creator/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['creator']}>
                                <PageTransition>
                                    <CreatorDashboard />
                                </PageTransition>
                            </ProtectedRoute>
                        }
                    />

                    {/* Seller routes */}
                    <Route
                        path="/seller/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['seller']}>
                                <PageTransition>
                                    <SellerDashboard />
                                </PageTransition>
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin routes */}
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <PageTransition>
                                    <AdminPanel />
                                </PageTransition>
                            </ProtectedRoute>
                        }
                    />

                    {/* Catch all - redirect to landing */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AnimatePresence>
        </>
    );
}

export default App;

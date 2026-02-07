import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';

// Pages - Marketing (lazy loaded for better performance)
const Landing = lazy(() => import('./pages/Landing'));
const ForBrands = lazy(() => import('./pages/ForBrands'));
const ForCreators = lazy(() => import('./pages/ForCreators'));
const TermsConditions = lazy(() => import('./pages/TermsConditions'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));

// Pages - Auth (lightweight, load immediately)
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Pages - Errors (load immediately for better UX)
import NotFound from './pages/NotFound';
import ServerError from './pages/ServerError';

// Components
import ScrollToTop from './components/common/ScrollToTop';
import PageTransition from './components/common/PageTransition';
import AppLoader from './components/common/AppLoader';
import NotificationPrompt from './components/common/NotificationPrompt';
import ErrorBoundary from './components/common/ErrorBoundary';
import CursorParticles from './components/effects/CursorParticles';

// Lazy load heavy dashboard components (already optimized)
const CreatorDashboard = lazy(() => import('./pages/CreatorDashboard'));
const SellerDashboard = lazy(() => import('./pages/SellerDashboard'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const Messages = lazy(() => import('./pages/Messages'));
const PaymentVerification = lazy(() => import('./pages/PaymentVerification'));


// Protected route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) {
        return <AppLoader message="Authenticating..." subMessage="Please wait while we verify your session" />;
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
        return <AppLoader message="Loading..." subMessage="Preparing your experience" />;
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
        <ErrorBoundary>
            {/* Cursor Particle Effect */}
            <CursorParticles />

            {/* 3D Animated Background */}
            <div className="floating-orbs">
                <div className="floating-orb orb-1"></div>
                <div className="floating-orb orb-2"></div>
                <div className="floating-orb orb-3"></div>
                <div className="floating-orb orb-4"></div>
                <div className="floating-orb orb-5"></div>
            </div>
            <div className="grid-pattern"></div>

            {/* Push Notification Permission Prompt */}
            <NotificationPrompt />

            {/* Centered Watermark */}
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
                <img
                    src="/favicon.png"
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

                    {/* Chat Route (New) */}
                    <Route
                        path="/messages"
                        element={
                            <ProtectedRoute allowedRoles={['creator', 'seller', 'admin']}>
                                <PageTransition>
                                    <Suspense fallback={<AppLoader />}>
                                        <Messages />
                                    </Suspense>
                                </PageTransition>
                            </ProtectedRoute>
                        }
                    />

                    {/* Creator routes */}
                    <Route
                        path="/creator/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['creator']}>
                                <PageTransition>
                                    <Suspense fallback={<AppLoader />}>
                                        <CreatorDashboard />
                                    </Suspense>
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
                                    <Suspense fallback={<AppLoader />}>
                                        <SellerDashboard />
                                    </Suspense>
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
                                    <Suspense fallback={<AppLoader />}>
                                        <AdminPanel />
                                    </Suspense>
                                </PageTransition>
                            </ProtectedRoute>
                        }
                    />

                    {/* Payment Verification Route */}
                    <Route
                        path="/payment-verification"
                        element={
                            <ProtectedRoute allowedRoles={['seller']}>
                                <PageTransition>
                                    <Suspense fallback={<AppLoader />}>
                                        <PaymentVerification />
                                    </Suspense>
                                </PageTransition>
                            </ProtectedRoute>
                        }
                    />

                    {/* Error Pages */}
                    <Route path="/500" element={<ServerError />} />

                    {/* 404 - Not Found */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </AnimatePresence>
        </ErrorBoundary>
    );
}

export default App;

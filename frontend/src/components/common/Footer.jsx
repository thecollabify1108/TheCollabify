import { Link } from 'react-router-dom';
import NewsletterSignup from './NewsletterSignup';

const Footer = () => {
    return (
        <footer className="py-16 px-4 border-t border-dark-800 bg-dark-950">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Logo & Description */}
                    <div>
                        <Link to="/" className="flex items-center space-x-3 mb-4">
                            <img src="/new-logo.png" alt="" className="w-8 h-8 object-contain" />
                            <div className="flex flex-col">
                                <div className="flex items-baseline">
                                    <span className="text-lg italic text-dark-100 mr-1">The</span>
                                    <span className="text-xl font-bold text-dark-100">Collabify</span>
                                </div>
                            </div>
                        </Link>
                        <p className="text-dark-400 text-sm leading-relaxed mb-4">
                            Empowering brands and creators to build authentic partnerships.
                            Our AI-powered platform streamlines influencer discovery, campaign
                            management, and performance tracking.
                        </p>
                        <p className="text-dark-400 text-sm leading-relaxed">
                            Join thousands of successful collaborations and grow your business
                            with data-driven influencer marketing.
                        </p>
                    </div>

                    {/* Solutions */}
                    <div>
                        <h4 className="text-lg font-bold text-dark-100 mb-4">Solutions</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/for-brands" className="text-dark-400 hover:text-dark-200 transition">
                                    For Brands
                                </Link>
                            </li>
                            <li>
                                <Link to="/for-creators" className="text-dark-400 hover:text-dark-200 transition">
                                    For Influencers
                                </Link>
                            </li>
                            <li>
                                <Link to="/register" className="text-dark-400 hover:text-dark-200 transition">
                                    Get Started
                                </Link>
                            </li>
                            <li>
                                <Link to="/login" className="text-dark-400 hover:text-dark-200 transition">
                                    Sign In
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal & Contact */}
                    <div>
                        <h4 className="text-lg font-bold text-dark-100 mb-4">Legal</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/terms" className="text-dark-400 hover:text-dark-200 transition text-sm">
                                    Terms & Conditions
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="text-dark-400 hover:text-dark-200 transition text-sm">
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                        <div className="mt-6">
                            <h5 className="text-dark-200 font-medium mb-2 text-sm">Contact Us</h5>
                            <a
                                href="mailto:support@thecollabify.ai"
                                className="text-primary-400 hover:text-primary-300 transition text-sm"
                            >
                                support@thecollabify.ai
                            </a>
                            {/* Newsletter */}
                        </div>
                    </div>

                    {/* Newsletter Column */}
                    <div className="md:col-span-1">
                        <NewsletterSignup />
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-dark-800 mt-12 pt-8 text-center">
                    <p className="text-dark-400 text-sm">
                        © {new Date().getFullYear()} The Collabify. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

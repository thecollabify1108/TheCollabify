import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft } from 'react-icons/fa';
import Footer from '../components/common/Footer';

const TermsConditions = () => {
    return (
        <div className="min-h-screen bg-dark-950">
            {/* Header */}
            <div className="bg-dark-900 border-b border-dark-800 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <Link to="/" className="flex items-center space-x-3 mb-6">
                        <img src="/new-logo.png" alt="" className="w-8 h-8 object-contain" />
                        <div className="flex items-baseline">
                            <span className="text-lg italic text-dark-100 mr-1">The</span>
                            <span className="text-xl font-bold text-dark-100">Collabify</span>
                        </div>
                    </Link>
                    <h1 className="text-4xl font-bold text-dark-100">Terms & Conditions</h1>
                    <p className="text-dark-400 mt-2">Last updated: December 2024</p>
                </div>
            </div>

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto px-4 py-12"
            >
                <div className="prose prose-invert max-w-none">
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-dark-100 mb-4">1. Acceptance of Terms</h2>
                        <p className="text-dark-300 leading-relaxed">
                            By accessing and using The Collabify platform ("Service"), you accept and agree to be bound by
                            these Terms and Conditions. If you do not agree to these terms, please do not use our Service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-dark-100 mb-4">2. Description of Service</h2>
                        <p className="text-dark-300 leading-relaxed mb-4">
                            The Collabify is an AI-powered influencer marketing platform that connects brands with
                            content creators for promotional collaborations. Our services include:
                        </p>
                        <ul className="list-disc list-inside text-dark-300 space-y-2 ml-4">
                            <li>AI-powered creator discovery and matching</li>
                            <li>Campaign management tools</li>
                            <li>Performance tracking and analytics</li>
                            <li>Secure messaging between brands and creators</li>
                            <li>Payment processing for collaborations</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-dark-100 mb-4">3. User Accounts</h2>
                        <p className="text-dark-300 leading-relaxed mb-4">
                            To use our Service, you must create an account. You agree to:
                        </p>
                        <ul className="list-disc list-inside text-dark-300 space-y-2 ml-4">
                            <li>Provide accurate and complete registration information</li>
                            <li>Maintain the security of your account credentials</li>
                            <li>Notify us immediately of any unauthorized access</li>
                            <li>Accept responsibility for all activities under your account</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-dark-100 mb-4">4. User Conduct</h2>
                        <p className="text-dark-300 leading-relaxed mb-4">
                            Users agree not to:
                        </p>
                        <ul className="list-disc list-inside text-dark-300 space-y-2 ml-4">
                            <li>Violate any applicable laws or regulations</li>
                            <li>Infringe on intellectual property rights</li>
                            <li>Submit false or misleading information</li>
                            <li>Engage in fraudulent or deceptive practices</li>
                            <li>Harass, abuse, or harm other users</li>
                            <li>Use automated systems to access the Service without permission</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-dark-100 mb-4">5. Intellectual Property</h2>
                        <p className="text-dark-300 leading-relaxed">
                            All content, features, and functionality of the Service are owned by The Collabify and
                            are protected by international copyright, trademark, and other intellectual property laws.
                            Users retain ownership of content they create but grant us a license to display and
                            distribute it within the platform.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-dark-100 mb-4">6. Payment Terms</h2>
                        <p className="text-dark-300 leading-relaxed">
                            For paid collaborations facilitated through our platform, brands agree to pay the agreed-upon
                            amount upon successful completion of campaign deliverables. The Collabify may charge service
                            fees as disclosed at the time of transaction. All payments are processed through secure
                            third-party payment providers.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-dark-100 mb-4">7. Limitation of Liability</h2>
                        <p className="text-dark-300 leading-relaxed">
                            The Collabify shall not be liable for any indirect, incidental, special, consequential,
                            or punitive damages arising from your use of the Service. Our total liability shall not
                            exceed the amount you paid us in the twelve months prior to the claim.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-dark-100 mb-4">8. Termination</h2>
                        <p className="text-dark-300 leading-relaxed">
                            We reserve the right to suspend or terminate your account at any time for violation of
                            these terms. You may also terminate your account at any time by contacting our support team.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-dark-100 mb-4">9. Changes to Terms</h2>
                        <p className="text-dark-300 leading-relaxed">
                            We may modify these terms at any time. Continued use of the Service after changes
                            constitutes acceptance of the new terms. We will notify users of significant changes
                            via email or platform notification.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-dark-100 mb-4">10. Contact Information</h2>
                        <p className="text-dark-300 leading-relaxed">
                            For questions about these Terms & Conditions, please contact us at:{' '}
                            <a href="mailto:support@thecollabify.ai" className="text-primary-400 hover:text-primary-300">
                                support@thecollabify.ai
                            </a>
                        </p>
                    </section>
                </div>

                {/* Back Button */}
                <div className="mt-12 pt-8 border-t border-dark-800">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-dark-800 text-dark-100 hover:bg-dark-700 transition"
                    >
                        <FaArrowLeft />
                        Back to Home
                    </Link>
                </div>
            </motion.div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default TermsConditions;

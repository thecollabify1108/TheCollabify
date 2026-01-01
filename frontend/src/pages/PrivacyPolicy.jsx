import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft } from 'react-icons/fa';
import Footer from '../components/common/Footer';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-dark-950">
            {/* Header */}
            <div className="bg-dark-900 border-b border-dark-800 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <Link to="/" className="flex items-center space-x-3 mb-6">
                        <img src="/favicon.png" alt="" className="w-8 h-8 object-contain" />
                        <div className="flex items-baseline">
                            <span className="text-lg italic text-dark-100 mr-1">The</span>
                            <span className="text-xl font-bold text-dark-100">Collabify</span>
                        </div>
                    </Link>
                    <h1 className="text-4xl font-bold text-dark-100">Privacy Policy</h1>
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
                        <h2 className="text-2xl font-bold text-dark-100 mb-4">1. Introduction</h2>
                        <p className="text-dark-300 leading-relaxed">
                            At The Collabify, we take your privacy seriously. This Privacy Policy explains how we
                            collect, use, disclose, and safeguard your information when you use our platform.
                            Please read this policy carefully to understand our practices regarding your data.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-dark-100 mb-4">2. Information We Collect</h2>
                        <p className="text-dark-300 leading-relaxed mb-4">
                            We collect information you provide directly to us, including:
                        </p>
                        <ul className="list-disc list-inside text-dark-300 space-y-2 ml-4">
                            <li>Account information (name, email, password)</li>
                            <li>Profile information (bio, profile picture, social media handles)</li>
                            <li>Instagram account data (follower count, engagement metrics)</li>
                            <li>Communication data (messages, campaign details)</li>
                            <li>Payment information (processed by secure third parties)</li>
                            <li>Usage data (how you interact with our platform)</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-dark-100 mb-4">3. How We Use Your Information</h2>
                        <p className="text-dark-300 leading-relaxed mb-4">
                            We use the information we collect to:
                        </p>
                        <ul className="list-disc list-inside text-dark-300 space-y-2 ml-4">
                            <li>Provide, maintain, and improve our services</li>
                            <li>Match brands with suitable creators using AI algorithms</li>
                            <li>Process transactions and send related information</li>
                            <li>Send notifications about campaigns and platform updates</li>
                            <li>Respond to your comments, questions, and requests</li>
                            <li>Monitor and analyze trends, usage, and activities</li>
                            <li>Detect, investigate, and prevent fraudulent activities</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-dark-100 mb-4">4. Information Sharing</h2>
                        <p className="text-dark-300 leading-relaxed mb-4">
                            We may share your information in the following situations:
                        </p>
                        <ul className="list-disc list-inside text-dark-300 space-y-2 ml-4">
                            <li>With brands/creators when you engage in a collaboration</li>
                            <li>With service providers who assist in operating our platform</li>
                            <li>In response to legal requests or to protect our rights</li>
                            <li>In connection with a merger, acquisition, or sale of assets</li>
                            <li>With your consent or at your direction</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-dark-100 mb-4">5. Data Security</h2>
                        <p className="text-dark-300 leading-relaxed">
                            We implement industry-standard security measures to protect your personal information.
                            This includes encryption of data in transit and at rest, secure servers, and regular
                            security audits. However, no method of transmission over the Internet is 100% secure,
                            and we cannot guarantee absolute security.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-dark-100 mb-4">6. Cookies and Tracking</h2>
                        <p className="text-dark-300 leading-relaxed">
                            We use cookies and similar tracking technologies to track activity on our platform and
                            store certain information. You can instruct your browser to refuse all cookies or indicate
                            when a cookie is being sent. However, some features of our platform may not function
                            properly without cookies.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-dark-100 mb-4">7. Your Rights</h2>
                        <p className="text-dark-300 leading-relaxed mb-4">
                            Depending on your location, you may have the following rights:
                        </p>
                        <ul className="list-disc list-inside text-dark-300 space-y-2 ml-4">
                            <li>Access and receive a copy of your personal data</li>
                            <li>Correct or update your personal information</li>
                            <li>Delete your account and associated data</li>
                            <li>Object to or restrict processing of your data</li>
                            <li>Data portability</li>
                            <li>Withdraw consent at any time</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-dark-100 mb-4">8. Data Retention</h2>
                        <p className="text-dark-300 leading-relaxed">
                            We retain your personal information for as long as your account is active or as needed
                            to provide you services. We may also retain and use your information to comply with legal
                            obligations, resolve disputes, and enforce our agreements.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-dark-100 mb-4">9. Children's Privacy</h2>
                        <p className="text-dark-300 leading-relaxed">
                            Our Service is not intended for individuals under the age of 18. We do not knowingly
                            collect personal information from children. If you are a parent and believe your child
                            has provided us with personal information, please contact us immediately.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-dark-100 mb-4">10. Changes to This Policy</h2>
                        <p className="text-dark-300 leading-relaxed">
                            We may update this Privacy Policy from time to time. We will notify you of any changes
                            by posting the new policy on this page and updating the "Last updated" date. We encourage
                            you to review this policy periodically.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-dark-100 mb-4">11. Contact Us</h2>
                        <p className="text-dark-300 leading-relaxed">
                            If you have questions about this Privacy Policy or our data practices, please contact us at:{' '}
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

export default PrivacyPolicy;

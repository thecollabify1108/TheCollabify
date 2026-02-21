import { motion } from 'framer-motion';
import Icon from '../components/common/Icon';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-dark-900 transition-colors duration-300">
            <Navbar />

            <div className="pt-28 pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-medium text-sm mb-6"
                        >
                            <Icon name="shield-check" size={16} /> Privacy First Protocol
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6"
                        >
                            We Respect Your Privacy. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">Period.</span>
                        </motion.h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            No tracking cookies. No third-party ads. No selling your data.
                            Just a transparent platform built on trust.
                        </p>
                    </div>

                    {/* Key Promises Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                        <div className="p-8 rounded-2xl bg-white dark:bg-dark-800 shadow-sm border border-gray-100 dark:border-dark-700">
                            <Icon name="user" size={40} className="text-primary-500 mb-4" />
                            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Zero Personal Tracking</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                We don't track who you are. We only count anonymous page views to verify campaign reach.
                            </p>
                        </div>
                        <div className="p-8 rounded-2xl bg-white dark:bg-dark-800 shadow-sm border border-gray-100 dark:border-dark-700">
                            <Icon name="cookie" size={40} className="text-secondary-500 mb-4" />
                            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">No Creepy Cookies</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                We do not use persistent cookies to follow you around the internet. Your browsing habit is yours alone.
                            </p>
                        </div>
                        <div className="p-8 rounded-2xl bg-white dark:bg-dark-800 shadow-sm border border-gray-100 dark:border-dark-700">
                            <Icon name="shield-check" size={40} className="text-green-500 mb-4" />
                            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Data Ownership</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Your detailed profile data belongs to you. You can export or delete it at any time.
                            </p>
                        </div>
                    </div>

                    {/* Detailed Policy Content */}
                    <div className="prose prose-lg dark:prose-invert max-w-none bg-white dark:bg-dark-800 p-8 md:p-12 rounded-3xl border border-gray-100 dark:border-dark-700">
                        <h2>1. What Data We Collect</h2>
                        <p>We believe in minimal data collection. Here is exactly what we store:</p>
                        <ul className="space-y-2">
                            <li className="flex items-start gap-3">
                                <Icon name="check" size={16} className="text-green-500 mt-1 flex-shrink-0" />
                                <span><strong>Account Info:</strong> Name, Email, and Password (encrypted) when you sign up.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Icon name="check" size={16} className="text-green-500 mt-1 flex-shrink-0" />
                                <span><strong>Profile Data:</strong> Social media stats you choose to connect (for matchmaking).</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Icon name="check" size={16} className="text-green-500 mt-1 flex-shrink-0" />
                                <span><strong>Anonymous Analytics:</strong> We count "1 visit to /home" without attaching IP addresses or IDs.</span>
                            </li>
                        </ul>

                        <div className="my-8 h-px bg-gray-200 dark:bg-dark-600" />

                        <h2>2. What We DO NOT Collect</h2>
                        <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                            <li>We do <strong>NOT</strong> store your Credit Card numbers (Stripe handles that securely).</li>
                            <li>We do <strong>NOT</strong> record your screen or mouse movements.</li>
                            <li>We do <strong>NOT</strong> buy data about you from third parties.</li>
                            <li>We do <strong>NOT</strong> access your contacts or private messages.</li>
                        </ul>

                        <div className="my-8 h-px bg-gray-200 dark:bg-dark-600" />

                        <h2>3. How We Use Analytics</h2>
                        <p>
                            We built our own lightweight analytics engine to protect your privacy.
                            Legacy tools like Google Analytics track too much.
                            Our system simply answers: <em>"How many people visited the site today?"</em>
                            without asking <em>"Who are they?"</em>.
                        </p>

                        <div className="my-8 h-px bg-gray-200 dark:bg-dark-600" />

                        <h2>4. Your Rights</h2>
                        <p>You have the right to:</p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                            <li><strong>Access:</strong> Request a copy of all data we hold about you.</li>
                            <li><strong>Rectify:</strong> Fix any incorrect data effortlessly.</li>
                            <li><strong>Forget:</strong> Request permanent deletion of your account.</li>
                        </ul>

                        <div className="bg-primary-50 dark:bg-primary-900/10 p-6 rounded-xl mt-8 border border-primary-100 dark:border-primary-500/20">
                            <h3 className="text-primary-800 dark:text-primary-300 m-0 mb-2">Questions?</h3>
                            <p className="m-0 text-primary-700 dark:text-primary-400">
                                Contact our Data Privacy Officer at <a href="mailto:privacy@thecollabify.tech" className="font-bold hover:underline">privacy@thecollabify.tech</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default PrivacyPolicy;

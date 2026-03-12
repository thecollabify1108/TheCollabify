import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaInstagram, FaLinkedinIn, FaTwitter } from 'react-icons/fa';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import SEO from '../components/common/SEO';

const Contact = () => {
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = e => {
        e.preventDefault();
        // Use mailto fallback — no backend endpoint needed for now
        const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
        const mailtoLink = `mailto:support@thecollabify.com?subject=${encodeURIComponent(form.subject || 'Contact from TheCollabify')}&body=${body}`;
        window.open(mailtoLink, '_blank');
        setSubmitted(true);
    };

    return (
        <>
            <SEO title="Contact - TheCollabify" description="Get in touch with the TheCollabify team." />
            <div className="min-h-screen bg-dark-950">
                <Navbar />

                <section className="pt-28 pb-16 px-4">
                    <div className="max-w-xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-center mb-8"
                        >
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-secondary-500/10 text-secondary-400 border border-secondary-500/20 mb-4">
                                Get In Touch
                            </span>
                            <h1 className="text-3xl md:text-4xl font-bold text-dark-100 mb-2">
                                Contact <span className="gradient-text">Us</span>
                            </h1>
                            <p className="text-dark-400 text-sm">
                                Have a question or want to collaborate? We'd love to hear from you.
                            </p>
                        </motion.div>

                        {/* Direct email card */}
                        <div className="glass-card p-4 mb-6 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-400 flex-shrink-0">
                                <FaEnvelope />
                            </div>
                            <div>
                                <p className="text-xs text-dark-500 font-medium uppercase tracking-widest">Email Us Directly</p>
                                <a href="mailto:support@thecollabify.com" className="text-sm text-primary-400 hover:text-primary-300 transition font-medium">
                                    support@thecollabify.com
                                </a>
                            </div>
                        </div>

                        {submitted ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass-card p-8 text-center"
                            >
                                <div className="text-4xl mb-3">✉️</div>
                                <h3 className="text-lg font-bold text-dark-100 mb-2">Email Client Opened</h3>
                                <p className="text-sm text-dark-400 mb-4">
                                    Your default email app should have opened with a pre-filled message.
                                    If not, email us directly at{' '}
                                    <a href="mailto:support@thecollabify.com" className="text-primary-400 hover:underline">
                                        support@thecollabify.com
                                    </a>
                                </p>
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="text-sm text-dark-400 hover:text-dark-200 transition"
                                >
                                    Send another message
                                </button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="glass-card p-5 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-dark-400 mb-1 font-medium">Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-3 py-2 bg-dark-900/60 border border-dark-700 rounded-lg text-dark-100 text-sm focus:border-primary-500 outline-none transition"
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-dark-400 mb-1 font-medium">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-3 py-2 bg-dark-900/60 border border-dark-700 rounded-lg text-dark-100 text-sm focus:border-primary-500 outline-none transition"
                                            placeholder="you@email.com"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-dark-400 mb-1 font-medium">Subject</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={form.subject}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-dark-900/60 border border-dark-700 rounded-lg text-dark-100 text-sm focus:border-primary-500 outline-none transition"
                                        placeholder="What's this about?"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-dark-400 mb-1 font-medium">Message</label>
                                    <textarea
                                        name="message"
                                        value={form.message}
                                        onChange={handleChange}
                                        required
                                        rows={4}
                                        className="w-full px-3 py-2 bg-dark-900/60 border border-dark-700 rounded-lg text-dark-100 text-sm focus:border-primary-500 outline-none transition resize-none"
                                        placeholder="Tell us how we can help..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition"
                                >
                                    Send Message
                                </button>
                            </form>
                        )}

                        <div className="mt-8 text-center">
                            <p className="text-xs text-dark-500 mb-3">Also find us on</p>
                            <div className="flex items-center justify-center gap-4">
                                {[
                                    { icon: <FaInstagram />, label: 'Instagram', href: '#' },
                                    { icon: <FaLinkedinIn />, label: 'LinkedIn', href: '#' },
                                    { icon: <FaTwitter />, label: 'Twitter', href: '#' }
                                ].map(s => (
                                    <a
                                        key={s.label}
                                        href={s.href}
                                        aria-label={s.label}
                                        className="w-9 h-9 rounded-lg flex items-center justify-center bg-dark-800 hover:bg-primary-500/20 text-dark-400 hover:text-primary-400 transition border border-dark-700"
                                    >
                                        {s.icon}
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <Link to="/" className="text-sm text-dark-500 hover:text-dark-300 transition">
                                ← Back to Home
                            </Link>
                        </div>
                    </div>
                </section>

                <Footer />
            </div>
        </>
    );
};

export default Contact;

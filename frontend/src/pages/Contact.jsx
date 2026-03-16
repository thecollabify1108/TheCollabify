import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineMail, HiOutlineChatAlt2, HiOutlineSupport, HiArrowNarrowLeft } from 'react-icons/hi';
import { FaInstagram, FaLinkedinIn, FaTwitter } from 'react-icons/fa';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import SEO from '../components/common/SEO';

const Contact = () => {
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = e => {
        e.preventDefault();
        const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
        const mailtoLink = `mailto:support@thecollabify.tech?subject=${encodeURIComponent(form.subject || 'Contact from TheCollabify')}&body=${body}`;
        window.open(mailtoLink, '_blank');
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-dark-950 font-sans selection:bg-primary-500/30">
            <SEO title="Contact - TheCollabify" description="Connect with the architecture team behind the intelligence layer of creator commerce." />
            <Navbar />

            <div className="pt-32 pb-24 px-6 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-secondary-900/10 blur-[120px] rounded-full pointer-events-none"></div>

                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                        {/* Left Side: Info */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-12"
                        >
                            <div className="space-y-6">
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-500/10 text-secondary-400 border border-secondary-500/20 font-bold text-[10px] uppercase tracking-widest"
                                >
                                    <HiOutlineChatAlt2 className="text-sm" /> Support & Engineering
                                </motion.div>
                                <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight italic">
                                    Let's Synchronize <br />
                                    Your <span className="gradient-text">Ambition.</span>
                                </h1>
                                <p className="text-lg text-dark-300 leading-relaxed max-w-md">
                                    Whether you're an enterprise brand seeking custom AI matching or a creator with platform feedback, our engineering team is ready to listen.
                                </p>
                            </div>

                            <div className="space-y-6">
                                {[
                                    { icon: HiOutlineMail, title: "General Inquiries", detail: "support@thecollabify.tech", sub: "Response time: < 24 hrs" },
                                    { icon: HiOutlineSupport, title: "Technical Support", detail: "help@thecollabify.tech", sub: "Documentation & troubleshooting" }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-6 p-6 rounded-3xl glass-card border border-white/5 transition-all hover:border-white/10 group">
                                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-primary-400 text-2xl group-hover:scale-110 transition-transform">
                                            <item.icon />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold mb-1">{item.title}</h4>
                                            <p className="text-primary-400 font-medium mb-1">{item.detail}</p>
                                            <p className="text-[10px] text-dark-500 uppercase font-black tracking-widest">{item.sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-8">
                                <p className="text-xs text-dark-500 font-bold uppercase tracking-widest mb-6">Social Intelligence</p>
                                <div className="flex gap-4">
                                    {[
                                        { icon: FaInstagram, color: "hover:text-pink-500" },
                                        { icon: FaLinkedinIn, color: "hover:text-blue-500" },
                                        { icon: FaTwitter, color: "hover:text-sky-400" }
                                    ].map((social, i) => (
                                        <a key={i} href="#" className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-dark-400 text-xl transition-all ${social.color} hover:bg-white/10`}>
                                            <social.icon />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Side: Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="relative"
                        >
                            <div className="glass-card p-10 md:p-14 rounded-[3rem] border border-white/10 shadow-2xl relative z-10 overflow-hidden">
                                {submitted ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-20"
                                    >
                                        <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-8">
                                            <HiOutlineMail />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-4">Transmission Successful</h3>
                                        <p className="text-dark-400 max-w-xs mx-auto mb-10 text-sm leading-relaxed">
                                            Your default email client has been triggered. Please complete the send process there.
                                        </p>
                                        <button
                                            onClick={() => setSubmitted(false)}
                                            className="text-primary-400 font-bold text-sm tracking-widest uppercase hover:text-primary-300 transition"
                                        >
                                            Send Another Message
                                        </button>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-dark-400 font-black uppercase tracking-widest ml-1">Identity</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={form.name}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="Full name"
                                                    className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-white outline-none focus:border-primary-500/50 transition-all font-medium"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-dark-400 font-black uppercase tracking-widest ml-1">Email Endpoint</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={form.email}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="you@domain.com"
                                                    className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-white outline-none focus:border-primary-500/50 transition-all font-medium"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-dark-400 font-black uppercase tracking-widest ml-1">Context</label>
                                            <input
                                                type="text"
                                                name="subject"
                                                value={form.subject}
                                                onChange={handleChange}
                                                placeholder="What is this regarding?"
                                                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-white outline-none focus:border-primary-500/50 transition-all font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-dark-400 font-black uppercase tracking-widest ml-1">Payload</label>
                                            <textarea
                                                name="message"
                                                value={form.message}
                                                onChange={handleChange}
                                                required
                                                rows={5}
                                                placeholder="Describe your inquiry in detail..."
                                                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-white outline-none focus:border-primary-500/50 transition-all font-medium resize-none shadow-inner"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full py-5 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-primary-900/30 active:scale-[0.98]"
                                        >
                                            Send Signal
                                        </button>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    <div className="mt-20 text-center">
                        <Link to="/" className="inline-flex items-center gap-2 text-dark-500 hover:text-white transition-colors group">
                            <HiArrowNarrowLeft className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Return to Infrastructure</span>
                        </Link>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Contact;

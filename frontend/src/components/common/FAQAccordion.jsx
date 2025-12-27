import { useState } from 'react';
import { FaChevronDown, FaQuestionCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const FAQAccordion = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            question: "How does TheCollabify match brands with creators?",
            answer: "Our AI-powered algorithm analyzes multiple factors including creator niche, engagement rate, follower demographics, and past performance to match brands with the most suitable creators for their campaigns."
        },
        {
            question: "Is it free to sign up as a creator?",
            answer: "Yes! Signing up as a creator is completely free. You can create your profile, showcase your work, and start applying to brand campaigns without any upfront costs."
        },
        {
            question: "How do brands post promotion requests?",
            answer: "Brands can easily create promotion requests by specifying their campaign goals, target audience, budget range, and preferred creator categories. Our system then automatically matches them with eligible creators."
        },
        {
            question: "What types of promotions are supported?",
            answer: "We support various promotion types including Instagram Stories, Reels, Feed Posts, IGTV, Live Sessions, and integrated campaign packages. Brands can choose specific formats or let creators propose their best approach."
        },
        {
            question: "How are payments handled?",
            answer: "Payments are negotiated directly between brands and creators. We provide a secure messaging system for communication. Once terms are agreed upon, payments can be processed through the platform securely."
        },
        {
            question: "Can I track my campaign performance?",
            answer: "Absolutely! Our dashboard provides comprehensive analytics including application status, matched creators, campaign progress, and engagement metrics to help you track and optimize your influencer marketing efforts."
        }
    ];

    const toggleAccordion = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-24 px-4 relative bg-dark-900/50">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="gradient-text">Frequently Asked Questions</span>
                    </h2>
                    <p className="text-dark-400 text-lg">
                        Everything you need to know about TheCollabify
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="glass-card overflow-hidden transition-all duration-300 hover:border-primary-500/30"
                        >
                            <button
                                onClick={() => toggleAccordion(index)}
                                className="w-full p-6 flex items-center justify-between text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                                        <FaQuestionCircle className="text-primary-400" />
                                    </div>
                                    <span className="font-semibold text-dark-100 text-lg">{faq.question}</span>
                                </div>
                                <FaChevronDown
                                    className={`accordion-chevron text-dark-400 transition-transform duration-300 flex-shrink-0 ml-4 ${openIndex === index ? 'open' : ''
                                        }`}
                                />
                            </button>

                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 pb-6 pt-0 pl-20">
                                            <p className="text-dark-400 leading-relaxed">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQAccordion;

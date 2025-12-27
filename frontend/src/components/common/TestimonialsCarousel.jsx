import { useState, useEffect } from 'react';
import { FaQuoteLeft, FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const TestimonialsCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const testimonials = [
        {
            name: 'Priya Sharma',
            role: 'Fashion Brand Owner',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
            rating: 5,
            text: "TheCollabify transformed our influencer marketing. We found perfect creators for our brand within hours. The AI matching is incredibly accurate!",
        },
        {
            name: 'Rahul Mehta',
            role: 'Lifestyle Creator • 250K Followers',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rahul',
            rating: 5,
            text: "Finally a platform that values creators! I've landed multiple brand deals and the payment process is seamless. Highly recommend!",
        },
        {
            name: 'Sneha Patel',
            role: 'Beauty & Skincare Brand',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sneha',
            rating: 5,
            text: "The campaign tracking and analytics are phenomenal. We can see real ROI from our influencer partnerships. Game changer!",
        },
        {
            name: 'Arjun Kapoor',
            role: 'Tech Creator • 500K Followers',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arjun',
            rating: 5,
            text: "Love how easy it is to find relevant brand partnerships. The platform connects me with brands that actually fit my niche.",
        },
        {
            name: 'Maya Reddy',
            role: 'Fitness Apparel Brand',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maya',
            rating: 5,
            text: "We've worked with 20+ creators through TheCollabify. The quality of matches and the ease of communication is unmatched.",
        }
    ];

    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isAutoPlaying, testimonials.length]);

    const goToSlide = (index) => {
        setCurrentIndex(index);
        setIsAutoPlaying(false);
    };

    const goToPrev = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
        setIsAutoPlaying(false);
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        setIsAutoPlaying(false);
    };

    return (
        <section className="py-24 px-4 relative overflow-hidden">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="gradient-text">What Our Users Say</span>
                    </h2>
                    <p className="text-dark-400 text-lg">
                        Trusted by creators and brands across India
                    </p>
                </div>

                <div className="carousel-container relative">
                    {/* Navigation Arrows */}
                    <button
                        onClick={goToPrev}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 rounded-full bg-dark-800/80 hover:bg-dark-700 border border-dark-600 flex items-center justify-center text-dark-300 hover:text-dark-100 transition-all"
                    >
                        <FaChevronLeft />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 rounded-full bg-dark-800/80 hover:bg-dark-700 border border-dark-600 flex items-center justify-center text-dark-300 hover:text-dark-100 transition-all"
                    >
                        <FaChevronRight />
                    </button>

                    {/* Carousel Track */}
                    <div
                        className="carousel-track"
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="carousel-slide px-8">
                                <div className="glass-card p-8 md:p-10 text-center">
                                    <FaQuoteLeft className="w-10 h-10 text-primary-500/30 mx-auto mb-6" />

                                    <p className="text-lg md:text-xl text-dark-200 mb-8 leading-relaxed">
                                        "{testimonial.text}"
                                    </p>

                                    <div className="flex justify-center mb-4">
                                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                                            <FaStar key={i} className="w-5 h-5 text-amber-400" />
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-center gap-4">
                                        <img
                                            src={testimonial.avatar}
                                            alt={testimonial.name}
                                            className="w-14 h-14 rounded-full bg-dark-700"
                                        />
                                        <div className="text-left">
                                            <div className="font-semibold text-dark-100">{testimonial.name}</div>
                                            <div className="text-sm text-dark-400">{testimonial.role}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Dots */}
                    <div className="flex justify-center gap-2 mt-8">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`carousel-dot ${currentIndex === index ? 'active' : ''}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TestimonialsCarousel;

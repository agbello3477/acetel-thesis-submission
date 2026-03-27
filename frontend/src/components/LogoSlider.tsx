import { useState, useEffect } from 'react';

const logos = [
    '/logo-1.png',
    '/logo-2.png'
];

export function LogoSlider({ className = '' }: { className?: string }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % logos.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
            {logos.map((src, index) => (
                <img
                    key={src}
                    src={src}
                    alt={`System Logo ${index + 1}`}
                    className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100 relative' : 'opacity-0'
                        }`}
                />
            ))}
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { SparklesIcon, InformationCircleIcon, ChartPieIcon } from './IconComponents';

interface InfoItem {
    id: number;
    text: string;
    icon: React.ReactNode;
}

const InfoCarousel: React.FC = () => {
    const items: InfoItem[] = [
        {
            id: 1,
            text: "Dica: Mantenha seus leads atualizados!",
            icon: <SparklesIcon className="w-5 h-5 text-yellow-400" />
        },
        {
            id: 2,
            text: "Com dúvidas sobre o app? Visite nosso guia de uso",
            icon: <InformationCircleIcon className="w-5 h-5 text-blue-400" />
        },
        {
            id: 3,
            text: "Novo Recurso: Exportação de PDF disponível",
            icon: <ChartPieIcon className="w-5 h-5 text-green-400" />
        }
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
                setIsAnimating(false);
            }, 300); // 300ms fade out
        }, 5000); // 5 seconds per slide

        return () => clearInterval(interval);
    }, [items.length]);

    return (
        <div className="glass-card rounded-2xl flex items-center px-4 w-full md:w-auto h-full min-h-[60px] relative overflow-hidden flex-1 md:flex-none md:min-w-[300px]">
            <div
                className={`flex items-center gap-3 w-full transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
            >
                <div className="flex-shrink-0 p-2 bg-black/10 rounded-full">
                    {items[currentIndex].icon}
                </div>
                <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                    {items[currentIndex].text}
                </p>
            </div>

            {/* Indicators */}
            <div className="absolute bottom-2 right-4 flex gap-1">
                {items.map((_, idx) => (
                    <div
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-brand-accent w-3' : 'bg-[var(--color-text-secondary)]/30'}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default InfoCarousel;

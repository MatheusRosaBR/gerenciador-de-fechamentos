import React, { useState, useEffect, useRef } from 'react';
import { XIcon, ChevronRightIcon } from './IconComponents';

export interface TourStep {
    targetId: string;
    title: string;
    description: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTourProps {
    steps: TourStep[];
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ steps, isOpen, onClose, onComplete }) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

    // Reset step when opened
    useEffect(() => {
        if (isOpen) {
            setCurrentStepIndex(0);
        }
    }, [isOpen]);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Update target position
    useEffect(() => {
        if (!isOpen) return;

        const updatePosition = () => {
            const step = steps[currentStepIndex];
            const element = document.getElementById(step.targetId);

            if (element) {
                const rect = element.getBoundingClientRect();
                // Ensure we scroll to the element if needed
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTargetRect(rect);
            } else {
                // If element not found, skip to next or close if stuck
                console.warn(`Tour target #${step.targetId} not found`);
                // Optional: Auto-skip logic can be dangerous if recursive, simply do nothing or show fallback
            }
        };

        // Little delay to allow UI to settle/scroll
        const timer = setTimeout(updatePosition, 100);
        window.addEventListener('scroll', updatePosition);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('scroll', updatePosition);
        };
    }, [currentStepIndex, isOpen, steps, windowSize]);

    if (!isOpen || !targetRect) return null;

    const currentStep = steps[currentStepIndex];
    const isLastStep = currentStepIndex === steps.length - 1;

    const handleNext = () => {
        if (isLastStep) {
            onComplete();
        } else {
            setCurrentStepIndex(prev => prev + 1);
        }
    };

    // Calculate Tooltip Position
    // Default logic: try to put it according to preference, flip if no space
    const tooltipStyle: React.CSSProperties = {
        position: 'fixed',
        zIndex: 60,
        width: '320px',
        maxWidth: '90vw',
    };

    // Simple positioning logic
    let top = 0;
    let left = 0;
    const gap = 12;

    // Check available space
    const spaceTop = targetRect.top;
    const spaceBottom = windowSize.height - targetRect.bottom;
    const spaceLeft = targetRect.left;
    const spaceRight = windowSize.width - targetRect.right;

    let pos = currentStep.position || 'bottom';

    // Auto-flip if needed
    if (pos === 'bottom' && spaceBottom < 200 && spaceTop > 200) pos = 'top';
    if (pos === 'top' && spaceTop < 200 && spaceBottom > 200) pos = 'bottom';

    if (pos === 'bottom') {
        top = targetRect.bottom + gap;
        left = targetRect.left + (targetRect.width / 2) - 160; // Center horiz
    } else if (pos === 'top') {
        top = targetRect.top - gap - 200; // Approx height
        // recalculate exact height with ref in real implementation, for now approx
        left = targetRect.left + (targetRect.width / 2) - 160;
    } else if (pos === 'left') {
        top = targetRect.top;
        left = targetRect.left - 320 - gap;
    } else if (pos === 'right') {
        top = targetRect.top;
        left = targetRect.right + gap;
    }

    // Bound to screen
    if (left < 10) left = 10;
    if (left + 320 > windowSize.width - 10) left = windowSize.width - 330;
    if (top < 10) top = 10; // Simple bounding

    // Refine 'top' positioning for 'top' placement is tricky without known height. 
    // We will use flex placement instead or just simple absolute top/left.
    // For specific requirement robustness, let's stick to absolute.

    return (
        <div className="fixed inset-0 z-50 pointer-events-auto">
            {/* Backdrop with cutout using mask-image or massive box-shadow */}
            {/* Using standard big box-shadow trick for simplicity and performance */}
            <div
                className="absolute transition-all duration-300 ease-out border-2 border-brand-accent rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] pointer-events-none"
                style={{
                    top: targetRect.top - 4,
                    left: targetRect.left - 4,
                    width: targetRect.width + 8,
                    height: targetRect.height + 8,
                    borderRadius: '8px' // Can adjust if target is circle
                }}
            />

            {/* Tooltip */}
            <div
                className="absolute bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-6 rounded-xl shadow-2xl flex flex-col gap-4 animate-fade-in transition-all duration-300"
                style={{
                    top: pos === 'top' ? 'auto' : top,
                    bottom: pos === 'top' ? (windowSize.height - targetRect.top + gap) : 'auto',
                    left: left,
                    width: '320px',
                    maxWidth: '90vw'
                }}
            >
                {/* Close/Skip */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                    <XIcon className="w-5 h-5" />
                </button>

                {/* Content */}
                <div>
                    <span className="text-xs font-bold text-brand-accent uppercase tracking-wider">
                        Passo {currentStepIndex + 1} de {steps.length}
                    </span>
                    <h3 className="text-lg font-bold text-[var(--color-text-primary)] mt-1 mb-2">
                        {currentStep.title}
                    </h3>
                    <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                        {currentStep.description}
                    </p>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-between pt-2">
                    <button
                        onClick={onClose}
                        className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                    >
                        Pular tour
                    </button>
                    <button
                        onClick={handleNext}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-white text-sm font-bold rounded-lg shadow-lg shadow-brand-accent/20 hover:bg-opacity-90 transition-all active:scale-95"
                    >
                        {isLastStep ? 'Concluir' : 'Próximo'}
                        {!isLastStep && <ChevronRightIcon className="w-4 h-4" />}
                    </button>
                </div>

                {/* Arrow (optional visual flair) */}

            </div>
        </div>
    );
};

export default OnboardingTour;

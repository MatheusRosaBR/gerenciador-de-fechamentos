import React, { useState, useRef, useEffect } from 'react';
import { XIcon, CheckCircleIcon } from './IconComponents';

interface ImageCropperProps {
    imageSrc: string;
    onCancel: () => void;
    onCrop: (croppedImage: string) => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onCancel, onCrop }) => {
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial Image Load
    useEffect(() => {
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
            const containerSize = 300;
            // Calculate scale to fit the image entirely within the container (contain)
            const scaleX = containerSize / img.width;
            const scaleY = containerSize / img.height;
            // Use the smaller scale so the entire image fits
            const initialScale = Math.min(scaleX, scaleY);

            setZoom(initialScale);

            // Center the image if needed (optional, but good for UX)
            // For now, let's start centered (0,0 offset translates to center-to-center in our render logic)
            setOffset({ x: 0, y: 0 });
        };
        // @ts-ignore
        imageRef.current = img;
    }, [imageSrc]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setOffset({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleCrop = () => {
        const canvas = document.createElement('canvas');
        const size = 300; // Output size
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx || !imageRef.current || !containerRef.current) return;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, size, size);

        const scale = zoom;
        const cx = size / 2;
        const cy = size / 2;

        ctx.translate(cx + offset.x, cy + offset.y);
        ctx.scale(scale, scale);
        ctx.drawImage(imageRef.current, -imageRef.current.width / 2, -imageRef.current.height / 2);

        onCrop(canvas.toDataURL('image/jpeg', 0.9));
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[var(--color-bg-surface)] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-modal-enter border border-[var(--color-border)]">
                <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center">
                    <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Ajustar Foto</h3>
                    <button onClick={onCancel} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 flex flex-col items-center gap-6">
                    {/* Crop Area */}
                    <div
                        ref={containerRef}
                        className="relative w-[300px] h-[300px] bg-black/50 overflow-hidden cursor-move rounded-lg touch-none select-none"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        {/* Image Layer */}
                        <div
                            style={{
                                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                                transformOrigin: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '100%',
                                height: '100%'
                            }}
                        >
                            <img
                                src={imageSrc}
                                alt="Upload Preview"
                                className="max-w-none pointer-events-none"
                                draggable={false}
                            />
                        </div>

                        {/* Overlay Layer (Grid + Mask) */}
                        <div className="absolute inset-0 pointer-events-none">
                            <svg width="100%" height="100%" viewBox="0 0 300 300" preserveAspectRatio="none">
                                <defs>
                                    <mask id="circle-mask">
                                        <rect width="100%" height="100%" fill="white" />
                                        <circle cx="150" cy="150" r="125" fill="black" />
                                    </mask>
                                </defs>
                                <rect width="100%" height="100%" fill="rgba(0,0,0,0.5)" mask="url(#circle-mask)" />
                                <line x1="150" y1="25" x2="150" y2="275" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                                <line x1="25" y1="150" x2="275" y2="150" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                                <circle cx="150" cy="150" r="125" stroke="white" strokeWidth="2" fill="none" />
                            </svg>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="w-full max-w-xs space-y-2">
                        <label className="text-xs text-[var(--color-text-secondary)] font-medium">Zoom</label>
                        <input
                            type="range"
                            min="0.1"
                            max="3"
                            step="0.05"
                            value={zoom}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="w-full accent-brand-accent cursor-pointer"
                        />
                    </div>

                    <div className="flex gap-3 w-full justify-end">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleCrop}
                            className="px-6 py-2 bg-brand-accent hover:bg-opacity-90 text-[var(--color-text-accent)] text-sm font-bold rounded-lg shadow-md transition-all flex items-center gap-2"
                        >
                            <CheckCircleIcon className="w-4 h-4" />
                            Salvar Foto
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageCropper;

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from './IconComponents';
import { maskDate } from '../utils/formatters';

interface DatePickerProps {
    label: string;
    value: string;
    onChange: (date: string) => void;
    error?: string;
    required?: boolean;
    name?: string;
    placeholder?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ label, value, onChange, error, required, name, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const popupRef = useRef<HTMLDivElement>(null);

    // Helper to parse "DD/MM/YYYY" to Date
    const parseDate = (dateStr: string): Date | null => {
        if (!dateStr || dateStr.length !== 10) return null;
        const [day, month, year] = dateStr.split('/').map(Number);
        const date = new Date(year, month - 1, day);
        if (isNaN(date.getTime())) return null;
        return date;
    };

    // Initialize month view based on value
    useEffect(() => {
        const date = parseDate(value);
        if (date) {
            setCurrentMonth(date);
        }
    }, [value, isOpen]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const daysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getDayOfWeek = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const handleDateSelect = (day: number) => {
        const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const dayStr = String(day).padStart(2, '0');
        const monthStr = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const yearStr = selectedDate.getFullYear();
        onChange(`${dayStr}/${monthStr}/${yearStr}`);
        setIsOpen(false);
    };

    const renderDays = () => {
        const days = [];
        const totalDays = daysInMonth(currentMonth);
        const startDay = getDayOfWeek(currentMonth);
        const selectedDate = parseDate(value);

        // Empty cells for days before start of month
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
        }

        for (let i = 1; i <= totalDays; i++) {
            const isSelected = selectedDate &&
                selectedDate.getDate() === i &&
                selectedDate.getMonth() === currentMonth.getMonth() &&
                selectedDate.getFullYear() === currentMonth.getFullYear();

            const isToday = new Date().getDate() === i &&
                new Date().getMonth() === currentMonth.getMonth() &&
                new Date().getFullYear() === currentMonth.getFullYear();

            days.push(
                <button
                    key={i}
                    type="button"
                    onClick={() => handleDateSelect(i)}
                    className={`h-8 w-8 rounded-full text-sm flex items-center justify-center transition-colors
            ${isSelected
                            ? 'bg-brand-accent text-[var(--color-text-accent)] font-bold shadow-md shadow-brand-accent/30'
                            : 'hover:bg-[var(--color-bg-muted)] text-[var(--color-text-primary)]'}
            ${!isSelected && isToday ? 'border border-brand-accent text-brand-accent font-semibold' : ''}
          `}
                >
                    {i}
                </button>
            );
        }
        return days;
    };

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    return (
        <div className="relative" ref={popupRef}>
            <label htmlFor={name} className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative group">
                <input
                    type="text"
                    id={name}
                    name={name}
                    value={value}
                    onChange={(e) => onChange(maskDate(e.target.value))}
                    onClick={() => setIsOpen(!isOpen)}
                    placeholder={placeholder}
                    className={`w-full bg-[var(--color-bg-surface)] border rounded-md p-2 text-[var(--color-text-primary)] focus:ring-brand-accent focus:border-brand-accent transition-colors cursor-pointer
                    ${error ? 'border-red-500' : 'border-[var(--color-border)]'}
                `}
                    aria-invalid={!!error}
                />
                <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-accent pointer-events-none transition-transform group-hover:scale-110" />
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

            {isOpen && (
                <div className="absolute z-50 mt-1 p-4 rounded-xl shadow-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] w-64 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-4">
                        <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-[var(--color-bg-muted)] rounded-full text-[var(--color-text-secondary)]">
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <span className="font-semibold text-[var(--color-text-primary)]">
                            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </span>
                        <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-[var(--color-bg-muted)] rounded-full text-[var(--color-text-secondary)]">
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="grid grid-cols-7 gap-y-2 text-center">
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                            <div key={day} className="text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                                {day}
                            </div>
                        ))}
                        {renderDays()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatePicker;

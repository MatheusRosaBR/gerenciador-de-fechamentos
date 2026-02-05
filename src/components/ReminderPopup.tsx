import React, { useState, useRef, useEffect } from 'react';
import { Contract, SaleContract } from '../types';
import { BellIcon } from './IconComponents';
import { parseDateString } from '../utils/formatters';

type ReminderItem = (Contract | SaleContract) & { daysUntilDue: number };

interface ReminderPopupProps {
  reminders: ReminderItem[];
  onSelectReminder: (item: Contract | SaleContract) => void;
}

const ReminderPopup: React.FC<ReminderPopupProps> = ({ reminders, onSelectReminder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (item: Contract | SaleContract) => {
    onSelectReminder(item);
    setIsOpen(false);
  };

  const getDaysText = (days: number) => {
    if (days === 0) return 'Vence hoje';
    if (days === 1) return 'Vence amanhã';
    return `Vence em ${days} dias`;
  };

  return (
    <div className="relative" ref={popupRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative text-[var(--color-text-secondary)] hover:text-brand-accent transition-colors p-2 rounded-full hover:bg-[var(--color-bg-surface)]/50"
        aria-label={`Você tem ${reminders.length} lembretes pendentes`}
      >
        <BellIcon className="w-6 h-6" />
        {reminders.length > 0 && (
          <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold ring-2 ring-[var(--color-bg-surface)]">
            {reminders.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-[var(--color-bg-surface)] rounded-xl shadow-2xl border border-[var(--color-border)] z-30 animate-fade-in-down">
          <div className="p-3 border-b border-[var(--color-border)]">
            <h3 className="font-semibold text-[var(--color-text-primary)]">Lembretes Próximos</h3>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {reminders.length > 0 ? (
              <ul>
                {reminders.map(reminder => (
                  <li key={reminder.id}>
                    <button 
                      onClick={() => handleSelect(reminder)}
                      className="w-full text-left px-3 py-2 hover:bg-black/5 transition-colors"
                    >
                      <p className="font-medium text-sm text-[var(--color-text-primary)]">{reminder.cliente}</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        {reminder.imovel} - <span className="font-semibold text-red-600">{getDaysText(reminder.daysUntilDue)}</span>
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-4 text-sm text-center text-[var(--color-text-secondary)]">Nenhum lembrete próximo.</p>
            )}
          </div>
        </div>
      )}
       <style>{`
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ReminderPopup;
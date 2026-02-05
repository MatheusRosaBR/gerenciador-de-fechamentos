import React, { useState, useEffect } from 'react';
import { XIcon, SaveIcon } from './IconComponents';
import { useLockBodyScroll } from '../utils/useLockBodyScroll';

interface GoalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: number, period: string) => void;
  currentGoal: number;
  currentPeriod: string;
  title: string;
}

const GoalSettingsModal: React.FC<GoalSettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentGoal,
  currentPeriod,
  title
}) => {
  useLockBodyScroll();
  const [goal, setGoal] = useState(String(currentGoal));
  const [period, setPeriod] = useState(currentPeriod);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setGoal(String(currentGoal));
      setPeriod(currentPeriod);
      setError('');
    }
  }, [isOpen, currentGoal, currentPeriod]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    const goalValue = parseInt(goal, 10);
    if (isNaN(goalValue) || goalValue <= 0) {
      setError('A meta deve ser um número positivo.');
      return;
    }
    setError('');
    onSave(goalValue, period.trim());
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="goal-settings-title"
    >
      <div
        className="bg-[var(--color-bg-surface)] rounded-xl shadow-2xl w-full max-w-md relative transform transition-all duration-300 scale-95 animate-modal-enter border border-[var(--color-border)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center">
          <h2 id="goal-settings-title" className="text-xl font-bold text-[var(--color-text-primary)]">{title}</h2>
          <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors" aria-label="Fechar modal">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="goalValue" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Meta de Fechamentos</label>
            <input
              type="number"
              id="goalValue"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Ex: 100"
              className={`w-full bg-[var(--color-bg-surface)] border rounded-md p-2 text-[var(--color-text-primary)] focus:ring-brand-accent focus:border-brand-accent transition-colors ${error ? 'border-red-500' : 'border-[var(--color-border)]'}`}
              aria-invalid={!!error}
              aria-describedby={error ? 'goal-error' : undefined}
            />
            {error && <p id="goal-error" className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
          <div>
            <label htmlFor="goalPeriod" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Período da Meta (Opcional)</label>
            <input
              type="text"
              id="goalPeriod"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="Ex: 2025, Último Trimestre"
              className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-md p-2 text-[var(--color-text-primary)] focus:ring-brand-accent focus:border-brand-accent transition-colors"
            />
          </div>
        </div>

        <div className="p-6 bg-[var(--color-bg-muted)]/50 rounded-b-lg flex justify-end gap-4">
          <button onClick={onClose} className="bg-[var(--color-bg-surface)]/60 hover:bg-[var(--color-bg-surface)]/80 border border-[var(--color-border)] text-[var(--color-text-secondary)] font-bold py-2 px-4 rounded-lg transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} className="bg-brand-accent hover:bg-opacity-90 text-[var(--color-text-accent)] font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-violet-500/30">
            <SaveIcon className="w-5 h-5" />
            <span>Salvar</span>
          </button>
        </div>
      </div>
      <style>{`
        @keyframes modal-enter {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-modal-enter {
          animation: modal-enter 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default GoalSettingsModal;
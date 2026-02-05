import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LockClosedIcon, EnvelopeIcon, PhoneIcon, EyeIcon, EyeSlashIcon, ChartPieIcon, CheckCircleIcon, UserIcon } from './IconComponents';
import LegalDocs from './LegalDocs';

interface LoginProps {
    onLoginSuccess: () => void;
}

const MarketingBanner = () => (
    <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[var(--color-bg-surface)] border-r border-[var(--color-border)] p-12 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-accent/10 to-transparent pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-accent/20 rounded-full blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-brand-accent rounded-lg shadow-lg shadow-brand-accent/20">
                    <ChartPieIcon className="w-8 h-8 text-white" />
                </div>
                <span className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Gerenciador Pro</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-bold text-[var(--color-text-primary)] mb-6 leading-tight">
                Transforme seus fechamentos em <span className="text-brand-accent">resultados previsíveis</span>.
            </h1>
            <p className="text-[var(--color-text-secondary)] text-lg max-w-md leading-relaxed mb-12">
                Acompanhe suas metas, gerencie comissões e tenha clareza total sobre seu desempenho financeiro em um único lugar.
            </p>

            <div className="space-y-4">
                <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                    <CheckCircleIcon className="w-5 h-5 text-brand-accent" />
                    <span>Controle total de comissões</span>
                </div>
                <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                    <CheckCircleIcon className="w-5 h-5 text-brand-accent" />
                    <span>Metas e previsibilidade financeira</span>
                </div>
                <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                    <CheckCircleIcon className="w-5 h-5 text-brand-accent" />
                    <span>Relatórios automáticos e inteligentes</span>
                </div>
            </div>
        </div>

        <div className="relative z-10 text-sm text-[var(--color-text-secondary)]/60 mt-8">
            © 2024 Gerenciador de Fechamentos. Todos os direitos reservados.
        </div>
    </div>
);

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    // LGPD State
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [acceptedComms, setAcceptedComms] = useState(false);
    const [legalDocsOpen, setLegalDocsOpen] = useState(false);
    const [legalDocsTab, setLegalDocsTab] = useState<'terms' | 'privacy'>('terms');

    const handleOpenLegal = (tab: 'terms' | 'privacy') => {
        setLegalDocsTab(tab);
        setLegalDocsOpen(true);
    };

    const formatPhone = (value: string) => {
        // Remove non-digit characters
        let numbers = value.replace(/\D/g, '');

        // Prevent duplication of the country code if the user edits the input
        // formatting adds '55' at the start, so we strip it to get the raw numbers
        if (numbers.startsWith('55')) {
            numbers = numbers.substring(2);
        }

        // Limit to 11 digits
        const truncated = numbers.slice(0, 11);

        // Apply mask: +55 (99) 99999-9999
        if (truncated.length === 0) return '';
        if (truncated.length <= 2) return `+55 (${truncated}`;
        if (truncated.length <= 7) return `+55 (${truncated.slice(0, 2)}) ${truncated.slice(2)}`;
        return `+55 (${truncated.slice(0, 2)}) ${truncated.slice(2, 7)}-${truncated.slice(7)}`;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(formatPhone(e.target.value));
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        // Basic Validation
        if (isSignUp) {
            if (!name.trim()) {
                setError('Por favor, preencha seu nome.');
                setLoading(false);
                return;
            }
            if (password !== confirmPassword) {
                setError('As senhas não coincidem.');
                setLoading(false);
                return;
            }
            if (phone.length < 17) { // Simple check for mask completion
                setError('Por favor, preencha o telefone completo.');
                setLoading(false);
                return;
            }
            if (!acceptedTerms) {
                setError('Você precisa aceitar os Termos de Uso e Política de Privacidade.');
                setLoading(false);
                return;
            }
        }

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: name, // Save name to metadata
                            phone: phone, // Save phone to user metadata
                            accepted_terms_at: new Date().toISOString(),
                            accepted_comms: acceptedComms
                        }
                    }
                });
                if (error) throw error;
                setMessage('Cadastro realizado! Verifique seu e-mail para confirmar a conta.');
                setIsSignUp(false);
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                onLoginSuccess();
            }
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro na autenticação');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[var(--color-bg-base)] text-[var(--color-text-primary)]">
            {/* Left Side - Banner */}
            <MarketingBanner />

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
                {/* Mobile Background Effect */}
                <div className="absolute inset-0 lg:hidden bg-gradient-to-b from-brand-accent/5 to-transparent pointer-events-none" />

                <div className="w-full max-w-[400px] animate-fade-in relative z-10">
                    <div className="text-center mb-10 lg:text-left">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-accent/20 rounded-xl mb-4 lg:hidden">
                            <LockClosedIcon className="w-6 h-6 text-brand-accent" />
                        </div>
                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-primary)] to-[var(--color-text-secondary)]">
                            {isSignUp ? 'Criar nova conta' : 'Bem-vindo de volta'}
                        </h2>
                        <p className="text-[var(--color-text-secondary)] mt-2 text-base">
                            {isSignUp ? 'Preencha seus dados para começar.' : 'Digite suas credenciais para acessar.'}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-5">
                        {isSignUp && (
                            <div className="animate-fade-in-down space-y-1.5">
                                <label className="text-sm font-medium text-[var(--color-text-secondary)] ml-1" htmlFor="name">
                                    Nome Completo
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <UserIcon className="h-5 w-5 text-[var(--color-text-secondary)] group-focus-within:text-brand-accent transition-colors" />
                                    </div>
                                    <input
                                        id="name"
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-all"
                                        placeholder="Seu nome completo"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[var(--color-text-secondary)] ml-1" htmlFor="email">
                                E-mail corporativo
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <EnvelopeIcon className="h-5 w-5 text-[var(--color-text-secondary)] group-focus-within:text-brand-accent transition-colors" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-all"
                                    placeholder="seu@email.com"
                                />
                            </div>
                        </div>

                        {isSignUp && (
                            <div className="animate-fade-in-down space-y-1.5">
                                <label className="text-sm font-medium text-[var(--color-text-secondary)] ml-1" htmlFor="phone">
                                    WhatsApp
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <PhoneIcon className="h-5 w-5 text-[var(--color-text-secondary)] group-focus-within:text-brand-accent transition-colors" />
                                    </div>
                                    <input
                                        id="phone"
                                        type="text"
                                        required
                                        value={phone}
                                        onChange={handlePhoneChange}
                                        className="block w-full pl-10 pr-3 py-3 bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-all"
                                        placeholder="+55 (99) 99999-9999"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[var(--color-text-secondary)] ml-1" htmlFor="password">
                                Senha
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockClosedIcon className="h-5 w-5 text-[var(--color-text-secondary)] group-focus-within:text-brand-accent transition-colors" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-10 py-3 bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--color-text-secondary)] hover:text-brand-accent transition-colors focus:outline-none"
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="h-5 w-5" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {isSignUp && password.length > 0 && (
                            <div className="animate-fade-in-down space-y-1.5">
                                <label className="text-sm font-medium text-[var(--color-text-secondary)] ml-1" htmlFor="confirmPassword">
                                    Confirmar Senha
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LockClosedIcon className="h-5 w-5 text-[var(--color-text-secondary)] group-focus-within:text-brand-accent transition-colors" />
                                    </div>
                                    <input
                                        id="confirmPassword"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full pl-10 pr-10 py-3 bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        )}

                        {isSignUp && (
                            <div className="animate-fade-in-down space-y-3 pt-2">
                                <div className="flex items-start gap-3">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="terms"
                                            name="terms"
                                            type="checkbox"
                                            checked={acceptedTerms}
                                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                                            className="h-4 w-4 text-brand-accent focus:ring-brand-accent border-[var(--color-border)] rounded bg-[var(--color-bg-muted)] cursor-pointer"
                                        />
                                    </div>
                                    <label htmlFor="terms" className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                                        Li e aceito os <button type="button" onClick={() => handleOpenLegal('terms')} className="text-brand-accent hover:underline font-medium">Termos de Uso</button> e a <button type="button" onClick={() => handleOpenLegal('privacy')} className="text-brand-accent hover:underline font-medium">Política de Privacidade</button>.
                                    </label>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="comms"
                                            name="comms"
                                            type="checkbox"
                                            checked={acceptedComms}
                                            onChange={(e) => setAcceptedComms(e.target.checked)}
                                            className="h-4 w-4 text-brand-accent focus:ring-brand-accent border-[var(--color-border)] rounded bg-[var(--color-bg-muted)] cursor-pointer"
                                        />
                                    </div>
                                    <label htmlFor="comms" className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                                        (Opcional) Aceito receber novidades, dicas e comunicações sobre a plataforma via E-mail ou WhatsApp.
                                    </label>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm animate-shake text-center">
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-sm text-center">
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-lg shadow-brand-accent/20 text-sm font-bold text-white bg-brand-accent hover:bg-opacity-90 hover:shadow-brand-accent/30 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.99] mt-6"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                isSignUp ? 'Criar minha conta' : 'Entrar na Plataforma'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center pt-6">
                        <p className="text-sm text-[var(--color-text-secondary)]">
                            {isSignUp ? 'Já tem acesso? ' : 'Ainda não é membro? '}
                            <button
                                onClick={() => {
                                    setIsSignUp(!isSignUp);
                                    setError(null);
                                    setMessage(null);
                                }}
                                className="font-semibold text-brand-accent hover:text-brand-accent/80 transition-colors focus:outline-none underline-offset-2 hover:underline"
                            >
                                {isSignUp ? 'Fazer Login' : 'Criar conta gratuita'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
            </div>
            <LegalDocs isOpen={legalDocsOpen} onClose={() => setLegalDocsOpen(false)} initialTab={legalDocsTab} />
        </div >
    );
};

export default Login;

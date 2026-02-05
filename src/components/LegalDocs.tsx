import React from 'react';
import { XIcon } from './IconComponents';

interface LegalDocsProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: 'terms' | 'privacy';
}

const LegalDocs: React.FC<LegalDocsProps> = ({ isOpen, onClose, initialTab = 'terms' }) => {
    const [activeTab, setActiveTab] = React.useState<'terms' | 'privacy'>(initialTab);

    React.useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
        }
    }, [isOpen, initialTab]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-[var(--color-bg-surface)] rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col relative animate-fade-in-down border border-[var(--color-border)]">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-[var(--color-border)]">
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Documentação Legal</h2>
                    <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[var(--color-border)]">
                    <button
                        onClick={() => setActiveTab('terms')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'terms'
                            ? 'text-brand-accent border-b-2 border-brand-accent bg-brand-accent/5'
                            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                            }`}
                    >
                        Termos de Uso
                    </button>
                    <button
                        onClick={() => setActiveTab('privacy')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'privacy'
                            ? 'text-brand-accent border-b-2 border-brand-accent bg-brand-accent/5'
                            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                            }`}
                    >
                        Política de Privacidade
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar text-[var(--color-text-secondary)] text-sm leading-relaxed space-y-4">
                    {activeTab === 'terms' ? (
                        <>
                            <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">Termos de Uso</h3>
                            <p><strong>1. Aceitação dos Termos:</strong> Ao criar uma conta e utilizar esta plataforma ("Gerenciador Pro"), você concorda com estes Termos de Uso. O uso contínuo da plataforma implica na aceitação de quaisquer atualizações futuras destes termos.</p>

                            <p><strong>2. Uso da Plataforma:</strong> Esta ferramenta destina-se ao gerenciamento de comissões e fechamentos imobiliários. Você é responsável pela veracidade dos dados inseridos e pela segurança de sua senha de acesso.</p>

                            <p><strong>3. Responsabilidades:</strong> A plataforma é fornecida "como está". Não nos responsabilizamos por perdas financeiras decorrentes de dados inseridos incorretamente pelo usuário ou por falhas na conexão de internet.</p>

                            <p><strong>4. Propriedade Intelectual:</strong> Todo o software, design e código são propriedade exclusiva dos desenvolvedores. É proibida a engenharia reversa, cópia ou distribuição não autorizada.</p>

                            <p><strong>5. Cancelamento:</strong> Você pode excluir sua conta e dados a qualquer momento através das configurações do aplicativo.</p>
                        </>
                    ) : (
                        <>
                            <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">Política de Privacidade</h3>
                            <p><strong>1. Coleta de Dados:</strong> Coletamos apenas os dados necessários para o funcionamento do serviço: Nome, E-mail, Telefone e os dados operacionais (contratos e vendas) que você insere.</p>

                            <p><strong>2. Uso dos Dados:</strong> Seus dados são utilizados exclusivamente para:
                                <ul className="list-disc pl-5 mt-1">
                                    <li>Fornecer o serviço de gestão e relatórios.</li>
                                    <li>Autenticação e segurança da conta.</li>
                                    <li>Comunicações importantes sobre sua conta (caso autorizado).</li>
                                </ul>
                            </p>

                            <p><strong>3. Armazenamento:</strong> Seus dados são armazenados em servidores seguros na nuvem (Supabase), com proteção criptográfica padrão da indústria.</p>

                            <p><strong>4. Compartilhamento:</strong> Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins de marketing. Poderemos compartilhar dados apenas se exigido por lei.</p>

                            <p><strong>5. Seus Direitos (LGPD):</strong> Você tem direito a acessar, corrigir, exportar ou excluir seus dados pessoais a qualquer momento, diretamente através da interface do aplicativo.</p>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-muted)]/50 rounded-b-xl flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-brand-accent text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-opacity-90 transition-colors"
                    >
                        Entendi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LegalDocs;

import React, { useState, useEffect } from 'react';
import { XIcon, UserCircleIcon, SparklesIcon, ArchiveBoxArrowDownIcon, DocumentChartBarIcon, ShieldCheckIcon, SaveIcon, TrashIcon, ArrowDownTrayIcon } from './IconComponents';
import { themes, Theme } from './themes';
import { Contract, SaleContract, ProfileData } from '../types';
import ImageCropper from './ImageCropper';
import { formatCurrencyBRL } from '../utils/formatters';
import { useLockBodyScroll } from '../utils/useLockBodyScroll';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ...

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: ProfileData;
  onProfileSave: (data: ProfileData) => void;
  activeTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  onAppReset: () => void;
  contracts: Contract[];
  sales: SaleContract[];
}

type ActiveTab = 'perfil' | 'temas' | 'restauracao' | 'relatorios';

const ThemeSwatch: React.FC<{ theme: Theme, activeTheme: Theme, onSelect: (theme: Theme) => void }> = ({ theme, activeTheme, onSelect }) => {
  const isActive = theme.name === activeTheme.name;
  return (
    <div className="flex flex-col items-center gap-2 cursor-pointer group" onClick={() => onSelect(theme)}>
      <div
        className={`w-14 h-14 rounded-full transition-all duration-200 flex items-center justify-center relative ring-offset-[var(--color-bg-surface)] group-hover:ring-4 group-hover:ring-brand-accent/50 ${isActive ? 'ring-4 ring-brand-accent' : 'ring-1 ring-[var(--color-border)]'}`}
        style={{ backgroundColor: theme.colors['--color-brand-accent'] }}
        aria-label={`Selecionar tema ${theme.name}`}
      >
        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.colors['--color-bg-base'] }}></div>
        {isActive && (
          <div className="absolute -top-1 -right-1 bg-brand-accent rounded-full p-0.5 ring-2 ring-[var(--color-bg-surface)]">
            <svg className="w-4 h-4" style={{ color: theme.colors['--color-text-accent'] }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      <p className={`text-xs font-medium text-center text-[var(--color-text-secondary)] transition-colors ${isActive ? 'text-brand-accent font-bold' : 'group-hover:text-[var(--color-text-primary)]'}`}>
        {theme.name}
      </p>
    </div>
  );
};

const NavItem: React.FC<{ tabName: ActiveTab; label: string; icon: React.ReactNode; activeTab: ActiveTab; onClick: (tab: ActiveTab) => void; }> = ({ tabName, label, icon, activeTab, onClick }) => (
  <button
    onClick={() => onClick(tabName)}
    className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:px-3 md:py-2.5 text-xs md:text-sm font-medium rounded-lg transition-colors duration-200 flex-1 md:flex-none md:w-full text-center ${activeTab === tabName
      ? 'bg-brand-accent/10 text-brand-accent'
      : 'text-[var(--color-text-secondary)] hover:bg-black/5 hover:text-[var(--color-text-primary)]'
      }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const ContentPanel: React.FC<{ tabName: ActiveTab; title: string; children: React.ReactNode; icon: React.ReactNode; activeTab: ActiveTab; }> = ({ tabName, title, children, icon, activeTab }) => (
  <div className={` ${activeTab === tabName ? 'block animate-fade-in' : 'hidden'}`}>
    <div className="flex items-center gap-3 mb-6">
      <div className="text-brand-accent">{icon}</div>
      <h3 className="text-xl font-bold text-[var(--color-text-primary)]">{title}</h3>
    </div>
    <div className="text-[var(--color-text-secondary)] space-y-2">
      {children}
    </div>
  </div>
);

const ProfileInputField: React.FC<{ id: string; label: string; type: string; value: string; name: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ id, label, type, value, name, onChange }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{label}</label>
    <input
      type={type}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-md p-2.5 text-[var(--color-text-primary)] focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-colors"
    />
  </div>
);

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, profileData, onProfileSave, activeTheme, onThemeChange, onAppReset, contracts, sales }) => {
  useLockBodyScroll();
  const [activeTab, setActiveTab] = useState<ActiveTab>('perfil');
  const [formData, setFormData] = useState<ProfileData>(profileData);

  // Cropper State
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(profileData);
    }
  }, [isOpen, profileData]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleTwoFactor = () => {
    setFormData(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }));
  };

  const handleSave = () => {
    onProfileSave(formData);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert("O arquivo é muito grande. Máximo 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setTempImageSrc(reader.result as string);
        setIsCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    setFormData(prev => ({ ...prev, avatar: croppedImage }));
    setIsCropperOpen(false);
    setTempImageSrc(null);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString('pt-BR');
    const brandAccentColor = getComputedStyle(document.documentElement).getPropertyValue('--color-brand-accent').trim() || '#6d28d9';
    const primaryColor = [15, 23, 42]; // Slate 900

    // Header Color Bar
    doc.setFillColor(brandAccentColor);
    doc.rect(0, 0, 210, 15, 'F');

    // Title & Logo-like text
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('IMOBILIÁRIA PRO', 14, 10);

    // Document Info
    doc.setFontSize(18);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Relatório de Fechamentos', 14, 30);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Consultor: ${profileData.name}`, 14, 38);
    doc.text(`E-mail: ${profileData.email}`, 14, 43);
    doc.text(`Data de Emissão: ${today}`, 140, 38);

    doc.setDrawColor(200);
    doc.line(14, 48, 196, 48);

    // Summary Calculations
    const totalVglLocacao = contracts.reduce((sum, c) => sum + c.valorLocacao, 0);
    const totalComissaoLocacao = contracts.reduce((sum, c) => sum + c.comissao, 0);
    const totalVglVendas = sales.reduce((sum, s) => sum + s.valorVenda, 0);
    const totalComissaoVendas = sales.reduce((sum, s) => sum + s.comissao, 0);

    // Summary Box
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(14, 55, 182, 30, 3, 3, 'F');

    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMO GERAL', 20, 62);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Total VGL (Geral): ${formatCurrencyBRL(totalVglLocacao + totalVglVendas)}`, 20, 70);
    doc.text(`Total Comissões: ${formatCurrencyBRL(totalComissaoLocacao + totalComissaoVendas)}`, 20, 77);

    doc.text(`Locações: ${contracts.length}`, 120, 70);
    doc.text(`Vendas: ${sales.length}`, 120, 77);

    let finalY = 95;

    if (contracts.length > 0) {
      autoTable(doc, {
        startY: finalY,
        head: [['CONTRATOS DE LOCAÇÃO']],
        theme: 'plain',
        headStyles: { fontStyle: 'bold', fontSize: 13, textColor: primaryColor }
      });

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 1,
        head: [['Cliente', 'Imóvel', 'Valor Locação', 'Comissão', 'Status Pago']],
        body: contracts.map(c => [
          c.cliente,
          c.imovel,
          formatCurrencyBRL(c.valorLocacao),
          formatCurrencyBRL(c.comissao),
          c.statusRecebimento === 'Sim' ? 'RECEBIDO' : 'PENDENTE'
        ]),
        headStyles: { fillColor: brandAccentColor, textColor: [255, 255, 255] },
        styles: { fontSize: 9 },
        columnStyles: {
          2: { halign: 'right' },
          3: { halign: 'right' },
          4: { halign: 'center' }
        },
        foot: [['TOTAIS', '', formatCurrencyBRL(totalVglLocacao), formatCurrencyBRL(totalComissaoLocacao), '']],
        footStyles: { fillColor: [240, 240, 240], textColor: primaryColor, fontStyle: 'bold' }
      });
      finalY = (doc as any).lastAutoTable.finalY + 15;
    }

    if (sales.length > 0) {
      autoTable(doc, {
        startY: finalY,
        head: [['CONTRATOS DE VENDA']],
        theme: 'plain',
        headStyles: { fontStyle: 'bold', fontSize: 13, textColor: primaryColor }
      });
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 1,
        head: [['Cliente', 'Imóvel', 'Valor Venda', 'Comissão', 'Status Pago']],
        body: sales.map(s => [
          s.cliente,
          s.imovel,
          formatCurrencyBRL(s.valorVenda),
          formatCurrencyBRL(s.comissao),
          s.statusRecebimento === 'Sim' ? 'RECEBIDO' : 'PENDENTE'
        ]),
        headStyles: { fillColor: brandAccentColor, textColor: [255, 255, 255] },
        styles: { fontSize: 9 },
        columnStyles: {
          2: { halign: 'right' },
          3: { halign: 'right' },
          4: { halign: 'center' }
        },
        foot: [['TOTAIS', '', formatCurrencyBRL(totalVglVendas), formatCurrencyBRL(totalComissaoVendas), '']],
        footStyles: { fillColor: [240, 240, 240], textColor: primaryColor, fontStyle: 'bold' }
      });
    }

    // Page Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Página ${i} de ${pageCount} - Gerenciador de Fechamentos Pro`, 105, 285, { align: 'center' });
    }

    doc.save(`Relatorio_Fechamentos_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleExportCSV = () => {
    const headers = ['Tipo', 'Cliente', 'Imóvel', 'Valor', 'Comissão', 'Status Pagamento', 'Status Operação', 'Data Operação', 'Data Recebimento'];

    const sanitize = (str: string | undefined) => `"${(str || '').replace(/"/g, '""')}"`;

    const contractRows = contracts.map(c => [
      'Locação',
      sanitize(c.cliente),
      sanitize(c.imovel),
      c.valorLocacao,
      c.comissao,
      sanitize(c.statusRecebimento),
      sanitize(c.statusContrato),
      sanitize(c.formalizacao),
      sanitize(c.dataRecebimento)
    ].join(','));

    const saleRows = sales.map(s => [
      'Venda',
      sanitize(s.cliente),
      sanitize(s.imovel),
      s.valorVenda,
      s.comissao,
      sanitize(s.statusRecebimento),
      sanitize(s.statusVenda),
      sanitize(s.dataVenda),
      sanitize(s.dataRecebimento)
    ].join(','));

    const csvContent = [headers.join(','), ...contractRows, ...saleRows].join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Relatorio_Consolidado_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    if (window.confirm("Você tem certeza que deseja resetar os dados de operacionais? \n\nOs contratos e vendas serão apagados permanentemente. \nSuas configurações de perfil e tema serão mantidas.")) {
      onAppReset();
      onClose();
    }
  };

  // ... (PDF/CSV exports)

  if (!isOpen) return null;

  return (
    <>
      {isCropperOpen && tempImageSrc && (
        <ImageCropper
          imageSrc={tempImageSrc}
          onCancel={() => { setIsCropperOpen(false); setTempImageSrc(null); }}
          onCrop={handleCropComplete}
        />
      )}

      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex justify-center items-center z-50 p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        {/* ... modal content ... */}
        <div
          className="bg-[var(--color-bg-surface)] rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] md:h-[600px] flex flex-col relative transform transition-all duration-300 scale-95 animate-modal-enter border border-[var(--color-border)]"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-5 border-b border-[var(--color-border)] flex justify-between items-center flex-shrink-0">
            <h2 id="settings-title" className="text-xl font-bold text-[var(--color-text-primary)]">Ajustes da Plataforma</h2>
            <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors" aria-label="Fechar modal">
              <XIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
            {/* Sidebar Navigation */}
            <nav className="w-full md:w-1/4 p-2 md:p-4 border-b md:border-b-0 md:border-r border-[var(--color-border)] bg-[var(--color-bg-muted)]/50 flex-shrink-0">
              {/* ... nav items ... */}
              <div className="flex flex-row md:flex-col justify-around md:space-y-1 gap-1">
                <NavItem tabName="perfil" label="Perfil" icon={<UserCircleIcon className="w-5 h-5" />} activeTab={activeTab} onClick={setActiveTab} />
                <NavItem tabName="temas" label="Temas" icon={<SparklesIcon className="w-5 h-5" />} activeTab={activeTab} onClick={setActiveTab} />
                <NavItem tabName="restauracao" label="Restauração" icon={<ArchiveBoxArrowDownIcon className="w-5 h-5" />} activeTab={activeTab} onClick={setActiveTab} />
                <NavItem tabName="relatorios" label="Relatórios" icon={<DocumentChartBarIcon className="w-5 h-5" />} activeTab={activeTab} onClick={setActiveTab} />
              </div>
            </nav>

            {/* Content Area */}
            <main className="flex-grow p-4 md:p-8 overflow-y-auto">
              <ContentPanel tabName="perfil" title="Perfil" icon={<UserCircleIcon className="w-7 h-7" />} activeTab={activeTab}>
                <div className="space-y-8">
                  {/* Profile Picture Section */}
                  <div className="flex items-center gap-6 pb-8 border-b border-[var(--color-border)]">
                    <img
                      src={formData.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${formData.name.replace(/\s/g, '')}`}
                      alt="Foto de perfil"
                      className="w-24 h-24 rounded-full object-cover ring-2 ring-offset-2 ring-offset-[var(--color-bg-surface)] ring-brand-accent bg-gray-100"
                    />
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        ref={fileInputRef}
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-[var(--color-bg-surface)]/60 hover:bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-bold py-2 px-4 rounded-lg text-sm transition-colors shadow-sm"
                      >
                        Alterar foto
                      </button>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-2">JPG, PNG ou GIF, máx. 5MB.</p>
                    </div>
                  </div>

                  {/* Profile Form Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ProfileInputField id="name" name="name" label="Nome de usuário" type="text" value={formData.name} onChange={handleProfileChange} />
                    <ProfileInputField id="email" name="email" label="E-mail" type="email" value={formData.email} onChange={handleProfileChange} />
                    <ProfileInputField id="phone" name="phone" label="Telefone" type="tel" value={formData.phone} onChange={handleProfileChange} />
                  </div>

                  {/* Password & Security Section */}
                  <div className="border-t border-[var(--color-border)] pt-8">
                    <h4 className="text-base font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2"><ShieldCheckIcon className="w-5 h-5" /> Senha e Segurança</h4>
                    <div className="space-y-4">
                      <button className="bg-[var(--color-bg-surface)]/60 hover:bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-bold py-2 px-4 rounded-lg text-sm transition-colors shadow-sm">
                        Alterar senha
                      </button>
                      <div className="flex items-center justify-between p-3 bg-black/5 rounded-lg">
                        <div>
                          <p className="font-medium text-[var(--color-text-primary)]">Autenticação de Dois Fatores (2FA)</p>
                          <p className="text-xs text-[var(--color-text-secondary)]">Adicione uma camada extra de segurança à sua conta.</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleToggleTwoFactor}
                          className={`${formData.twoFactorEnabled ? 'bg-brand-accent' : 'bg-brand-gray-300'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2`}
                          role="switch"
                          aria-checked={formData.twoFactorEnabled}
                        >
                          <span
                            aria-hidden="true"
                            className={`${formData.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Save Button */}
                <div className="mt-8 pt-6 border-t border-[var(--color-border)] flex justify-end">
                  <button onClick={handleSave} className="bg-brand-accent hover:bg-opacity-90 text-[var(--color-text-accent)] font-bold py-2.5 px-6 rounded-lg transition-colors shadow-lg shadow-violet-500/30 flex items-center gap-2">
                    <SaveIcon className="w-5 h-5" />
                    Salvar Alterações
                  </button>
                </div>
              </ContentPanel>

              <ContentPanel tabName="temas" title="Temas" icon={<SparklesIcon className="w-7 h-7" />} activeTab={activeTab}>
                <div>
                  <h4 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">Paleta de Cores</h4>
                  <p className="text-sm mb-6">Escolha uma cor de destaque para personalizar a aparência da plataforma.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-6 gap-x-4">
                    {themes.map(theme => (
                      <ThemeSwatch key={theme.name} theme={theme} activeTheme={activeTheme} onSelect={onThemeChange} />
                    ))}
                  </div>
                </div>
              </ContentPanel>

              <ContentPanel tabName="restauracao" title="Restauração e Backup" icon={<ArchiveBoxArrowDownIcon className="w-7 h-7" />} activeTab={activeTab}>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-base font-semibold text-[var(--color-text-primary)]">Resetar Aplicação</h4>
                    <p className="text-sm mt-2">
                      Esta ação irá apagar permanentemente todos os dados, incluindo contratos, vendas e metas. O aplicativo será restaurado ao seu estado inicial.
                      <strong className="text-red-600"> Esta ação é irreversível.</strong>
                    </p>
                  </div>
                  <div className="border-t border-[var(--color-border)] pt-6">
                    <button
                      onClick={handleReset}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-5 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-red-500/30"
                    >
                      <TrashIcon className="w-5 h-5" />
                      <span>Resetar Aplicação</span>
                    </button>
                  </div>
                </div>
              </ContentPanel>
              <ContentPanel tabName="relatorios" title="Relatórios" icon={<DocumentChartBarIcon className="w-7 h-7" />} activeTab={activeTab}>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-base font-semibold text-[var(--color-text-primary)]">Exportar Dados Consolidados</h4>
                    <p className="text-sm mt-2">
                      Exporte um relatório completo de todas as suas locações e vendas nos formatos PDF ou CSV.
                    </p>
                  </div>
                  <div className="border-t border-[var(--color-border)] pt-6 flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={handleExportPDF}
                      className="bg-brand-accent hover:bg-opacity-90 text-[var(--color-text-accent)] font-bold py-2.5 px-5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-500/30"
                    >
                      <ArrowDownTrayIcon className="w-5 h-5" />
                      <span>Exportar PDF</span>
                    </button>
                    <button
                      onClick={handleExportCSV}
                      className="bg-brand-accent hover:bg-opacity-90 text-[var(--color-text-accent)] font-bold py-2.5 px-5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-500/30"
                    >
                      <ArrowDownTrayIcon className="w-5 h-5" />
                      <span>Exportar CSV</span>
                    </button>
                  </div>
                </div>
              </ContentPanel>
            </main>
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
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
      </div>
    </>
  );
};

export default SettingsModal;
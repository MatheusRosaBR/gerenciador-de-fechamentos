import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Contract, ReceiptStatus, SaleContract } from './types';
import { mockContracts } from './data/mockData';
import { mockSales } from './data/mockSalesData';
import { parseDateString } from './utils/formatters';
import { themes, Theme } from './components/themes';

import Dashboard from './components/Dashboard';
import ContractList from './components/ContractList';
import ContractDetailModal from './components/ContractDetailModal';
import AddContractModal from './components/AddContractModal';
import EditContractModal from './components/EditContractModal';
import GoalSettingsModal from './components/GoalSettingsModal';
import ReminderPopup from './components/ReminderPopup';
import SettingsModal from './components/SettingsModal';
import CommissionDetailModal from './components/CommissionDetailModal';

import SalesDashboard from './components/SalesDashboard';
import SalesList from './components/SalesList';
import SaleDetailModal from './components/SaleDetailModal';
import AddSaleModal from './components/AddSaleModal';
import EditSaleModal from './components/EditSaleModal';

import { TargetIcon, PlusIcon, CogIcon, Bars3Icon } from './components/IconComponents';
import InfoCarousel from './components/InfoCarousel';

type View = 'locacao' | 'vendas';
const REMINDER_THRESHOLD_DAYS = 3;

const initialProfileData = {
  name: 'Corretor Pro',
  email: 'corretor.pro@email.com',
  phone: '(11) 99999-8888',
  twoFactorEnabled: false,
  avatar: undefined,
};

const STORAGE_KEYS = {
  CONTRACTS: 'app_contracts_v1',
  SALES: 'app_sales_v1',
  PROFILE: 'app_profile_v1',
  RENTAL_GOAL: 'app_rental_goal_v1',
  SALES_GOAL: 'app_sales_goal_v1',
};

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('locacao');

  // State for User Profile
  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return saved ? JSON.parse(saved) : initialProfileData;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profileData));
  }, [profileData]);

  // State for Theme
  const [activeTheme, setActiveTheme] = useState<Theme>(() => {
    try {
      const savedTheme = localStorage.getItem('app-theme');
      return savedTheme ? JSON.parse(savedTheme) : themes[0];
    } catch (error) {
      console.error("Failed to parse theme from localStorage", error);
      return themes[0];
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(activeTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    localStorage.setItem('app-theme', JSON.stringify(activeTheme));

    // Set dynamic background and toggle Tailwind dark mode
    if (activeTheme.mode === 'dark') {
      root.classList.add('dark');
      document.body.style.backgroundImage = 'radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%)';
    } else {
      root.classList.remove('dark');
      document.body.style.backgroundImage = 'linear-gradient(to bottom right, var(--color-bg-base), var(--color-bg-muted))';
    }
  }, [activeTheme]);

  const handleThemeChange = (theme: Theme) => {
    setActiveTheme(theme);
  };

  // State for Rentals
  const [contracts, setContracts] = useState<Contract[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONTRACTS);
    return saved ? JSON.parse(saved) : mockContracts;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(contracts));
  }, [contracts]);

  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [isAddContractModalOpen, setIsAddContractModalOpen] = useState(false);
  const [rentalFilter, setRentalFilter] = useState<ReceiptStatus | 'Todos'>('Todos');
  const [isRentalEditMode, setIsRentalEditMode] = useState(false);
  const [rentalCurrentPage, setRentalCurrentPage] = useState(1);
  const [rentalItemsPerPage, setRentalItemsPerPage] = useState(20);

  const [rentalGoal, setRentalGoal] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RENTAL_GOAL);
    return saved ? JSON.parse(saved) : 100;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RENTAL_GOAL, JSON.stringify(rentalGoal));
  }, [rentalGoal]);

  const [rentalGoalPeriod, setRentalGoalPeriod] = useState('');

  // State for Sales
  const [sales, setSales] = useState<SaleContract[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SALES);
    return saved ? JSON.parse(saved) : mockSales;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  }, [sales]);

  const [selectedSale, setSelectedSale] = useState<SaleContract | null>(null);
  const [editingSale, setEditingSale] = useState<SaleContract | null>(null);
  const [isAddSaleModalOpen, setIsAddSaleModalOpen] = useState(false);
  const [saleFilter, setSaleFilter] = useState<ReceiptStatus | 'Todos'>('Todos');
  const [isSaleEditMode, setIsSaleEditMode] = useState(false);
  const [salesCurrentPage, setSalesCurrentPage] = useState(1);
  const [salesItemsPerPage, setSalesItemsPerPage] = useState(20);

  const [salesGoal, setSalesGoal] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SALES_GOAL);
    return saved ? JSON.parse(saved) : 20;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SALES_GOAL, JSON.stringify(salesGoal));
  }, [salesGoal]);

  const [salesGoalPeriod, setSalesGoalPeriod] = useState('');

  // State for Goal Modal
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoalType, setEditingGoalType] = useState<'locacao' | 'vendas' | null>(null);

  // State for Commission Detail Modal
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);

  // State for Settings Modal
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // State for Mobile Menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // State for Reminders
  const [reminders, setReminders] = useState<((Contract | SaleContract) & { daysUntilDue: number })[]>([]);

  // State for Header Scroll
  const [isScrolled, setIsScrolled] = useState(false);

  // State for Period Filters
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // 0 = Todos
  const [selectedYear, setSelectedYear] = useState<number>(0);

  // Effect to handle scroll and change header style
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Effect to calculate upcoming reminders
  useEffect(() => {
    const allItems: (Contract | SaleContract)[] = [...contracts, ...sales];
    const upcomingReminders: ((Contract | SaleContract) & { daysUntilDue: number })[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pendingWithReminders = allItems.filter(
      item => item.lembreteAtivo && item.statusRecebimento === ReceiptStatus.Nao
    );

    pendingWithReminders.forEach(item => {
      const dueDate = parseDateString(item.dataRecebimento);
      if (!dueDate) return;
      dueDate.setHours(0, 0, 0, 0);

      const timeDiff = dueDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (daysDiff >= 0 && daysDiff <= REMINDER_THRESHOLD_DAYS) {
        upcomingReminders.push({ ...item, daysUntilDue: daysDiff });
      }
    });

    setReminders(upcomingReminders.sort((a, b) => a.daysUntilDue - b.daysUntilDue));
  }, [contracts, sales]);

  // Effect to close mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  // Reset page to 1 when filters change
  useEffect(() => {
    setRentalCurrentPage(1);
  }, [rentalFilter, rentalItemsPerPage]);

  useEffect(() => {
    setSalesCurrentPage(1);
  }, [saleFilter, salesItemsPerPage]);

  // Handlers for Rentals
  const handleUpdateContractStatus = useCallback((contractId: string, newStatus: ReceiptStatus) => {
    setContracts(prev => prev.map(c => c.id === contractId ? { ...c, statusRecebimento: newStatus } : c));
    setSelectedContract(prev => prev && prev.id === contractId ? { ...prev, statusRecebimento: newStatus } : prev);
  }, []);

  const handleAddContract = useCallback((newContractData: Omit<Contract, 'id' | 'percentualComissao'>) => {
    const newContract: Contract = {
      ...newContractData,
      id: `c-${new Date().getTime()}`,
      percentualComissao: newContractData.valorLocacao > 0 ? newContractData.comissao / newContractData.valorLocacao : 0,
      comissaoLiquida: newContractData.comissao * (1 - ((newContractData.aliquotaImposto || 0) / 100)),
      lembreteAtivo: false,
    };
    setContracts(prev => [newContract, ...prev]);
    setIsAddContractModalOpen(false);
  }, []);

  const handleUpdateContract = useCallback((updatedContract: Contract) => {
    setContracts(prev => prev.map(c => c.id === updatedContract.id ? updatedContract : c));
    setEditingContract(null);
  }, []);

  const handleDeleteContract = useCallback((contractId: string) => {
    setContracts(prev => prev.filter(c => c.id !== contractId));
    setEditingContract(null);
  }, []);

  const handleSelectContract = (contract: Contract) => {
    if (isRentalEditMode) setEditingContract(contract);
    else setSelectedContract(contract);
  };

  // Handlers for Sales
  const handleUpdateSaleStatus = useCallback((saleId: string, newStatus: ReceiptStatus) => {
    setSales(prev => prev.map(s => s.id === saleId ? { ...s, statusRecebimento: newStatus } : s));
    setSelectedSale(prev => prev && prev.id === saleId ? { ...prev, statusRecebimento: newStatus } : prev);
  }, []);

  const handleAddSale = useCallback((newSaleData: Omit<SaleContract, 'id' | 'percentualComissao'>) => {
    const newSale: SaleContract = {
      ...newSaleData,
      id: `s-${new Date().getTime()}`,
      percentualComissao: newSaleData.valorVenda > 0 ? newSaleData.comissao / newSaleData.valorVenda : 0,
      comissaoLiquida: newSaleData.comissao * (1 - ((newSaleData.aliquotaImposto || 0) / 100)),
      lembreteAtivo: false,
    };
    setSales(prev => [newSale, ...prev]);
    setIsAddSaleModalOpen(false);
  }, []);

  const handleUpdateSale = useCallback((updatedSale: SaleContract) => {
    setSales(prev => prev.map(s => s.id === updatedSale.id ? updatedSale : s));
    setEditingSale(null);
  }, []);

  const handleDeleteSale = useCallback((saleId: string) => {
    setSales(prev => prev.filter(s => s.id !== saleId));
    setEditingSale(null);
  }, []);

  const handleSelectSale = (sale: SaleContract) => {
    if (isSaleEditMode) setEditingSale(sale);
    else setSelectedSale(sale);
  };

  // Handlers for Goal Settings
  const handleOpenGoalSettings = (type: 'locacao' | 'vendas') => {
    setEditingGoalType(type);
    setIsGoalModalOpen(true);
  };

  const handleCloseGoalSettings = () => {
    setIsGoalModalOpen(false);
    setEditingGoalType(null);
  };

  const handleSaveGoal = (goal: number, period: string) => {
    if (editingGoalType === 'locacao') {
      setRentalGoal(goal);
      setRentalGoalPeriod(period);
    } else if (editingGoalType === 'vendas') {
      setSalesGoal(goal);
      setSalesGoalPeriod(period);
    }
    handleCloseGoalSettings();
  };

  // Handlers for Commission Detail Modal
  const handleOpenCommissionDetails = () => setIsCommissionModalOpen(true);
  const handleCloseCommissionDetails = () => setIsCommissionModalOpen(false);

  // Handlers for Reminders
  const handleToggleReminder = useCallback((id: string, type: 'locacao' | 'vendas') => {
    if (type === 'locacao') {
      setContracts(prev => prev.map(c =>
        c.id === id ? { ...c, lembreteAtivo: !c.lembreteAtivo } : c
      ));
      setSelectedContract(prev => prev && prev.id === id ? { ...prev, lembreteAtivo: !prev.lembreteAtivo } : prev);
    } else {
      setSales(prev => prev.map(s =>
        s.id === id ? { ...s, lembreteAtivo: !s.lembreteAtivo } : s
      ));
      setSelectedSale(prev => prev && prev.id === id ? { ...prev, lembreteAtivo: !prev.lembreteAtivo } : prev);
    }
  }, []);

  const handleSelectReminder = (item: Contract | SaleContract) => {
    if ('valorLocacao' in item) {
      setActiveView('locacao');
      setSelectedContract(item as Contract);
    } else {
      setActiveView('vendas');
      setSelectedSale(item as SaleContract);
    }
  };

  // Handler for App Reset
  const handleAppReset = useCallback(() => {
    // Reset business data states
    setActiveView('locacao');

    // Do NOT reset profile or theme
    // setProfileData(initialProfileData);
    // setActiveTheme(themes[0]);

    setContracts([]);
    setSelectedContract(null);
    setEditingContract(null);
    setIsAddContractModalOpen(false);
    setRentalFilter('Todos');
    setIsRentalEditMode(false);
    setRentalCurrentPage(1);
    setRentalItemsPerPage(20);
    setRentalGoal(100);
    setRentalGoalPeriod('');

    setSales([]);
    setSelectedSale(null);
    setEditingSale(null);
    setIsAddSaleModalOpen(false);
    setSaleFilter('Todos');
    setIsSaleEditMode(false);
    setSalesCurrentPage(1);
    setSalesItemsPerPage(20);
    setSalesGoal(20);
    setSalesGoalPeriod('');

    // Close any open modals
    setIsGoalModalOpen(false);
    setIsSettingsModalOpen(false);

    // Clear ONLY business data from local storage
    // localStorage.removeItem('app-theme'); // Preserve theme

    // Remove specific keys, preserving profile
    const keysToRemove = [
      STORAGE_KEYS.CONTRACTS,
      STORAGE_KEYS.SALES,
      STORAGE_KEYS.RENTAL_GOAL,
      STORAGE_KEYS.SALES_GOAL
    ];

    keysToRemove.forEach(key => localStorage.removeItem(key));
    // localStorage.removeItem(STORAGE_KEYS.PROFILE); // Preserve profile
  }, []);


  const filteredContracts = useMemo(() => {
    return contracts.filter(c => {
      const statusMatch = rentalFilter === 'Todos' || c.statusRecebimento === rentalFilter;

      const date = parseDateString(c.formalizacao);
      if (!date) return statusMatch;

      const monthMatch = selectedMonth === 0 || (date.getMonth() + 1) === selectedMonth;
      const yearMatch = selectedYear === 0 || date.getFullYear() === selectedYear;

      return statusMatch && monthMatch && yearMatch;
    });
  }, [contracts, rentalFilter, selectedMonth, selectedYear]);

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const statusMatch = saleFilter === 'Todos' || s.statusRecebimento === saleFilter;

      const date = parseDateString(s.dataVenda);
      if (!date) return statusMatch;

      const monthMatch = selectedMonth === 0 || (date.getMonth() + 1) === selectedMonth;
      const yearMatch = selectedYear === 0 || date.getFullYear() === selectedYear;

      return statusMatch && monthMatch && yearMatch;
    });
  }, [sales, saleFilter, selectedMonth, selectedYear]);

  const paginatedContracts = useMemo(() => {
    const startIndex = (rentalCurrentPage - 1) * rentalItemsPerPage;
    const endIndex = startIndex + rentalItemsPerPage;
    return filteredContracts.slice(startIndex, endIndex);
  }, [filteredContracts, rentalCurrentPage, rentalItemsPerPage]);

  const paginatedSales = useMemo(() => {
    const startIndex = (salesCurrentPage - 1) * salesItemsPerPage;
    const endIndex = startIndex + salesItemsPerPage;
    return filteredSales.slice(startIndex, endIndex);
  }, [filteredSales, salesCurrentPage, salesItemsPerPage]);


  const TabButton: React.FC<{ view: View; label: string }> = ({ view, label }) => {
    const isActive = activeView === view;
    return (
      <button
        onClick={() => setActiveView(view)}
        className={`flex-1 text-center py-3 px-6 text-base font-semibold rounded-lg transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-muted)] focus-visible:ring-brand-accent ${isActive
          ? 'bg-[var(--color-bg-surface)] text-brand-accent shadow-lg'
          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="min-h-screen font-sans">
      <header className={`p-6 sticky top-0 z-20 transition-all duration-300 ${isScrolled ? 'bg-[var(--color-bg-surface)]/90 backdrop-blur-xl shadow-sm border-b border-[var(--color-border)]' : 'bg-transparent backdrop-blur-sm border-b border-transparent'}`}>
        <div className="container mx-auto flex flex-wrap items-center justify-center md:justify-between gap-4 relative">
          <div className="flex items-center gap-4">
            <img
              src={profileData.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${profileData.name.replace(/\s/g, '')}`}
              alt="Foto de perfil"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-accent/50"
            />
            <div>
              <p className="text-lg font-semibold text-[var(--color-text-primary)]">Bem vindo, {profileData.name}!</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Desktop Icons */}
            <div className="hidden md:flex items-center gap-2">
              <ReminderPopup reminders={reminders} onSelectReminder={handleSelectReminder} />
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="text-[var(--color-text-secondary)] hover:text-brand-accent transition-colors p-2 rounded-full hover:bg-[var(--color-bg-surface)]/50"
                aria-label="Configurações da plataforma"
              >
                <CogIcon className="w-6 h-6" />
              </button>
              <button
                onClick={() => activeView === 'locacao' ? setIsAddContractModalOpen(true) : setIsAddSaleModalOpen(true)}
                className="bg-brand-accent hover:bg-opacity-90 text-[var(--color-text-accent)] font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-violet-500/30"
                aria-label="Adicionar novo"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Adicionar {activeView === 'locacao' ? 'Locação' : 'Venda'}</span>
              </button>
            </div>

            {/* Mobile Hamburger Menu */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-[var(--color-text-secondary)] hover:text-brand-accent transition-colors p-2 rounded-full hover:bg-[var(--color-bg-surface)]/50"
                aria-label="Abrir menu"
                aria-expanded={isMobileMenuOpen}
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
            </div>
          </div>
          {isMobileMenuOpen && (
            <div ref={mobileMenuRef} className="absolute top-full right-0 mt-2 w-56 bg-[var(--color-bg-surface)] rounded-xl shadow-2xl border border-[var(--color-border)] z-30 md:hidden animate-fade-in-down">
              <nav className="p-2">
                <div className="flex items-center justify-between p-2 rounded-lg">
                  <span className="font-semibold text-sm text-[var(--color-text-primary)]">Lembretes</span>
                  <ReminderPopup reminders={reminders} onSelectReminder={handleSelectReminder} />
                </div>
                <button
                  onClick={() => {
                    setIsSettingsModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-2 rounded-lg text-left text-sm font-semibold text-[var(--color-text-primary)] hover:bg-black/5 transition-colors"
                >
                  <CogIcon className="w-5 h-5 text-[var(--color-text-secondary)]" />
                  <span>Ajustes</span>
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>



      <main className="container mx-auto p-4 md:p-6">
        <div className="mb-6 flex flex-col md:flex-row items-stretch justify-between gap-4">
          <div className="w-full md:max-w-md p-2 flex items-center justify-center gap-2 bg-[var(--color-bg-surface)] rounded-2xl shadow-sm border border-[var(--color-border)] h-full">
            <TabButton view="locacao" label="Locação" />
            <TabButton view="vendas" label="Vendas" />
          </div>

          <InfoCarousel />
        </div>

        {
          activeView === 'locacao' && (
            <div className="animate-fade-in">
              <Dashboard
                contracts={contracts}
                goal={rentalGoal}
                goalPeriod={rentalGoalPeriod}
                onOpenGoalSettings={() => handleOpenGoalSettings('locacao')}
                onOpenCommissionDetails={handleOpenCommissionDetails}
              />
              <div className="mt-8">
                <ContractList
                  contracts={paginatedContracts}
                  onSelectContract={handleSelectContract}
                  filter={rentalFilter}
                  setFilter={setRentalFilter}
                  isEditMode={isRentalEditMode}
                  onToggleEditMode={() => setIsRentalEditMode(prev => !prev)}
                  onUpdateContract={handleUpdateContract}
                  onDeleteContract={handleDeleteContract}
                  totalItems={filteredContracts.length}
                  currentPage={rentalCurrentPage}
                  setCurrentPage={setRentalCurrentPage}
                  itemsPerPage={rentalItemsPerPage}
                  setItemsPerPage={setRentalItemsPerPage}
                />
              </div>
            </div>
          )
        }

        {
          activeView === 'vendas' && (
            <div className="animate-fade-in">
              <SalesDashboard
                sales={sales}
                goal={salesGoal}
                goalPeriod={salesGoalPeriod}
                onOpenGoalSettings={() => handleOpenGoalSettings('vendas')}
                onOpenCommissionDetails={handleOpenCommissionDetails}
              />
              <div className="mt-8">
                <SalesList
                  sales={paginatedSales}
                  onSelectSale={handleSelectSale}
                  filter={saleFilter}
                  setFilter={setSaleFilter}
                  isEditMode={isSaleEditMode}
                  onToggleEditMode={() => setIsSaleEditMode(prev => !prev)}
                  onUpdateSale={handleUpdateSale}
                  onDeleteSale={handleDeleteSale}
                  totalItems={filteredSales.length}
                  currentPage={salesCurrentPage}
                  setCurrentPage={setSalesCurrentPage}
                  itemsPerPage={salesItemsPerPage}
                  setItemsPerPage={setSalesItemsPerPage}
                />
              </div>
            </div>
          )
        }
      </main >

      {/* Settings Modal */}
      {
        isSettingsModalOpen && (
          <SettingsModal
            isOpen={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
            profileData={profileData}
            onProfileSave={setProfileData}
            activeTheme={activeTheme}
            onThemeChange={handleThemeChange}
            onAppReset={handleAppReset}
            contracts={contracts}
            sales={sales}
          />
        )
      }

      {/* Goal Modal */}
      {
        isGoalModalOpen && editingGoalType && (
          <GoalSettingsModal
            isOpen={isGoalModalOpen}
            onClose={handleCloseGoalSettings}
            onSave={handleSaveGoal}
            currentGoal={editingGoalType === 'locacao' ? rentalGoal : salesGoal}
            currentPeriod={editingGoalType === 'locacao' ? rentalGoalPeriod : salesGoalPeriod}
            title={`Definir Meta de ${editingGoalType === 'locacao' ? 'Locação' : 'Vendas'}`}
          />
        )
      }

      {/* Commission Detail Modal */}
      {
        isCommissionModalOpen && (
          <CommissionDetailModal
            isOpen={isCommissionModalOpen}
            onClose={handleCloseCommissionDetails}
            items={activeView === 'locacao' ? contracts : sales}
            title={`Detalhes de Comissões de ${activeView === 'locacao' ? 'Locação' : 'Vendas'}`}
          />
        )
      }


      {/* Rental Modals */}
      {
        activeView === 'locacao' && selectedContract && !isRentalEditMode && (
          <ContractDetailModal contract={selectedContract} onClose={() => setSelectedContract(null)} onUpdateStatus={handleUpdateContractStatus} onToggleReminder={(id) => handleToggleReminder(id, 'locacao')} />
        )
      }
      {
        activeView === 'locacao' && isAddContractModalOpen && (
          <AddContractModal onClose={() => setIsAddContractModalOpen(false)} onAddContract={handleAddContract} />
        )
      }
      {
        activeView === 'locacao' && editingContract && isRentalEditMode && (
          <EditContractModal contract={editingContract} onClose={() => setEditingContract(null)} onUpdateContract={handleUpdateContract} onDeleteContract={handleDeleteContract} />
        )
      }

      {/* Sales Modals */}
      {
        activeView === 'vendas' && selectedSale && !isSaleEditMode && (
          <SaleDetailModal sale={selectedSale} onClose={() => setSelectedSale(null)} onUpdateStatus={handleUpdateSaleStatus} onToggleReminder={(id) => handleToggleReminder(id, 'vendas')} />
        )
      }
      {
        activeView === 'vendas' && isAddSaleModalOpen && (
          <AddSaleModal onClose={() => setIsAddSaleModalOpen(false)} onAddSale={handleAddSale} />
        )
      }
      {
        activeView === 'vendas' && editingSale && isSaleEditMode && (
          <EditSaleModal sale={editingSale} onClose={() => setEditingSale(null)} onUpdateSale={handleUpdateSale} onDeleteSale={handleDeleteSale} />
        )
      }

      {/* Mobile FAB */}
      <button
        onClick={() => activeView === 'locacao' ? setIsAddContractModalOpen(true) : setIsAddSaleModalOpen(true)}
        className="fixed bottom-6 right-6 bg-brand-accent hover:bg-opacity-90 text-[var(--color-text-accent)] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl shadow-violet-500/40 transition-transform hover:scale-105 md:hidden z-10"
        aria-label="Adicionar novo"
      >
        <PlusIcon className="w-7 h-7" />
      </button>

      <footer className="text-center p-4 text-[var(--color-text-secondary)]/80 text-sm mt-8">
        <p>Desenvolvido com React, TypeScript e Tailwind CSS.</p>
      </footer>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.2s ease-out forwards;
        }
      `}</style>
    </div >
  );
};

export default App;
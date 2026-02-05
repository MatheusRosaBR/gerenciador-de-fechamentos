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

import {
  HomeIcon, UserIcon, CalendarIcon, CalendarPlusIcon, PlusIcon,
  DocumentTextIcon, PencilIcon, SaveIcon, PhoneIcon, MailIcon,
  TrashIcon, ChevronLeftIcon, ChevronRightIcon, CogIcon, BellIcon,
  UserCircleIcon, SparklesIcon, ArchiveBoxArrowDownIcon,
  DocumentChartBarIcon, ShieldCheckIcon, ArrowDownTrayIcon, Bars3Icon,
  ArrowRightOnRectangleIcon, QuestionMarkCircleIcon
} from './components/IconComponents';
import InfoCarousel from './components/InfoCarousel';
import Login from './components/Login';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { useContracts } from './hooks/useContracts';
import { useSales } from './hooks/useSales';

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
  // CONTRACTS: 'app_contracts_v2', // Deprecated
  // SALES: 'app_sales_v2', // Deprecated
  PROFILE: 'app_profile_v2',
  RENTAL_GOAL: 'app_rental_goal_v2',
  SALES_GOAL: 'app_sales_goal_v2',
};

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeView, setActiveView] = useState<View>('locacao');

  // Auth Effect
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
      if (session?.user) {
        setProfileData(prev => ({
          ...prev,
          name: session.user.user_metadata.full_name || prev.name,
          email: session.user.email || prev.email,
          phone: session.user.user_metadata.phone || prev.phone
        }));
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setProfileData(prev => ({
          ...prev,
          name: session.user.user_metadata.full_name || prev.name,
          email: session.user.email || prev.email,
          phone: session.user.user_metadata.phone || prev.phone
        }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // State for User Profile
  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return saved ? JSON.parse(saved as string) : initialProfileData;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profileData));
  }, [profileData]);

  // State for Theme
  const [activeTheme, setActiveTheme] = useState<Theme>(() => {
    try {
      const savedTheme = localStorage.getItem('app-theme-v4');
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
    localStorage.setItem('app-theme-v4', JSON.stringify(activeTheme));

    // Set dynamic background and toggle Tailwind dark mode
    if (activeTheme.mode === 'dark') {
      root.classList.add('dark');
      // Gradient: Top center glow of Midnight Blue fading into True Black
      document.body.style.backgroundImage = 'radial-gradient(circle at 50% -20%, #0f172a 0%, #000000 40%, #000000 100%)';
    } else {
      root.classList.remove('dark');
      document.body.style.backgroundImage = 'linear-gradient(to bottom right, var(--color-bg-base), var(--color-bg-muted))';
    }
  }, [activeTheme]);

  const handleThemeChange = (theme: Theme) => {
    setActiveTheme(theme);
  };

  // Use Supabase Hooks
  const {
    contracts,
    fetchContracts,
    addContract: addSupabaseContract,
    updateContract: updateSupabaseContract,
    deleteContract: deleteSupabaseContract,
    setContracts // Exposed but used cautiously
  } = useContracts(session);

  const {
    sales,
    fetchSales,
    addSale: addSupabaseSale,
    updateSale: updateSupabaseSale,
    deleteSale: deleteSupabaseSale,
    setSales // Exposed but used cautiously
  } = useSales(session);

  // Initial Fetch
  useEffect(() => {
    if (session) {
      fetchContracts();
      fetchSales();
    }
  }, [session, fetchContracts, fetchSales]);

  // State for Rentals (Legacy states removed)
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

  // State for Sales (Legacy states removed)
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

  // State for Help Modal
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

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
  const handleUpdateContractStatus = useCallback(async (contractId: string, newStatus: ReceiptStatus) => {
    try {
      await updateSupabaseContract(contractId, { statusRecebimento: newStatus });
    } catch (e) { alert("Erro ao atualizar status"); }
  }, [updateSupabaseContract]);

  const handleAddContract = useCallback(async (newContractData: Omit<Contract, 'id' | 'percentualComissao'>) => {
    // Calculate derived fields before sending to hook/DB
    const percentualComissao = newContractData.valorLocacao > 0 ? newContractData.comissao / newContractData.valorLocacao : 0;
    const comissaoLiquida = newContractData.comissao * (1 - ((newContractData.aliquotaImposto || 0) / 100));

    const contractPayload = {
      ...newContractData,
      percentualComissao,
      comissaoLiquida,
      lembreteAtivo: false
    };

    try {
      await addSupabaseContract(contractPayload);
      setIsAddContractModalOpen(false);
    } catch (e) { alert("Erro ao adicionar contrato"); }
  }, [addSupabaseContract]);

  const handleUpdateContract = useCallback(async (updatedContract: Contract) => {
    try {
      await updateSupabaseContract(updatedContract.id, updatedContract);
      setEditingContract(null);
    } catch (e) { alert("Erro ao atualizar contrato"); }
  }, [updateSupabaseContract]);

  const handleDeleteContract = useCallback(async (contractId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este contrato?')) {
      try {
        await deleteSupabaseContract(contractId);
        setEditingContract(null);
        setSelectedContract(null);
      } catch (e) { alert("Erro ao excluir contrato"); }
    }
  }, [deleteSupabaseContract]);

  const handleSelectContract = (contract: Contract) => {
    if (isRentalEditMode) setEditingContract(contract);
    else setSelectedContract(contract);
  };

  // Handlers for Sales
  const handleUpdateSaleStatus = useCallback(async (saleId: string, newStatus: ReceiptStatus) => {
    try {
      await updateSupabaseSale(saleId, { statusRecebimento: newStatus });
    } catch (e) { alert("Erro ao atualizar status"); }
  }, [updateSupabaseSale]);

  const handleAddSale = useCallback(async (newSaleData: Omit<SaleContract, 'id' | 'percentualComissao'>) => {
    const percentualComissao = newSaleData.valorVenda > 0 ? newSaleData.comissao / newSaleData.valorVenda : 0;
    const comissaoLiquida = newSaleData.comissao * (1 - ((newSaleData.aliquotaImposto || 0) / 100));

    const salePayload = {
      ...newSaleData,
      percentualComissao,
      comissaoLiquida,
      lembreteAtivo: false
    };

    try {
      await addSupabaseSale(salePayload);
      setIsAddSaleModalOpen(false);
    } catch (e) { alert("Erro ao adicionar venda"); }
  }, [addSupabaseSale]);

  const handleUpdateSale = useCallback(async (updatedSale: SaleContract) => {
    try {
      await updateSupabaseSale(updatedSale.id, updatedSale);
      setEditingSale(null);
    } catch (e) { alert("Erro ao atualizar venda"); }
  }, [updateSupabaseSale]);

  const handleDeleteSale = useCallback(async (saleId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta venda?')) {
      try {
        await deleteSupabaseSale(saleId);
        setEditingSale(null);
        setSelectedSale(null);
      } catch (e) { alert("Erro ao excluir venda"); }
    }
  }, [deleteSupabaseSale]);

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
  const handleToggleReminder = useCallback(async (id: string, type: 'locacao' | 'vendas') => {
    try {
      if (type === 'locacao') {
        const contract = contracts.find(c => c.id === id);
        if (contract) {
          await updateSupabaseContract(id, { lembreteAtivo: !contract.lembreteAtivo });
        }
      } else {
        const sale = sales.find(s => s.id === id);
        if (sale) {
          await updateSupabaseSale(id, { lembreteAtivo: !sale.lembreteAtivo });
        }
      }
    } catch (e) { alert("Erro ao atualizar lembrete"); }
  }, [contracts, sales, updateSupabaseContract, updateSupabaseSale]);

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

    // Remove specific keys, preserving profile and data (data is in DB now)
    const keysToRemove = [
      // STORAGE_KEYS.CONTRACTS, 
      // STORAGE_KEYS.SALES,
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-base)]">
        <div className="w-12 h-12 border-4 border-brand-accent/20 border-t-brand-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Login onLoginSuccess={() => { }} />;
  }

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
                onClick={() => setIsHelpModalOpen(true)}
                className="text-[var(--color-text-secondary)] hover:text-brand-accent transition-colors p-2 rounded-full hover:bg-[var(--color-bg-surface)]/50"
                aria-label="Ajuda"
              >
                <QuestionMarkCircleIcon className="w-6 h-6" />
              </button>
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
            {session && (
              <button
                onClick={handleLogout}
                className="hidden md:flex text-[var(--color-text-secondary)] hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-500/10 ml-2"
                title="Sair"
              >
                <ArrowRightOnRectangleIcon className="w-6 h-6" />
              </button>
            )}
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
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-2 rounded-lg text-left text-sm font-semibold text-red-500 hover:bg-red-500/5 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span>Sair</span>
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



      {/* Help Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--color-bg-surface)] rounded-2xl shadow-2xl border border-[var(--color-border)] w-full max-w-lg p-6 relative">
            <button
              onClick={() => setIsHelpModalOpen(false)}
              className="absolute top-4 right-4 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              <ChevronLeftIcon className="w-6 h-6 rotate-180" />
            </button>

            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6 flex items-center gap-2 border-b border-[var(--color-border)] pb-4">
              <QuestionMarkCircleIcon className="w-8 h-8 text-brand-accent" />
              Guia de Uso
            </h2>

            <div className="text-[var(--color-text-secondary)] space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {/* Section 1: Dashboard */}
              <details className="group border border-[var(--color-border)] rounded-xl overflow-hidden bg-[var(--color-bg-muted)]/30">
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-[var(--color-bg-muted)] transition-colors list-none">
                  <div className="flex items-center gap-3">
                    <DocumentChartBarIcon className="w-5 h-5 text-brand-accent" />
                    <span className="font-bold text-[var(--color-text-primary)]">Dashboard & Metas</span>
                  </div>
                  <ChevronLeftIcon className="w-5 h-5 transition-transform group-open:-rotate-90 pointer-events-none" />
                </summary>
                <div className="p-4 pt-0 text-sm space-y-3 border-t border-[var(--color-border)]/50 bg-[var(--color-bg-base)]/50">
                  <p>Acompanhe seu desempenho em tempo real através dos indicadores principais.</p>
                  <ul className="list-disc pl-4 space-y-2">
                    <li><strong>Gráficos:</strong> Mostram o percentual atingido da sua meta mensal de comissões.</li>
                    <li><strong>Ajustar Meta:</strong> Clique no ícone de engrenagem <CogIcon className="w-4 h-4 inline" /> dentro do card de meta para definir seu objetivo do mês.</li>
                  </ul>
                </div>
              </details>

              {/* Section 2: Gestão */}
              <details className="group border border-[var(--color-border)] rounded-xl overflow-hidden bg-[var(--color-bg-muted)]/30" open>
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-[var(--color-bg-muted)] transition-colors list-none">
                  <div className="flex items-center gap-3">
                    <Bars3Icon className="w-5 h-5 text-brand-accent" />
                    <span className="font-bold text-[var(--color-text-primary)]">Gestão de Contratos</span>
                  </div>
                  <ChevronLeftIcon className="w-5 h-5 transition-transform group-open:-rotate-90 pointer-events-none" />
                </summary>
                <div className="p-4 pt-0 text-sm space-y-4 border-t border-[var(--color-border)]/50 bg-[var(--color-bg-base)]/50">
                  <div className="space-y-2">
                    <p className="font-semibold text-brand-accent">Como cadastrar novo:</p>
                    <ol className="list-decimal pl-4 space-y-1">
                      <li>Clique no botão <span className="bg-brand-accent text-white px-1.5 py-0.5 rounded text-xs">+ Adicionar</span>.</li>
                      <li>Preencha os dados (Cliente, Data, Valores).</li>
                      <li>Clique em <strong>Salvar Contrato</strong>.</li>
                    </ol>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-brand-accent">Como editar ou excluir:</p>
                    <ol className="list-decimal pl-4 space-y-1">
                      <li>Na lista, clique sobre o contrato desejado.</li>
                      <li>Para editar valores/dados, clique no lápis <PencilIcon className="w-4 h-4 inline" />.</li>
                      <li>Para apagar permanentemente, clique na lixeira <TrashIcon className="w-4 h-4 inline text-red-500" />.</li>
                    </ol>
                  </div>
                </div>
              </details>

              {/* Section 3: Lembretes */}
              <details className="group border border-[var(--color-border)] rounded-xl overflow-hidden bg-[var(--color-bg-muted)]/30">
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-[var(--color-bg-muted)] transition-colors list-none">
                  <div className="flex items-center gap-3">
                    <BellIcon className="w-5 h-5 text-brand-accent" />
                    <span className="font-bold text-[var(--color-text-primary)]">Lembretes Inteligentes</span>
                  </div>
                  <ChevronLeftIcon className="w-5 h-5 transition-transform group-open:-rotate-90 pointer-events-none" />
                </summary>
                <div className="p-4 pt-0 text-sm border-t border-[var(--color-border)]/50 bg-[var(--color-bg-base)]/50">
                  <p className="leading-relaxed">
                    Não perca prazos! Ao ativar o sino <BellIcon className="w-4 h-4 inline" /> em um contrato, o sistema disparará alertas visuais e no WhatsApp (se configurado) quando faltarem <strong>3 dias</strong> para o recebimento previsto.
                  </p>
                </div>
              </details>

              {/* Section 4: Temas */}
              <details className="group border border-[var(--color-border)] rounded-xl overflow-hidden bg-[var(--color-bg-muted)]/30">
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-[var(--color-bg-muted)] transition-colors list-none">
                  <div className="flex items-center gap-3">
                    <SparklesIcon className="w-5 h-5 text-brand-accent" />
                    <span className="font-bold text-[var(--color-text-primary)]">Personalização</span>
                  </div>
                  <ChevronLeftIcon className="w-5 h-5 transition-transform group-open:-rotate-90 pointer-events-none" />
                </summary>
                <div className="p-4 pt-0 text-sm border-t border-[var(--color-border)]/50 bg-[var(--color-bg-base)]/50">
                  <p className="leading-relaxed">
                    Acesse o menu de <strong>Ajustes</strong> <CogIcon className="w-4 h-4 inline" /> para explorar a <em>Asylab Collection</em>. Você pode escolher entre 5 cores de destaque e alternar entre os modos <strong>Claro</strong> e <strong>Verdadeiro Escuro</strong>.
                  </p>
                </div>
              </details>
            </div>

            <div className="mt-8 flex justify-between items-center border-t border-[var(--color-border)] pt-6">
              <span className="text-xs text-[var(--color-text-secondary)]/50">Versão 2.4.0</span>
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="px-6 py-2.5 bg-brand-accent text-white font-bold rounded-xl hover:bg-opacity-90 transition-all shadow-lg shadow-brand-accent/20 active:scale-95"
              >
                Entendi, obrigado!
              </button>
            </div>
          </div>
        </div>
      )}
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
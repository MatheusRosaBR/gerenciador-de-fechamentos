import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { SaleContract, ReceiptStatus, SaleStatus } from '../types';

export const useSales = (session: any) => {
    const [sales, setSales] = useState<SaleContract[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSales = useCallback(async () => {
        if (!session?.user) return;
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('Sales')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formatted: SaleContract[] = (data || []).map(item => ({
                id: item.id,
                imovel: item.imovel,
                cliente: item.cliente,
                valorVenda: item.valor_venda,
                comissao: item.comissao,
                percentualComissao: item.percentual_comissao,
                statusRecebimento: item.status_recebimento as ReceiptStatus,
                statusVenda: item.status_venda as SaleStatus,
                dataVenda: item.data_venda,
                dataRecebimento: item.data_recebimento,
                telefone: item.telefone,
                email: item.email,
                lembreteAtivo: item.lembrete_ativo,
                aliquotaImposto: item.aliquota_imposto,
                comissaoLiquida: item.comissao_liquida
            }));

            setSales(formatted);
        } catch (err: any) {
            console.error('Error fetching sales:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [session]);

    const addSale = async (sale: Omit<SaleContract, 'id'>) => {
        if (!session?.user) return null;
        setLoading(true);
        try {
            const dbData = {
                user_id: session.user.id,
                imovel: sale.imovel,
                cliente: sale.cliente,
                valor_venda: sale.valorVenda,
                comissao: sale.comissao,
                percentual_comissao: sale.percentualComissao,
                status_recebimento: sale.statusRecebimento,
                status_venda: sale.statusVenda,
                data_venda: sale.dataVenda,
                data_recebimento: sale.dataRecebimento,
                telefone: sale.telefone,
                email: sale.email,
                lembrete_ativo: sale.lembreteAtivo,
                aliquota_imposto: sale.aliquotaImposto,
                comissao_liquida: sale.comissaoLiquida
            };

            const { data, error } = await supabase
                .from('Sales')
                .insert([dbData])
                .select()
                .single();

            if (error) throw error;

            const newSale: SaleContract = {
                id: data.id,
                imovel: data.imovel,
                cliente: data.cliente,
                valorVenda: data.valor_venda,
                comissao: data.comissao,
                percentualComissao: data.percentual_comissao,
                statusRecebimento: data.status_recebimento,
                statusVenda: data.status_venda,
                dataVenda: data.data_venda,
                dataRecebimento: data.data_recebimento,
                telefone: data.telefone,
                email: data.email,
                lembreteAtivo: data.lembrete_ativo,
                aliquotaImposto: data.aliquota_imposto,
                comissaoLiquida: data.comissao_liquida
            };

            setSales(prev => [newSale, ...prev]);
            return newSale;
        } catch (err: any) {
            console.error('Error adding sale:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateSale = async (id: string, updates: Partial<SaleContract>) => {
        if (!session?.user) return;
        setLoading(true);
        try {
            const dbUpdates: any = {};
            if (updates.imovel !== undefined) dbUpdates.imovel = updates.imovel;
            if (updates.cliente !== undefined) dbUpdates.cliente = updates.cliente;
            if (updates.valorVenda !== undefined) dbUpdates.valor_venda = updates.valorVenda;
            if (updates.comissao !== undefined) dbUpdates.comissao = updates.comissao;
            if (updates.percentualComissao !== undefined) dbUpdates.percentual_comissao = updates.percentualComissao;
            if (updates.statusRecebimento !== undefined) dbUpdates.status_recebimento = updates.statusRecebimento;
            if (updates.statusVenda !== undefined) dbUpdates.status_venda = updates.statusVenda;
            if (updates.dataVenda !== undefined) dbUpdates.data_venda = updates.dataVenda;
            if (updates.dataRecebimento !== undefined) dbUpdates.data_recebimento = updates.dataRecebimento;
            if (updates.telefone !== undefined) dbUpdates.telefone = updates.telefone;
            if (updates.email !== undefined) dbUpdates.email = updates.email;
            if (updates.lembreteAtivo !== undefined) dbUpdates.lembrete_ativo = updates.lembreteAtivo;
            if (updates.aliquotaImposto !== undefined) dbUpdates.aliquota_imposto = updates.aliquotaImposto;
            if (updates.comissaoLiquida !== undefined) dbUpdates.comissao_liquida = updates.comissaoLiquida;

            const { error } = await supabase
                .from('Sales')
                .update(dbUpdates)
                .eq('id', id);

            if (error) throw error;

            setSales(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
        } catch (err: any) {
            console.error('Error updating sale:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteSale = async (id: string) => {
        if (!session?.user) return;
        setLoading(true);
        try {
            const { error } = await supabase
                .from('Sales')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setSales(prev => prev.filter(s => s.id !== id));
        } catch (err: any) {
            console.error('Error deleting sale:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        sales,
        loading,
        error,
        fetchSales,
        addSale,
        updateSale,
        deleteSale,
        setSales
    };
};

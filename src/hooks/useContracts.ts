import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Contract, ReceiptStatus, ContractStatus } from '../types';

export const useContracts = (session: any) => {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchContracts = useCallback(async () => {
        if (!session?.user) return;
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('Contracts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formatted: Contract[] = (data || []).map(item => ({
                id: item.id,
                imovel: item.imovel,
                cliente: item.cliente,
                valorLocacao: item.valor_locacao,
                comissao: item.comissao,
                percentualComissao: item.percentual_comissao,
                statusRecebimento: item.status_recebimento as ReceiptStatus,
                statusContrato: item.status_contrato as ContractStatus,
                formalizacao: item.formalizacao, // Assuming DB stores as string DD/MM/YYYY or similar, verify format
                dataRecebimento: item.data_recebimento,
                telefone: item.telefone,
                email: item.email,
                lembreteAtivo: item.lembrete_ativo,
                aliquotaImposto: item.aliquota_imposto,
                comissaoLiquida: item.comissao_liquida
            }));

            setContracts(formatted);
        } catch (err: any) {
            console.error('Error fetching contracts:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [session]);

    const addContract = async (contract: Omit<Contract, 'id'>) => {
        if (!session?.user) return null;
        setLoading(true);
        try {
            const dbData = {
                user_id: session.user.id,
                imovel: contract.imovel || null,
                cliente: contract.cliente,
                valor_locacao: contract.valorLocacao,
                comissao: contract.comissao,
                percentual_comissao: contract.percentualComissao,
                status_recebimento: contract.statusRecebimento,
                status_contrato: contract.statusContrato,
                formalizacao: contract.formalizacao || null,
                data_recebimento: contract.dataRecebimento || null,
                telefone: contract.telefone || null,
                email: contract.email || null,
                lembrete_ativo: contract.lembreteAtivo,
                aliquota_imposto: contract.aliquotaImposto,
                comissao_liquida: contract.comissaoLiquida
            };

            const { data, error } = await supabase
                .from('Contracts')
                .insert([dbData])
                .select()
                .single();

            if (error) throw error;

            const newContract: Contract = {
                id: data.id,
                imovel: data.imovel,
                cliente: data.cliente,
                valorLocacao: data.valor_locacao,
                comissao: data.comissao,
                percentualComissao: data.percentual_comissao,
                statusRecebimento: data.status_recebimento,
                statusContrato: data.status_contrato,
                formalizacao: data.formalizacao,
                dataRecebimento: data.data_recebimento,
                telefone: data.telefone,
                email: data.email,
                lembreteAtivo: data.lembrete_ativo,
                aliquotaImposto: data.aliquota_imposto,
                comissaoLiquida: data.comissao_liquida
            };

            setContracts(prev => [newContract, ...prev]);
            return newContract;
        } catch (err: any) {
            console.error('Error adding contract:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateContract = async (id: string, updates: Partial<Contract>) => {
        if (!session?.user) return;
        setLoading(true);
        try {
            // Map updates to snake_case
            const dbUpdates: any = {};
            if (updates.imovel !== undefined) dbUpdates.imovel = updates.imovel;
            if (updates.cliente !== undefined) dbUpdates.cliente = updates.cliente;
            if (updates.valorLocacao !== undefined) dbUpdates.valor_locacao = updates.valorLocacao;
            if (updates.comissao !== undefined) dbUpdates.comissao = updates.comissao;
            if (updates.percentualComissao !== undefined) dbUpdates.percentual_comissao = updates.percentualComissao;
            if (updates.statusRecebimento !== undefined) dbUpdates.status_recebimento = updates.statusRecebimento;
            if (updates.statusContrato !== undefined) dbUpdates.status_contrato = updates.statusContrato;
            if (updates.formalizacao !== undefined) dbUpdates.formalizacao = updates.formalizacao;
            if (updates.dataRecebimento !== undefined) dbUpdates.data_recebimento = updates.dataRecebimento;
            if (updates.telefone !== undefined) dbUpdates.telefone = updates.telefone;
            if (updates.email !== undefined) dbUpdates.email = updates.email;
            if (updates.lembreteAtivo !== undefined) dbUpdates.lembrete_ativo = updates.lembreteAtivo;
            if (updates.aliquotaImposto !== undefined) dbUpdates.aliquota_imposto = updates.aliquotaImposto;
            if (updates.comissaoLiquida !== undefined) dbUpdates.comissao_liquida = updates.comissaoLiquida;

            const { error } = await supabase
                .from('Contracts')
                .update(dbUpdates)
                .eq('id', id);

            if (error) throw error;

            setContracts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
        } catch (err: any) {
            console.error('Error updating contract:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteContract = async (id: string) => {
        if (!session?.user) return;
        setLoading(true);
        try {
            const { error } = await supabase
                .from('Contracts')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setContracts(prev => prev.filter(c => c.id !== id));
        } catch (err: any) {
            console.error('Error deleting contract:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        contracts,
        loading,
        error,
        fetchContracts,
        addContract,
        updateContract,
        deleteContract,
        setContracts // Expose setter just in case, but operations should be preferred
    };
};

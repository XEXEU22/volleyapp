
import React, { useState, useEffect } from 'react';
import { Player, Payment, CashTransaction } from '../types';
import { supabase } from '../lib/supabase';

interface FinanceViewProps {
    players: Player[];
    userId: string;
}

const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const FinanceView: React.FC<FinanceViewProps> = ({ players, userId }) => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [transactions, setTransactions] = useState<CashTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawDesc, setWithdrawDesc] = useState('');
    const [historyItems, setHistoryItems] = useState<any[]>([]);

    const fetchHistory = async () => {
        try {
            // Fetch all successful payments
            const { data: paymentsData, error: payError } = await supabase
                .from('member_payments')
                .select(`
                    id,
                    amount,
                    created_at,
                    player_id,
                    month,
                    year,
                    players (name)
                `)
                .eq('user_id', userId)
                .eq('is_paid', true);

            if (payError) throw payError;

            // Fetch all cash transactions
            const { data: transData, error: transError } = await supabase
                .from('cash_transactions')
                .select('*')
                .eq('user_id', userId);

            if (transError) throw transError;

            const items: any[] = [];

            paymentsData?.forEach(p => {
                items.push({
                    id: p.id,
                    date: p.created_at,
                    description: `Mensalidade: ${(p.players as any)?.name || 'Jogador'} (${MONTHS[p.month - 1]}/${p.year})`,
                    amount: p.amount,
                    type: 'income',
                    category: 'Pagamento'
                });
            });

            transData?.forEach(t => {
                items.push({
                    id: t.id,
                    date: t.created_at,
                    description: t.description,
                    amount: t.amount,
                    type: t.type === 'deposit' ? 'income' : 'expense',
                    category: t.type === 'deposit' ? 'Depósito' : 'Retirada'
                });
            });

            // Sort by date descending
            items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setHistoryItems(items);
        } catch (error) {
            console.error('Error fetching history:', error);
            alert('Erro ao carregar histórico');
        }
    };

    const fetchData = async () => {
        setLoading(true);
        // Fetch Payments
        const { data: payData, error: payError } = await supabase
            .from('member_payments')
            .select('*')
            .eq('user_id', userId)
            .eq('month', selectedMonth)
            .eq('year', selectedYear);

        // Fetch Global Cash Transactions
        const { data: transData, error: transError } = await supabase
            .from('cash_transactions')
            .select('*')
            .eq('user_id', userId);

        if (payError) console.error('Error fetching payments:', payError);
        else setPayments(payData || []);

        if (transError) console.error('Error fetching transactions:', transError);
        else setTransactions(transData || []);

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [selectedMonth, selectedYear, userId]);

    const savePayment = async (playerId: string, isPaid: boolean, amount: number) => {
        setSavingId(playerId);
        const paymentData = {
            player_id: playerId,
            user_id: userId,
            month: selectedMonth,
            year: selectedYear,
            is_paid: isPaid,
            amount: amount
        };

        const { data, error } = await supabase
            .from('member_payments')
            .upsert(paymentData, { onConflict: 'player_id,month,year' })
            .select()
            .single();

        if (error) {
            console.error('Error updating payment:', error);
            alert('Erro ao atualizar pagamento');
        } else {
            setPayments(prev => {
                const index = prev.findIndex(p => p.player_id === playerId);
                if (index > -1) {
                    const newPayments = [...prev];
                    newPayments[index] = data;
                    return newPayments;
                }
                return [...prev, data];
            });
        }
        setSavingId(null);
    };

    const handleWithdraw = async () => {
        if (!withdrawAmount || isNaN(parseFloat(withdrawAmount))) return;

        const transData = {
            user_id: userId,
            amount: parseFloat(withdrawAmount),
            description: withdrawDesc || 'Retirada',
            type: 'withdrawal',
            category: 'Geral',
            date: new Date().toISOString().split('T')[0]
        };

        const { data, error } = await supabase
            .from('cash_transactions')
            .insert(transData)
            .select()
            .single();

        if (error) {
            console.error('Error recording withdrawal:', error);
            alert('Erro ao registrar retirada');
        } else {
            setTransactions(prev => [data, ...prev]);
            setIsWithdrawModalOpen(false);
            setWithdrawAmount('');
            setWithdrawDesc('');
        }
    };

    const totalIncome = payments.filter(p => p.is_paid).reduce((acc, curr) => acc + (curr.amount || 0), 0);
    // Note: totalIncome above is for the SELECTED MONTH. 
    // For "Caixa", we probably want ALL payments ever made minus ALL withdrawals ever made.
    const allPaymentsIncome = payments.filter(p => p.is_paid).reduce((acc, curr) => acc + (curr.amount || 0), 0);
    // Actually, to get TRUE Caixa, we need to fetch all payments. 
    // But for now, let's assume Caixa is based on all historical transactions + historical payments.
    // To keep it simple and performant, I'll calculate Caixa as: Transactions(deposits) - Transactions(withdrawals) + Total Current Payments.
    // IMPROVEMENT: Fetch all payments total income.

    const [totalCash, setTotalCash] = useState(0);

    useEffect(() => {
        const calculateCaixa = async () => {
            const { data: allPay } = await supabase.from('member_payments').select('amount').eq('user_id', userId).eq('is_paid', true);
            const sumPay = allPay?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;
            const sumTrans = transactions.reduce((acc, curr) => {
                return curr.type === 'deposit' ? acc + curr.amount : acc - curr.amount;
            }, 0);
            setTotalCash(sumPay + sumTrans);
        };
        if (!loading) calculateCaixa();
    }, [payments, transactions, userId, loading]);

    const paidCount = payments.filter(p => p.is_paid).length;
    const totalCount = players.length;

    return (
        <div className="pb-24">
            <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-8">
                <div className="flex justify-between items-start">
                    <h2 className="text-3xl font-black tracking-tighter text-slate-800 dark:text-white uppercase leading-none">Mensalidades</h2>
                    <button
                        onClick={() => setIsWithdrawModalOpen(true)}
                        className="bg-rose-500/10 text-rose-500 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-1 border border-rose-500/20"
                    >
                        <span className="material-symbols-outlined text-sm">remove_circle</span>
                        Retirar
                    </button>
                </div>

                <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {MONTHS.map((month, index) => (
                        <button
                            key={month}
                            onClick={() => setSelectedMonth(index + 1)}
                            className={`px-4 py-2 rounded-full text-xs font-bold uppercase transition-all whitespace-nowrap ${selectedMonth === index + 1
                                ? 'bg-primary text-background-dark scale-105'
                                : 'bg-white dark:bg-card-dark text-slate-400'
                                }`}
                        >
                            {month}
                        </button>
                    ))}
                </div>
            </header>

            <div className="px-4 py-6">
                {/* Global Caixa Summary */}
                <div
                    onClick={() => {
                        console.log('Caixa card clicked');
                        setIsHistoryModalOpen(true);
                        fetchHistory();
                    }}
                    className="bg-primary p-6 rounded-3xl ios-shadow mb-8 relative overflow-hidden active:scale-95 transition-transform cursor-pointer pointer-events-auto"
                >
                    <div className="relative z-10 pointer-events-none">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black uppercase text-white/60 mb-1">Caixa Geral (Saldo Total) <span className="ml-1 text-[8px] opacity-70">(Ver Histórico)</span></p>
                                <p className="text-4xl font-black text-white">R$ {totalCash.toFixed(2).replace('.', ',')}</p>
                            </div>
                            <span className="material-symbols-outlined text-white/40">history</span>
                        </div>
                    </div>
                    <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-8xl text-white/10 rotate-12 pointer-events-none">account_balance_wallet</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white dark:bg-card-dark p-4 rounded-2xl ios-shadow border-l-4 border-primary">
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Mês: Recebido</p>
                        <p className="text-xl font-black text-slate-800 dark:text-white">R$ {totalIncome.toFixed(2).replace('.', ',')}</p>
                        <p className="text-[8px] text-primary font-bold uppercase mt-1">{paidCount} de {totalCount} pagos</p>
                    </div>
                    <div className="bg-white dark:bg-card-dark p-4 rounded-2xl ios-shadow border-l-4 border-rose-500">
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Mês: Pendente</p>
                        <p className="text-xl font-black text-slate-800 dark:text-white">R$ {((totalCount - paidCount) * 0).toFixed(2).replace('.', ',')}</p>
                        <p className="text-[8px] text-rose-500 font-bold uppercase mt-1">{totalCount - paidCount} aguardando</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="py-12 text-center">
                            <span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
                        </div>
                    ) : players.length > 0 ? (
                        players.map(player => {
                            const payment = payments.find(p => p.player_id === player.id);
                            const isPaid = payment?.is_paid || false;

                            return (
                                <div
                                    key={player.id}
                                    className={`bg-white dark:bg-card-dark p-4 rounded-3xl flex flex-col gap-4 ios-shadow transition-all ${isPaid ? 'border-primary/20 bg-primary/5' : ''}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-primary/20">
                                                {player.avatarUrl ? (
                                                    <img src={player.avatarUrl} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <span className="material-symbols-outlined text-slate-400">person</span>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 dark:text-white text-sm">{player.name}</h3>
                                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{player.level}</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => savePayment(player.id, !isPaid, payment?.amount || 0)}
                                            disabled={savingId === player.id}
                                            className={`flex items-center gap-1 px-4 py-2 rounded-xl font-black text-[10px] uppercase transition-all ${isPaid
                                                ? 'bg-primary text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                                }`}
                                        >
                                            {savingId === player.id ? (
                                                <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                                            ) : (
                                                <span className="material-symbols-outlined text-[14px]">
                                                    {isPaid ? 'check_circle' : 'pending'}
                                                </span>
                                            )}
                                            {isPaid ? 'Pago' : 'Pendente'}
                                        </button>
                                    </div>

                                    {/* Amount Input */}
                                    <div className="flex items-center justify-between bg-slate-50 dark:bg-background-dark/50 p-2 rounded-2xl">
                                        <p className="text-[10px] font-bold uppercase text-slate-400 ml-2">Valor Pago</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-400">R$</span>
                                            <input
                                                type="number"
                                                placeholder="0,00"
                                                defaultValue={payment?.amount || ''}
                                                onBlur={(e) => savePayment(player.id, isPaid, parseFloat(e.target.value) || 0)}
                                                className="w-20 bg-transparent border-none text-right font-black text-slate-800 dark:text-white focus:ring-0 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-12 text-center">
                            <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700">group_off</span>
                            <p className="mt-4 text-slate-500">Nenhum jogador cadastrado.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Withdrawal Modal */}
            {isWithdrawModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background-dark/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-card-dark w-full max-w-sm rounded-[32px] p-8 ios-shadow animate-in slide-in-from-bottom-8 duration-500">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black uppercase tracking-tighter">Registrar Retirada</h3>
                            <button onClick={() => setIsWithdrawModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Valor da Retirada (R$)</label>
                                <input
                                    type="number"
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    placeholder="0,00"
                                    className="w-full bg-slate-100 dark:bg-background-dark border-none rounded-2xl py-4 px-6 font-black text-2xl text-rose-500 placeholder-rose-500/30 focus:ring-2 focus:ring-rose-500/20"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Descrição / Motivo</label>
                                <input
                                    type="text"
                                    value={withdrawDesc}
                                    onChange={(e) => setWithdrawDesc(e.target.value)}
                                    placeholder="Ex: Aluguel da quadra, Bolas, etc."
                                    className="w-full bg-slate-100 dark:bg-background-dark border-none rounded-2xl py-4 px-6 font-bold text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            <button
                                onClick={handleWithdraw}
                                className="w-full bg-rose-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:opacity-90 transition-opacity active:scale-95 shadow-lg shadow-rose-500/30"
                            >
                                Confirmar Retirada
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* History Modal */}
            {isHistoryModalOpen && (
                <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-card-dark w-full max-w-lg h-[85vh] sm:h-auto sm:max-h-[80vh] rounded-t-[32px] sm:rounded-[32px] p-8 ios-shadow flex flex-col relative">
                        <div className="flex justify-between items-center mb-6 shrink-0">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter">Histórico do Caixa</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Todas as movimentações</p>
                            </div>
                            <button onClick={() => setIsHistoryModalOpen(false)} className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                            {historyItems.length > 0 ? (
                                historyItems.map((item) => (
                                    <div key={item.id} className="bg-slate-50 dark:bg-background-dark/50 p-4 rounded-2xl flex justify-between items-center border border-slate-100 dark:border-slate-800">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black uppercase text-slate-400 mb-1">
                                                {new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="text-xs font-bold text-slate-800 dark:text-white line-clamp-1">{item.description}</span>
                                            <span className={`text-[8px] font-black uppercase mt-1 px-2 py-0.5 rounded-full w-fit ${item.category === 'Pagamento' ? 'bg-primary/10 text-primary' :
                                                item.category === 'Retirada' ? 'bg-rose-500/10 text-rose-500' :
                                                    'bg-blue-500/10 text-blue-500'
                                                }`}>
                                                {item.category}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-black ${item.type === 'income' ? 'text-primary' : 'text-rose-500'}`}>
                                                {item.type === 'income' ? '+' : '-'} R$ {item.amount.toFixed(2).replace('.', ',')}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center">
                                    <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-700">history_toggle_off</span>
                                    <p className="mt-2 text-slate-400 text-xs font-bold uppercase">Nenhuma movimentação encontrada</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinanceView;

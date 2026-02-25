
import React, { useState, useEffect } from 'react';
import { Player, Payment } from '../types';
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
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);

    const fetchPayments = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('member_payments')
            .select('*')
            .eq('user_id', userId)
            .eq('month', selectedMonth)
            .eq('year', selectedYear);

        if (error) {
            console.error('Error fetching payments:', error);
        } else {
            setPayments(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPayments();
    }, [selectedMonth, selectedYear, userId]);

    const togglePayment = async (player: Player) => {
        const existingPayment = payments.find(p => p.player_id === player.id);
        const isPaid = !existingPayment?.is_paid;

        setSavingId(player.id);

        const paymentData = {
            player_id: player.id,
            user_id: userId,
            month: selectedMonth,
            year: selectedYear,
            is_paid: isPaid,
            amount: 0 // Could be dynamic in future
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
                const index = prev.findIndex(p => p.player_id === player.id);
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

    const paidCount = payments.filter(p => p.is_paid).length;
    const totalCount = players.length;

    return (
        <div className="pb-24">
            <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-8">
                <h2 className="text-3xl font-black tracking-tighter text-slate-800 dark:text-white uppercase">Mensalidades</h2>

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
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white dark:bg-card-dark p-4 rounded-2xl ios-shadow">
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Pagos</p>
                        <p className="text-2xl font-black text-primary">{paidCount}</p>
                    </div>
                    <div className="bg-white dark:bg-card-dark p-4 rounded-2xl ios-shadow">
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Pendentes</p>
                        <p className="text-2xl font-black text-rose-500">{totalCount - paidCount}</p>
                    </div>
                </div>

                <div className="space-y-3">
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
                                    className="bg-white dark:bg-card-dark p-4 rounded-2xl flex items-center justify-between ios-shadow group"
                                >
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
                                        onClick={() => togglePayment(player)}
                                        disabled={savingId === player.id}
                                        className={`flex items-center gap-1 px-4 py-2 rounded-xl font-black text-[10px] uppercase transition-all ${isPaid
                                                ? 'bg-primary/10 text-primary border border-primary/20'
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
        </div>
    );
};

export default FinanceView;

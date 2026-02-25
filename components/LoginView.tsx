
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Gender } from '../types';

interface LoginViewProps {
    onSuccess: (isNewUser: boolean) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);

    React.useEffect(() => {
        const savedEmail = localStorage.getItem('remembered_email');
        if (savedEmail) {
            setEmail(savedEmail);
        }
    }, []);

    const handleAuth = async (e: React.FormEvent) => {

        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;

                if (rememberMe) {
                    localStorage.setItem('remembered_email', email);
                } else {
                    localStorage.removeItem('remembered_email');
                }

                onSuccess(false);

            } else {
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (authError) throw authError;

                if (authData.user) {
                    // Automatically "allocate" user in the profiles table
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .insert([{
                            user_id: authData.user.id,
                            name: name || 'Novo Jogador',
                            bio: 'Treinando para ser o melhor!',
                            gender: 'Masculino',
                            level: 'RECREATIVO'
                        }]);

                    if (profileError) {
                        console.error('Error creating profile:', profileError);
                    }
                }

                if (authData.session) {
                    // User is automatically logged in (email confirmation is likely disabled)
                    // No alert needed, the auth state change will handle the transition
                    onSuccess(true);
                } else {
                    alert('Cadastro realizado! Por favor, verifique seu e-mail para confirmar sua conta.');
                    onSuccess(true);
                }
            }
        } catch (error: any) {
            alert(error.message || 'Erro na autenticação');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background-light dark:bg-background-dark animate-in fade-in duration-500">
            <div className="w-full max-w-sm">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center mb-6 drop-shadow-2xl">
                        <img src="/app_icon.svg" alt="Lets Vôlei Icon" className="h-24 w-24 rounded-[32px] ios-shadow" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Lets Vôlei</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Sua pelada, suas regras.</p>
                </div>

                <div className="bg-white dark:bg-card-dark rounded-[40px] p-8 ios-shadow-lg border border-white dark:border-white/5">
                    <h2 className="text-xl font-bold mb-6 text-center">
                        {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
                    </h2>

                    <form onSubmit={handleAuth} className="space-y-4">
                        {!isLogin && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider ml-1">Nome Completo</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-background-dark border-none rounded-2xl py-4 px-5 text-sm focus:ring-2 focus:ring-primary transition-all"
                                    placeholder="Como quer ser chamado?"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider ml-1">E-mail</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-background-dark border-none rounded-2xl py-4 px-5 text-sm focus:ring-2 focus:ring-primary transition-all"
                                placeholder="seu@email.com"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider ml-1">Senha</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-background-dark border-none rounded-2xl py-4 px-5 text-sm focus:ring-2 focus:ring-primary transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        {isLogin && (
                            <div className="flex items-center gap-2 ml-1">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-200 dark:border-slate-800 text-primary focus:ring-primary bg-slate-50 dark:bg-background-dark appearance-none checked:bg-primary transition-all relative after:content-['✓'] after:absolute after:text-[10px] after:text-white after:top-[-1px] after:left-[2.5px] after:hidden checked:after:block cursor-pointer flex-shrink-0"
                                />
                                <label htmlFor="remember" className="text-sm font-medium text-slate-500 cursor-pointer select-none">
                                    Lembrar e-mail
                                </label>
                            </div>
                        )}

                        <button

                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-background-dark font-bold py-4 rounded-2xl mt-4 ios-shadow active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="animate-spin material-symbols-outlined">sync</span>
                            ) : (
                                isLogin ? 'Entrar' : 'Cadastrar'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm">
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-primary font-bold hover:underline"
                        >
                            {isLogin ? 'Não tem uma conta? Se inscreva aqui' : 'Já tem uma conta? Faça login'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginView;

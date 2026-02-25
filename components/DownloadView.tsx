import React, { useState, useEffect } from 'react';

const DownloadView: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');

    useEffect(() => {
        // Detect platform
        const ua = window.navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(ua)) {
            setPlatform('ios');
        } else if (/android/.test(ua)) {
            setPlatform('android');
        }

        // Capture install prompt for Android/Chrome
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    return (
        <div className="pb-32 px-4 pt-12 animate-in fade-in duration-500">
            <header className="mb-8">
                <h2 className="text-3xl font-black tracking-tighter text-slate-800 dark:text-white uppercase leading-tight">
                    Instalar <br />
                    <span className="text-primary text-4xl">Lets Vôlei</span>
                </h2>
                <p className="text-slate-500 text-sm mt-2">Tenha o app sempre à mão na sua tela inicial</p>
            </header>

            <div className="space-y-6">
                {/* Device Detection Card */}
                <div className="bg-white dark:bg-card-dark rounded-[32px] p-8 border border-slate-100 dark:border-white/5 ios-shadow text-center">
                    <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl text-primary">download_for_offline</span>
                    </div>

                    <h3 className="text-xl font-bold mb-2">Web App Oficial</h3>
                    <p className="text-slate-500 text-sm mb-6">Instale para ter uma experiência mais rápida e acesso offline.</p>

                    {platform === 'android' || deferredPrompt ? (
                        <button
                            onClick={handleInstallClick}
                            disabled={!deferredPrompt}
                            className="w-full py-4 bg-primary text-background-dark font-black uppercase tracking-widest text-sm rounded-2xl ios-shadow active:scale-95 transition-all disabled:opacity-50"
                        >
                            {deferredPrompt ? 'Instalar Agora' : 'Clique no menu do seu navegador'}
                        </button>
                    ) : platform === 'ios' ? (
                        <div className="space-y-4 text-left">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest text-center">Como instalar no iPhone:</p>

                            <div className="flex items-start gap-3 bg-slate-50 dark:bg-background-dark p-4 rounded-2xl">
                                <div className="bg-white dark:bg-slate-800 h-8 w-8 rounded-lg flex items-center justify-center ios-shadow flex-shrink-0">
                                    <span className="material-symbols-outlined text-primary text-lg">ios_share</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold">1. Toque em Compartilhar</p>
                                    <p className="text-[11px] text-slate-500">Localizado na barra inferior do Safari.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 bg-slate-50 dark:bg-background-dark p-4 rounded-2xl">
                                <div className="bg-white dark:bg-slate-800 h-8 w-8 rounded-lg flex items-center justify-center ios-shadow flex-shrink-0">
                                    <span className="material-symbols-outlined text-primary text-lg">add_box</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold">2. Adicionar à Tela de Início</p>
                                    <p className="text-[11px] text-slate-500">Role a lista de opções para encontrar.</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-slate-400 text-xs italic">
                            Use o Google Chrome ou Safari para instalar este aplicativo no seu celular.
                        </p>
                    )}
                </div>

                {/* Benefits List */}
                <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center gap-4 p-4">
                        <span className="material-symbols-outlined text-primary">speed</span>
                        <div>
                            <p className="text-sm font-bold">Carregamento Rápido</p>
                            <p className="text-[11px] text-slate-500">O app abre instantaneamente sem carregar do site.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4">
                        <span className="material-symbols-outlined text-primary">notifications_active</span>
                        <div>
                            <p className="text-sm font-bold">Notificações</p>
                            <p className="text-[11px] text-slate-500">Fique por dentro das novidades da sua pelada.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4">
                        <span className="material-symbols-outlined text-primary">fullscreen</span>
                        <div>
                            <p className="text-sm font-bold">Modo Tela Cheia</p>
                            <p className="text-[11px] text-slate-500">Navegação sem a barra de endereços do navegador.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DownloadView;

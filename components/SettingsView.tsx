
import React, { useEffect, useState } from 'react';
import { Player } from '../types';

interface SettingsViewProps {
  players: Player[];
  onProfileClick: () => void;
  onStatsClick: () => void;
  onLogout?: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ players, onProfileClick, onStatsClick, onLogout }) => {
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains('dark') ||
    localStorage.getItem('theme') === 'dark'
  );

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const exportPlayers = () => {
    if (players.length === 0) {
      alert("Nenhum jogador para exportar.");
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(players, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "jogadores_letsvolei.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const menuItems = [
    { icon: 'person', label: 'Meu Perfil', sub: 'Editar informações', action: onProfileClick },
    { icon: 'analytics', label: 'Estatísticas', sub: 'Dados e desempenho', action: onStatsClick },
    { icon: 'download', label: 'Exportar Elenco', sub: 'Baixar JSON dos atletas', action: exportPlayers },
    { icon: 'help', label: 'Ajuda', sub: 'Suporte e FAQ', action: () => window.open('https://github.com', '_blank') },
  ];

  return (
    <div className="pb-32 px-4 pt-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Ajustes</h1>
        <p className="text-slate-500 text-sm mt-1">Configure sua experiência</p>
      </header>

      <div className="bg-white dark:bg-card-dark rounded-3xl overflow-hidden ios-shadow mb-6">
        <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
            </div>
            <div>
              <p className="font-bold">Modo Escuro</p>
              <p className="text-xs text-slate-500">Alternar tema visual</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={`w-12 h-6 rounded-full relative transition-colors ${isDark ? 'bg-primary' : 'bg-slate-200'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${isDark ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        {menuItems.map((item, idx) => (
          <div
            key={idx}
            onClick={item.action}
            className={`p-6 flex items-center justify-between ${idx !== menuItems.length - 1 ? 'border-b border-slate-100 dark:border-white/5' : ''} active:bg-slate-50 dark:active:bg-background-dark/50 transition-colors cursor-pointer`}
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-background-dark flex items-center justify-center text-slate-500">
                <span className="material-symbols-outlined">{item.icon}</span>
              </div>
              <div>
                <p className="font-bold">{item.label}</p>
                <p className="text-xs text-slate-500">{item.sub}</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-300">chevron_right</span>
          </div>
        ))}
      </div>

      <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-3xl flex items-center gap-4 text-red-500 cursor-pointer active:scale-95 transition-transform" onClick={onLogout}>
        <span className="material-symbols-outlined">logout</span>
        <p className="font-bold">Sair do App</p>
      </div>

      <div className="mt-8 flex flex-col items-center gap-2 opacity-40">
        <img src="/app_icon.svg" alt="" className="h-6 w-6 rounded-md grayscale" />
        <p className="text-center text-[10px] text-slate-400">
          Lets Vôlei v1.0.6 • Desenvolvido com ❤️
        </p>
      </div>
    </div>
  );
};

export default SettingsView;


import React, { useState } from 'react';
import { Player } from '../types';
import PlayerCard from './PlayerCard';

interface PlayersViewProps {
  players: Player[];
  onAddClick: () => void;
  onRemove: (id: string) => void;
  loading?: boolean;
}

const PlayersView: React.FC<PlayersViewProps> = ({ players, onAddClick, onRemove, loading }) => {
  const [search, setSearch] = useState('');

  const filteredPlayers = players.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.gender.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pb-24">
      <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black tracking-tighter text-slate-800 dark:text-white uppercase">Jogadores</h2>
          <button
            onClick={onAddClick}
            className="flex items-center gap-1 bg-primary text-background-dark px-4 py-2 rounded-full font-bold text-sm ios-shadow hover:opacity-90 transition-opacity active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Novo
          </button>
        </div>
      </header>

      <div className="px-4 py-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">search</span>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 bg-white dark:bg-card-dark border-none rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-primary focus:outline-none transition-all ios-shadow"
            placeholder="Buscar jogador por nome ou sexo..."
            type="text"
          />
        </div>
      </div>

      <div className="px-4 mb-4 flex justify-between items-end">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-primary/70">
          Cadastrados ({filteredPlayers.length})
        </p>
        <p className="text-xs text-slate-400">Filtrar por Habilidade</p>
      </div>

      <div className="px-4 space-y-3">
        {loading ? (
          <div className="py-12 text-center">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
            <p className="mt-4 text-slate-500">Carregando jogadores...</p>
          </div>
        ) : filteredPlayers.length > 0 ? (
          filteredPlayers.map(player => (
            <PlayerCard key={player.id} player={player} onRemove={onRemove} />
          ))
        ) : (
          <div className="py-12 text-center">
            <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700">group_off</span>
            <p className="mt-4 text-slate-500">Nenhum jogador encontrado.</p>
          </div>
        )}
      </div>

      {players.length > 0 && (
        <div className="flex justify-center mt-8">
          <button className="text-primary font-semibold text-sm py-2 px-6 border border-primary/30 rounded-full hover:bg-primary/10 transition-colors">
            Ver todos os jogadores
          </button>
        </div>
      )}
    </div>
  );
};

export default PlayersView;

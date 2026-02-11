
import React, { useState } from 'react';
import { Player, PlayerSkills, SKILL_LABELS } from '../types';
import SkillStars from './SkillStars';

interface PlayerCardProps {
  player: Player;
  onRemove?: (id: string) => void;
}

const SKILL_COLORS: Record<keyof PlayerSkills, string> = {
  ataque: 'bg-red-500',
  defesa: 'bg-blue-500',
  recepcao: 'bg-emerald-500',
  levantamento: 'bg-purple-500',
  saque: 'bg-amber-500',
  bloqueio: 'bg-cyan-500',
};

const PlayerCard: React.FC<PlayerCardProps> = ({ player, onRemove }) => {
  const [expanded, setExpanded] = useState(false);

  const isIntermediario = player.level.includes('Intermediário');
  const isCasual = player.level.includes('Casual');

  const borderColor = player.isMVP
    ? 'border-primary'
    : isIntermediario
      ? 'border-accent-orange/50'
      : isCasual
        ? 'border-slate-300 dark:border-slate-700'
        : 'border-primary';

  return (
    <div
      className={`bg-white dark:bg-card-dark rounded-xl ios-shadow border-l-4 ${borderColor} group relative overflow-hidden transition-all duration-300`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-4 p-4 cursor-pointer">
        <div className="relative">
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-14 w-14 ring-2 ring-primary/20"
            style={{ backgroundImage: `url("${player.avatarUrl}")` }}
          />
          {player.isMVP && (
            <div className="absolute -bottom-1 -right-1 bg-accent-orange text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full ring-2 ring-white dark:ring-card-dark">
              MVP
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-slate-900 dark:text-white text-base font-semibold leading-tight truncate">
            {player.name}
          </p>
          <p className="text-slate-500 dark:text-primary/60 text-xs font-medium uppercase tracking-tight mt-0.5">
            {player.gender}
          </p>
        </div>

        <div className="text-right flex items-center gap-2">
          <div>
            <div className="flex items-center gap-1 justify-end">
              <span className="text-slate-900 dark:text-white text-base font-bold">
                {player.rating.toFixed(1)}
              </span>
              <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              {player.level}
            </p>
          </div>
          <span className={`material-symbols-outlined text-slate-400 text-[18px] transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </div>

        {onRemove && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(player.id); }}
            className="absolute right-0 top-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity text-red-500"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        )}
      </div>

      {/* Expanded Skills Section */}
      {expanded && player.skills && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-white/5 animate-in slide-in-from-top-2 duration-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Habilidades</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {(Object.keys(SKILL_LABELS) as (keyof PlayerSkills)[]).map(key => (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${SKILL_COLORS[key]} flex-shrink-0`} />
                <span className="text-[11px] text-slate-500 dark:text-slate-400 w-20 truncate">{SKILL_LABELS[key]}</span>
                <div className="flex-1 flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${i <= player.skills[key] ? SKILL_COLORS[key] : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerCard;

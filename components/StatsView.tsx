
import React from 'react';
import { Player, Gender, PlayerSkills, SKILL_LABELS } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

interface StatsViewProps {
  players: Player[];
}

const SKILL_COLORS: Record<keyof PlayerSkills, string> = {
  ataque: '#ef4444',
  defesa: '#3b82f6',
  recepcao: '#10b981',
  levantamento: '#8b5cf6',
  saque: '#f59e0b',
  bloqueio: '#06b6d4',
};

const StatsView: React.FC<StatsViewProps> = ({ players }) => {
  const genderData = Object.values(Gender).map(g => ({
    name: g,
    count: players.filter(p => p.gender === g).length
  }));

  const ratingData = [
    { name: '1-2', count: players.filter(p => p.rating < 2).length },
    { name: '2-3', count: players.filter(p => p.rating >= 2 && p.rating < 3).length },
    { name: '3-4', count: players.filter(p => p.rating >= 3 && p.rating < 4).length },
    { name: '4-5', count: players.filter(p => p.rating >= 4).length },
  ];

  const avgRating = players.length > 0
    ? (players.reduce((acc, p) => acc + p.rating, 0) / players.length).toFixed(1)
    : 0;

  // Radar chart: average skills of entire squad
  const skillKeys = Object.keys(SKILL_LABELS) as (keyof PlayerSkills)[];
  const radarData = skillKeys.map(key => ({
    skill: SKILL_LABELS[key],
    value: players.length > 0
      ? parseFloat((players.reduce((acc, p) => acc + (p.skills?.[key] || 0), 0) / players.length).toFixed(1))
      : 0,
    fullMark: 5,
  }));

  const COLORS = ['#FF3B3B', '#ff8c42', '#3b82f6', '#8b5cf6', '#ec4899'];

  return (
    <div className="pb-32 px-4 pt-12 overflow-x-hidden">
      <header className="mb-10">
        <h2 className="text-3xl font-black tracking-tighter text-slate-800 dark:text-white uppercase">Estatísticas</h2>
        <p className="text-slate-500 text-sm mt-1">Visão geral do seu elenco</p>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white dark:bg-card-dark p-6 rounded-3xl ios-shadow border-l-4 border-primary">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Média Geral</p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-primary">{avgRating}</p>
            <span className="material-symbols-outlined text-primary fill-1">star</span>
          </div>
        </div>
        <div className="bg-white dark:bg-card-dark p-6 rounded-3xl ios-shadow">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Atletas</p>
          <p className="text-3xl font-bold">{players.length}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Radar Chart - Skills */}
        <div className="bg-white dark:bg-card-dark p-6 rounded-3xl ios-shadow">
          <h3 className="text-sm font-bold text-slate-500 uppercase mb-2">Habilidades Médias</h3>
          <p className="text-[11px] text-slate-400 mb-4">Média técnica do grupo</p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#334155" strokeOpacity={0.3} />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 5]}
                  tick={{ fontSize: 9, fill: '#64748b' }}
                  tickCount={6}
                />
                <Radar
                  name="Média"
                  dataKey="value"
                  stroke="#FF3B3B"
                  fill="#FF3B3B"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a2e22', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Skill summary badges */}
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {radarData.map((item, i) => (
              <div
                key={item.skill}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
                style={{ backgroundColor: Object.values(SKILL_COLORS)[i] + '20', color: Object.values(SKILL_COLORS)[i] }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: Object.values(SKILL_COLORS)[i] }} />
                {item.skill}: {item.value}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-card-dark p-6 rounded-3xl ios-shadow">
          <h3 className="text-sm font-bold text-slate-500 uppercase mb-6">Distribuição por Sexo</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={genderData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={80} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#1a2e22', border: 'none', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-card-dark p-6 rounded-3xl ios-shadow">
          <h3 className="text-sm font-bold text-slate-500 uppercase mb-6">Nível de Habilidade</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ratingData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {ratingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsView;

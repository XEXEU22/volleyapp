
import React, { useState, useRef } from 'react';
import { Player } from '../types';
import PlayerCard from './PlayerCard';
import { GoogleGenAI, Type } from "@google/genai";
import html2canvas from 'html2canvas';

interface DrawViewProps {
  players: Player[];
}

const DrawView: React.FC<DrawViewProps> = ({ players }) => {
  const [teams, setTeams] = useState<Player[][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [playersPerTeam, setPlayersPerTeam] = useState<4 | 6>(6);
  const resultsRef = useRef<HTMLDivElement>(null);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSimpleDraw = () => {
    setIsDrawing(true);
    const selectedPlayers = players.filter(p => selectedIds.includes(p.id));
    const shuffled = [...selectedPlayers].sort(() => 0.5 - Math.random());

    const numTeams = Math.floor(shuffled.length / playersPerTeam);
    const newTeams: Player[][] = [];

    for (let i = 0; i < numTeams; i++) {
      newTeams.push(shuffled.slice(i * playersPerTeam, (i + 1) * playersPerTeam));
    }

    setTimeout(() => {
      setTeams(newTeams);
      setIsDrawing(false);
    }, 800);
  };

  const handleSmartDraw = async () => {
    setIsDrawing(true);
    const selectedPlayers = players.filter(p => selectedIds.includes(p.id));
    const numTeams = Math.floor(selectedPlayers.length / playersPerTeam);

    if (numTeams < 2) {
      alert(`Selecione pelo menos ${playersPerTeam * 2} jogadores para formar 2 times de ${playersPerTeam}`);
      setIsDrawing(false);
      return;
    }

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
        throw new Error("Chave de API Gemini não configurada");
      }

      const ai = new GoogleGenAI({ apiKey });

      const teamNames = Array.from({ length: numTeams }, (_, i) => `team${i + 1}`);
      const schemaProperties: any = {};
      teamNames.forEach(name => {
        schemaProperties[name] = { type: Type.ARRAY, items: { type: Type.STRING } };
      });

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `Divida estes jogadores de vôlei em ${numTeams} times equilibrados, cada um com exatamente ${playersPerTeam} jogadores, baseado na nota, sexo e habilidades individuais. 
        REGRA IMPORTANTE: O equilíbrio deve considerar o Sexo. Historicamente neste grupo, as mulheres (Feminino) são consideradas como tendo um peso de intensidade/velocidade menor que os homens (Masculino). Garanta que os times fiquem nivelados tecnicamente considerando essa diferenciação.
        Retorne um JSON com os arrays de IDs para os seguintes times: ${teamNames.join(', ')}.
        Jogadores: ${JSON.stringify(selectedPlayers.map(p => ({ id: p.id, name: p.name, rating: p.rating, gender: p.gender, skills: p.skills })))}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: schemaProperties,
            required: teamNames
          }
        }
      });

      const result = JSON.parse(response.text);
      const newTeams: Player[][] = teamNames.map(name => {
        const ids = result[name] || [];
        return selectedPlayers.filter(p => ids.includes(p.id));
      });

      setTeams(newTeams);
    } catch (error) {
      console.error("AI draw failed:", error);
      handleSimpleDraw(); // Fallback
    } finally {
      setIsDrawing(false);
    }
  };

  const shareResults = async () => {
    if (!resultsRef.current) return;
    setIsSharing(true);
    try {
      const canvas = await html2canvas(resultsRef.current, {
        backgroundColor: document.documentElement.classList.contains('dark') ? '#1c1c1e' : '#f2f2f7',
        scale: 2,
        useCORS: true,
        logging: false
      });

      const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
      const file = new File([blob], 'times_sorteados.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Times Sorteados - Lets Vôlei',
          text: 'Confira os times para a pelada de hoje!'
        });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'times_sorteados.png';
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error sharing:', err);
      alert('Não foi possível compartilhar a imagem. Tente tirar um print da tela.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="pb-40 px-4 pt-12">
      <header className="mb-8">
        <h2 className="text-3xl font-black tracking-tighter text-slate-800 dark:text-white uppercase">Sorteio</h2>
        <p className="text-slate-500 text-sm mt-1">Selecione quem participa da pelada hoje</p>
      </header>

      {teams.length === 0 ? (
        <>
          <div className="bg-white dark:bg-card-dark rounded-3xl p-5 mb-8 ios-shadow border border-slate-100 dark:border-white/5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">Formato do Jogo</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPlayersPerTeam(4)}
                className={`py-3 rounded-2xl font-bold text-sm transition-all border-2 ${playersPerTeam === 4 ? 'bg-primary/10 border-primary text-primary' : 'bg-slate-50 dark:bg-background-dark border-transparent text-slate-500'}`}
              >
                4 vs 4
              </button>
              <button
                onClick={() => setPlayersPerTeam(6)}
                className={`py-3 rounded-2xl font-bold text-sm transition-all border-2 ${playersPerTeam === 6 ? 'bg-primary/10 border-primary text-primary' : 'bg-slate-50 dark:bg-background-dark border-transparent text-slate-500'}`}
              >
                6 vs 6
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4 px-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Jogadores ({selectedIds.length})
            </p>
            <button
              onClick={() => setSelectedIds(selectedIds.length === players.length ? [] : players.map(p => p.id))}
              className="text-primary text-xs font-bold"
            >
              {selectedIds.length === players.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 mb-8">
            {players.map(player => (
              <div
                key={player.id}
                onClick={() => toggleSelection(player.id)}
                className={`relative group transition-all duration-300 ${selectedIds.includes(player.id) ? 'scale-[1.01]' : 'opacity-60 grayscale-[0.5]'}`}
              >
                <div className={`absolute top-1/2 -left-2 -translate-y-1/2 w-6 h-6 rounded-full ios-shadow z-10 flex items-center justify-center transition-all ${selectedIds.includes(player.id) ? 'bg-primary text-white' : 'bg-white dark:bg-slate-800 text-transparent border border-slate-200 dark:border-slate-700'}`}>
                  <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                </div>
                <div className="pl-4">
                  <PlayerCard player={player} />
                </div>
              </div>
            ))}
          </div>

          <div className="fixed bottom-24 left-4 right-4 max-w-md mx-auto grid grid-cols-2 gap-4 z-20">
            <button
              onClick={handleSimpleDraw}
              disabled={selectedIds.length < playersPerTeam * 2 || isDrawing}
              className="bg-white dark:bg-card-dark text-slate-900 dark:text-white font-bold py-4 rounded-2xl ios-shadow active:scale-95 transition-all border border-slate-200 dark:border-white/5 disabled:opacity-50"
            >
              Sorteio Simples
            </button>
            <button
              onClick={handleSmartDraw}
              disabled={selectedIds.length < playersPerTeam * 2 || isDrawing}
              className="bg-primary text-background-dark font-bold py-4 rounded-2xl ios-shadow active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isDrawing ? (
                <span className="animate-spin material-symbols-outlined text-background-dark">sync</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-background-dark">auto_awesome</span>
                  Equilibrar IA
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div ref={resultsRef} className="p-4 bg-background-light dark:bg-background-dark rounded-[40px]">
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Times Gerados</h3>
              <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">{playersPerTeam} jogadores / time</span>
            </div>

            <div className="space-y-6">
              {teams.map((team, idx) => (
                <div key={idx} className="bg-white dark:bg-card-dark rounded-[32px] p-6 border border-slate-100 dark:border-white/5 ios-shadow">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`h-10 w-10 rounded-2xl flex items-center justify-center text-white font-black text-lg ${idx % 2 === 0 ? 'bg-primary' : 'bg-accent-orange'}`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <div>
                      <h2 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Time {String.fromCharCode(65 + idx)}</h2>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Força Técnica: {(team.reduce((acc, p) => acc + p.rating, 0) / team.length).toFixed(1)}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {team.map(p => <div key={p.id} className="scale-95 origin-left opacity-90"><PlayerCard player={p} /></div>)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setTeams([])}
              className="py-5 text-slate-500 font-black uppercase tracking-widest text-xs bg-slate-100 dark:bg-white/5 rounded-[32px] active:scale-95 transition-all"
            >
              Recomeçar
            </button>
            <button
              onClick={shareResults}
              disabled={isSharing}
              className="py-5 bg-primary text-background-dark font-black uppercase tracking-widest text-xs rounded-[32px] ios-shadow active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isSharing ? (
                <span className="animate-spin material-symbols-outlined">sync</span>
              ) : (
                <>
                  <span className="material-symbols-outlined">share</span>
                  Compartilhar
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrawView;

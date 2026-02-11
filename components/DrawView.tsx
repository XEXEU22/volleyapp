
import React, { useState } from 'react';
import { Player } from '../types';
import PlayerCard from './PlayerCard';
import { GoogleGenAI, Type } from "@google/genai";

interface DrawViewProps {
  players: Player[];
}

const DrawView: React.FC<DrawViewProps> = ({ players }) => {
  const [teams, setTeams] = useState<Player[][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSimpleDraw = () => {
    setIsDrawing(true);
    const selectedPlayers = players.filter(p => selectedIds.includes(p.id));
    const shuffled = [...selectedPlayers].sort(() => 0.5 - Math.random());

    const mid = Math.ceil(shuffled.length / 2);
    const team1 = shuffled.slice(0, mid);
    const team2 = shuffled.slice(mid);

    setTimeout(() => {
      setTeams([team1, team2]);
      setIsDrawing(false);
    }, 800);
  };

  const handleSmartDraw = async () => {
    setIsDrawing(true);
    const selectedPlayers = players.filter(p => selectedIds.includes(p.id));

    if (selectedPlayers.length < 2) {
      alert("Selecione pelo menos 2 jogadores");
      setIsDrawing(false);
      return;
    }

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
        throw new Error("Chave de API Gemini não configurada");
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `Divida estes jogadores de vôlei em 2 times equilibrados baseado na nota, sexo e habilidades individuais. 
        REGRA IMPORTANTE: O equilíbrio deve considerar o Sexo. Historicamente neste grupo, as mulheres (Feminino) são consideradas como tendo um peso de intensidade/velocidade menor que os homens (Masculino). Garanta que os times fiquem nivelados tecnicamente considerando essa diferenciação.
        Retorne um JSON com dois arrays de IDs: { "team1": ["id1", "id2"], "team2": ["id3", "id4"] }.
        Jogadores: ${JSON.stringify(selectedPlayers.map(p => ({ id: p.id, name: p.name, rating: p.rating, gender: p.gender, skills: p.skills })))}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              team1: { type: Type.ARRAY, items: { type: Type.STRING } },
              team2: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["team1", "team2"]
          }
        }
      });

      const result = JSON.parse(response.text);
      const team1 = selectedPlayers.filter(p => result.team1.includes(p.id));
      const team2 = selectedPlayers.filter(p => result.team2.includes(p.id));

      setTeams([team1, team2]);
    } catch (error) {
      console.error("AI draw failed:", error);
      handleSimpleDraw(); // Fallback
    } finally {
      setIsDrawing(false);
    }
  };

  return (
    <div className="pb-32 px-4 pt-12">
      <header className="mb-8">
        <h2 className="text-3xl font-black tracking-tighter text-slate-800 dark:text-white uppercase">Sorteio</h2>
        <p className="text-slate-500 text-sm mt-1">Selecione os jogadores presentes hoje</p>
      </header>

      {teams.length === 0 ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Selecionados ({selectedIds.length})
            </p>
            <button
              onClick={() => setSelectedIds(players.map(p => p.id))}
              className="text-primary text-xs font-bold"
            >
              Selecionar Todos
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 mb-8">
            {players.map(player => (
              <div
                key={player.id}
                onClick={() => toggleSelection(player.id)}
                className={`transition-all ${selectedIds.includes(player.id) ? 'opacity-100 scale-[1.02]' : 'opacity-40 grayscale'}`}
              >
                <PlayerCard player={player} />
              </div>
            ))}
          </div>

          <div className="fixed bottom-24 left-4 right-4 max-w-md mx-auto grid grid-cols-2 gap-4">
            <button
              onClick={handleSimpleDraw}
              disabled={selectedIds.length < 2 || isDrawing}
              className="bg-white dark:bg-card-dark text-slate-900 dark:text-white font-bold py-4 rounded-2xl ios-shadow active:scale-95 transition-all border border-slate-200 dark:border-white/5 disabled:opacity-50"
            >
              Sorteio Aleatório
            </button>
            <button
              onClick={handleSmartDraw}
              disabled={selectedIds.length < 2 || isDrawing}
              className="bg-primary text-background-dark font-bold py-4 rounded-2xl ios-shadow active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isDrawing ? (
                <span className="animate-spin material-symbols-outlined">sync</span>
              ) : (
                <>
                  <span className="material-symbols-outlined">auto_awesome</span>
                  Sorteio IA
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <h2 className="text-lg font-bold">Time A</h2>
            </div>
            <div className="space-y-3">
              {teams[0].map(p => <PlayerCard key={p.id} player={p} />)}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-2 w-2 rounded-full bg-accent-orange" />
              <h2 className="text-lg font-bold">Time B</h2>
            </div>
            <div className="space-y-3">
              {teams[1].map(p => <PlayerCard key={p.id} player={p} />)}
            </div>
          </div>

          <button
            onClick={() => setTeams([])}
            className="w-full py-4 text-slate-500 font-bold border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl"
          >
            Refazer Sorteio
          </button>
        </div>
      )}
    </div>
  );
};

export default DrawView;

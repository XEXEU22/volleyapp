
import React, { useState, useEffect } from 'react';
import { Player, Gender, SkillLevel, PlayerSkills, SKILL_LABELS } from '../types';
import SkillStars from './SkillStars';

interface AddPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (player: Player, photo?: File) => void;
  initialPlayer?: Player | null;
}

const DEFAULT_SKILLS: PlayerSkills = {
  ataque: 3,
  defesa: 3,
  recepcao: 3,
  levantamento: 3,
  saque: 3,
  bloqueio: 3,
};

const AddPlayerModal: React.FC<AddPlayerModalProps> = ({ isOpen, onClose, onAdd, initialPlayer }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>(Gender.MASCULINO);
  const [level, setLevel] = useState<SkillLevel>(SkillLevel.PRO);
  const [skills, setSkills] = useState<PlayerSkills>({ ...DEFAULT_SKILLS });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (initialPlayer) {
      setName(initialPlayer.name);
      setGender(initialPlayer.gender);
      setLevel(initialPlayer.level);
      setSkills({ ...initialPlayer.skills });
      setPhotoPreview(initialPlayer.avatarUrl);
    } else {
      setName('');
      setGender(Gender.MASCULINO);
      setLevel(SkillLevel.PRO);
      setSkills({ ...DEFAULT_SKILLS });
      setPhotoPreview(null);
    }
    setPhoto(null);
  }, [initialPlayer, isOpen]);

  if (!isOpen) return null;

  const avgRating = parseFloat(
    (Object.values(skills).reduce((a, b) => a + b, 0) / Object.values(skills).length).toFixed(1)
  );

  const updateSkill = (key: keyof PlayerSkills, value: number) => {
    setSkills(prev => ({ ...prev, [key]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const playerToSave: Player = {
      id: initialPlayer ? initialPlayer.id : Math.random().toString(36).substr(2, 9),
      user_id: initialPlayer?.user_id,
      name,
      gender,
      level,
      rating: avgRating,
      avatarUrl: photoPreview || `https://picsum.photos/seed/${name}/200`,
      isMVP: avgRating >= 4.8,
      skills,
    };

    onAdd(playerToSave, photo || undefined);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background-light dark:bg-card-dark w-full max-w-xs rounded-3xl overflow-hidden ios-shadow animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] flex flex-col">
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{initialPlayer ? 'Editar Atleta' : 'Novo Atleta'}</h2>
            <button onClick={onClose} className="text-slate-400">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Photo Upload Container */}
            <div className="flex flex-col items-center mb-6">
              <label className="relative group cursor-pointer">
                <div className="h-24 w-24 rounded-3xl bg-slate-100 dark:bg-background-dark flex items-center justify-center text-slate-400 overflow-hidden border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-primary transition-colors">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-4xl">add_a_photo</span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <div className="absolute -bottom-2 -right-2 bg-primary text-background-dark h-8 w-8 rounded-full flex items-center justify-center ios-shadow">
                  <span className="material-symbols-outlined text-[18px]">{photoPreview ? 'edit' : 'add'}</span>
                </div>
              </label>
              <p className="text-[10px] font-bold text-slate-500 uppercase mt-3 tracking-widest">Foto do Atleta</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Nome</label>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white dark:bg-background-dark border-none rounded-xl text-sm focus:ring-2 focus:ring-primary placeholder:text-slate-500"
                placeholder="Ex: João Silva"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Sexo</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full bg-white dark:bg-background-dark border-none rounded-xl text-sm focus:ring-2 focus:ring-primary"
                >
                  {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Nível</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as SkillLevel)}
                  className="w-full bg-white dark:bg-background-dark border-none rounded-xl text-sm focus:ring-2 focus:ring-primary"
                >
                  {Object.values(SkillLevel).map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            {/* Skills Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Habilidades</label>
                <span className="text-xs font-bold text-primary">
                  Média: {avgRating.toFixed(1)} ★
                </span>
              </div>
              <div className="space-y-2.5 bg-white dark:bg-background-dark rounded-xl p-3">
                {(Object.keys(SKILL_LABELS) as (keyof PlayerSkills)[]).map(key => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 w-24">
                      {SKILL_LABELS[key]}
                    </span>
                    <SkillStars value={skills[key]} onChange={(v) => updateSkill(key, v)} size="sm" />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-background-dark font-bold py-3 rounded-xl mt-4 ios-shadow active:scale-95 transition-transform"
            >
              {initialPlayer ? 'Salvar Alterações' : 'Adicionar Jogador'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPlayerModal;

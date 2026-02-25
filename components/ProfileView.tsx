
import React, { useState, useEffect } from 'react';
import { UserProfile, Gender, SkillLevel } from '../types';
import { supabase } from '../lib/supabase';

interface ProfileViewProps {
    onBack: () => void;
    userId: string;
}

const ProfileView: React.FC<ProfileViewProps> = ({ onBack, userId }) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    useEffect(() => {
        fetchProfile();
    }, [userId]);

    const fetchProfile = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .limit(1)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            // Create a default one if it doesn't exist
            setProfile({
                id: '',
                user_id: userId,
                name: 'Seu Nome',
                gender: Gender.MASCULINO,
                level: SkillLevel.PRO,
                avatarUrl: '',
                bio: 'Escreva algo sobre você...',
                age: 25,
                phone: ''
            });
        } else {
            setProfile({
                id: data.id,
                user_id: data.user_id,
                name: data.name,
                gender: data.gender as any,
                level: data.level as SkillLevel,
                avatarUrl: data.avatar_url || '',
                bio: data.bio || '',
                age: data.age || undefined,
                phone: data.phone || ''
            });
            setPhotoPreview(data.avatar_url || null);
        }
        setLoading(false);
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

    const saveProfile = async () => {
        if (!profile) return;
        setSaving(true);

        let finalAvatarUrl = profile.avatarUrl;

        if (photo) {
            const fileExt = photo.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${userId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, photo);

            if (!uploadError) {
                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath);
                finalAvatarUrl = publicUrl;
            }
        }

        const profileData = {
            user_id: userId,
            name: profile.name,
            gender: profile.gender,
            level: profile.level,
            bio: profile.bio,
            age: profile.age,
            phone: profile.phone,
            avatar_url: finalAvatarUrl,
            updated_at: new Date().toISOString()
        };

        const { data, error: upsertError } = await supabase
            .from('profiles')
            .upsert(profileData, { onConflict: 'user_id' })
            .select()
            .single();

        if (upsertError) {
            console.error('Error saving profile:', upsertError);
            if (upsertError.message.includes('public.profiles') || upsertError.message.includes('schema cache')) {
                alert('Erro: A tabela "profiles" não foi encontrada ou precisa ser atualizada. Por favor, execute o arquivo "profile_fields_update.sql" no seu Editor SQL do Supabase.');
            } else {
                alert(`Erro ao salvar perfil: ${upsertError.message}`);
            }
        } else {
            alert('Perfil salvo com sucesso!');
            if (data) {
                setProfile({
                    id: data.id,
                    user_id: data.user_id,
                    name: data.name,
                    gender: data.gender as any,
                    level: data.level as SkillLevel,
                    avatarUrl: data.avatar_url || '',
                    bio: data.bio || '',
                    age: data.age || undefined,
                    phone: data.phone || ''
                });
            }
            onBack();
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <span className="material-symbols-outlined animate-spin text-primary text-4xl">sync</span>
                <p className="mt-4 text-slate-500">Carregando perfil...</p>
            </div>
        );
    }

    return (
        <div className="pb-32 animate-in fade-in duration-300">
            <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 pt-6 pb-2 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 -ml-2 text-slate-500">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-bold">Meu Perfil</h1>
                </div>
            </header>

            <div className="px-4 pt-4 space-y-6">
                {/* Photo Upload */}
                <div className="flex flex-col items-center">
                    <label className="relative cursor-pointer group">
                        <div className="h-28 w-28 rounded-[36px] bg-slate-100 dark:bg-card-dark flex items-center justify-center text-slate-400 overflow-hidden border-4 border-white dark:border-background-dark ios-shadow-lg">
                            {photoPreview ? (
                                <img src={photoPreview} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                <span className="material-symbols-outlined text-4xl">person</span>
                            )}
                        </div>
                        <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                        <div className="absolute -bottom-2 -right-2 bg-primary text-background-dark h-9 w-9 rounded-full flex items-center justify-center border-4 border-white dark:border-background-dark ios-shadow">
                            <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
                        </div>
                    </label>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider ml-1">Nome de Jogador</label>
                        <input
                            type="text"
                            value={profile?.name}
                            onChange={(e) => setProfile(prev => prev ? { ...prev, name: e.target.value } : null)}
                            className="w-full bg-white dark:bg-card-dark border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary py-4 px-4 ios-shadow"
                            placeholder="Como quer ser chamado?"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider ml-1">Idade</label>
                            <input
                                type="number"
                                value={profile?.age || ''}
                                onChange={(e) => setProfile(prev => prev ? { ...prev, age: parseInt(e.target.value) || undefined } : null)}
                                className="w-full bg-white dark:bg-card-dark border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary py-4 px-4 ios-shadow"
                                placeholder="Sua idade"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider ml-1">Telefone / WhatsApp</label>
                            <input
                                type="tel"
                                value={profile?.phone || ''}
                                onChange={(e) => setProfile(prev => prev ? { ...prev, phone: e.target.value } : null)}
                                className="w-full bg-white dark:bg-card-dark border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary py-4 px-4 ios-shadow"
                                placeholder="(00) 00000-0000"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider ml-1">Sexo</label>
                            <select
                                value={profile?.gender}
                                onChange={(e) => setProfile(prev => prev ? { ...prev, gender: e.target.value as Gender } : null)}
                                className="w-full bg-white dark:bg-card-dark border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary py-4 px-4 ios-shadow"
                            >
                                {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider ml-1">Seu Nível</label>
                            <select
                                value={profile?.level}
                                onChange={(e) => setProfile(prev => prev ? { ...prev, level: e.target.value as SkillLevel } : null)}
                                className="w-full bg-white dark:bg-card-dark border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary py-4 px-4 ios-shadow"
                            >
                                {Object.values(SkillLevel).map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider ml-1">Bio / Descrição</label>
                        <textarea
                            rows={3}
                            value={profile?.bio}
                            onChange={(e) => setProfile(prev => prev ? { ...prev, bio: e.target.value } : null)}
                            className="w-full bg-white dark:bg-card-dark border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary py-4 px-4 ios-shadow resize-none"
                            placeholder="Fale um pouco sobre seu estilo de jogo..."
                        />
                    </div>
                </div>

                <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="w-full bg-primary text-background-dark font-bold py-4 rounded-2xl mt-4 ios-shadow active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {saving ? (
                        <span className="animate-spin material-symbols-outlined">sync</span>
                    ) : (
                        <>
                            <span className="material-symbols-outlined">save</span>
                            Salvar Perfil
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ProfileView;

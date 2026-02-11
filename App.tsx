
import React, { useState, useEffect } from 'react';
import { ViewType, Player, PlayerSkills, UserProfile } from './types';
import { INITIAL_PLAYERS } from './constants';
import { supabase } from './lib/supabase';
import PlayersView from './components/PlayersView';
import DrawView from './components/DrawView';
import StatsView from './components/StatsView';
import SettingsView from './components/SettingsView';
import ProfileView from './components/ProfileView';
import BottomNav from './components/BottomNav';
import AddPlayerModal from './components/AddPlayerModal';
import LoginView from './components/LoginView';

// Convert DB row to Player object
const rowToPlayer = (row: any): Player => ({
  id: row.id,
  user_id: row.user_id,
  name: row.name,
  gender: row.gender as any,
  rating: parseFloat(row.rating),
  level: row.level,
  avatarUrl: row.avatar_url || '',
  isMVP: row.is_mvp || false,
  skills: {
    ataque: row.skill_ataque,
    defesa: row.skill_defesa,
    recepcao: row.skill_recepcao,
    levantamento: row.skill_levantamento,
    saque: row.skill_saque,
    bloqueio: row.skill_bloqueio,
  },
});

// Convert Player to DB row
const playerToRow = (player: Player) => ({
  user_id: player.user_id,
  name: player.name,
  gender: player.gender,
  rating: player.rating,
  level: player.level,
  avatar_url: player.avatarUrl,
  is_mvp: player.isMVP || false,
  skill_ataque: player.skills.ataque,
  skill_defesa: player.skills.defesa,
  skill_recepcao: player.skills.recepcao,
  skill_levantamento: player.skills.levantamento,
  skill_saque: player.skills.saque,
  skill_bloqueio: player.skills.bloqueio,
});

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ViewType>('players');
  const [players, setPlayers] = useState<Player[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setPlayers([]);
        setActiveTab('players');
      }
    });

    // Apply theme (Default to dark for new users)
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme || savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      if (!savedTheme) localStorage.setItem('theme', 'dark'); // Initialize for new users
    } else {
      document.documentElement.classList.remove('dark');
    }

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchPlayers(session.user.id);
    }
  }, [session]);

  const fetchPlayers = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching players:', error);
      // Fallback to initial data if table doesn't exist yet but it shouldn't happen now
    } else {
      setPlayers(data.map(rowToPlayer));
    }
    setLoading(false);
  };

  const addPlayer = async (newPlayer: Player, photo?: File) => {
    if (!session) return;
    let finalAvatarUrl = newPlayer.avatarUrl;

    if (photo) {
      const fileExt = photo.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${session.user.id}/${fileName}`;

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

    const row = playerToRow({ ...newPlayer, avatarUrl: finalAvatarUrl, user_id: session.user.id });
    const { data, error } = await supabase
      .from('players')
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error('Error adding player:', error);
      alert(`Erro ao adicionar: ${error.message}`);
    } else {
      setPlayers(prev => [rowToPlayer(data), ...prev]);
    }
    setIsAddModalOpen(false);
  };

  const removePlayer = async (id: string) => {
    if (!session) return;
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error removing player:', error);
    } else {
      setPlayers(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const renderContent = () => {
    if (authLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
          <span className="material-symbols-outlined animate-spin text-primary text-4xl">sync</span>
        </div>
      );
    }

    if (!session) {
      return <LoginView onSuccess={(isNewUser) => {
        if (isNewUser) setIsAddModalOpen(true);
      }} />;
    }

    switch (activeTab) {
      case 'players':
        return <PlayersView
          players={players}
          onAddClick={() => setIsAddModalOpen(true)}
          onRemove={removePlayer}
          loading={loading}
        />;
      case 'draw':
        return <DrawView players={players} />;
      case 'stats':
        return <StatsView players={players} />;
      case 'settings':
        return <SettingsView players={players} onProfileClick={() => setActiveTab('profile')} onLogout={handleLogout} />;
      case 'profile':
        return <ProfileView onBack={() => setActiveTab('settings')} userId={session.user.id} />;
      default:
        return <PlayersView players={players} onAddClick={() => setIsAddModalOpen(true)} onRemove={removePlayer} loading={loading} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto relative">
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>

      {session && (
        <div className="fixed bottom-[90px] right-6 text-right pointer-events-none z-0">
          <h1 className="text-2xl font-black tracking-tighter text-primary/30 uppercase italic leading-none">Lets Vôlei</h1>
          <p className="text-[8px] text-slate-500/40 uppercase font-black tracking-[0.3em] mt-0.5">
            criador: Rafael Cesar
          </p>
        </div>
      )}

      {session && activeTab !== 'profile' && (
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      )}

      <AddPlayerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addPlayer}
      />
    </div>
  );
};

export default App;

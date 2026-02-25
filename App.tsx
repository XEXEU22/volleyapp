
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
import DownloadView from './components/DownloadView';
import FinanceView from './components/FinanceView';

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
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authTimeout, setAuthTimeout] = useState(false);

  useEffect(() => {
    // Set a timeout for auth loading (8 seconds)
    const timeout = setTimeout(() => {
      if (authLoading) {
        setAuthTimeout(true);
      }
    }, 8000);

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

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
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
    } else {
      setPlayers(data.map(rowToPlayer));
    }
    setLoading(false);
  };

  const savePlayer = async (playerToSave: Player, photo?: File) => {
    if (!session) return;
    let finalAvatarUrl = playerToSave.avatarUrl;

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

    const row = {
      ...playerToRow({ ...playerToSave, avatarUrl: finalAvatarUrl, user_id: session.user.id }),
      id: playerToSave.id
    };

    const { data, error } = await supabase
      .from('players')
      .upsert(row)
      .select()
      .single();

    if (error) {
      console.error('Error saving player:', error);
      alert(`Erro ao salvar: ${error.message}`);
    } else {
      const savedPlayer = rowToPlayer(data);
      setPlayers(prev => {
        const exists = prev.find(p => p.id === savedPlayer.id);
        if (exists) {
          return prev.map(p => p.id === savedPlayer.id ? savedPlayer : p);
        }
        return [savedPlayer, ...prev];
      });
    }
    setIsAddModalOpen(false);
    setEditingPlayer(null);
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

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setIsAddModalOpen(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const renderContent = () => {
    if (authLoading) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark p-6 text-center">
          <span className="material-symbols-outlined animate-spin text-primary text-4xl mb-4">sync</span>
          {authTimeout && (
            <div className="animate-in fade-in duration-700">
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                O carregamento está demorando mais que o esperado...
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-white rounded-full font-bold text-sm"
              >
                Tentar Novamente
              </button>
            </div>
          )}
        </div>
      );
    }


    if (!session) {
      return <LoginView onSuccess={(isNewUser) => {
        if (isNewUser) {
          setEditingPlayer(null);
          setIsAddModalOpen(true);
        }
      }} />;
    }

    switch (activeTab) {
      case 'players':
        return <PlayersView
          players={players}
          onAddClick={() => {
            setEditingPlayer(null);
            setIsAddModalOpen(true);
          }}
          onRemove={removePlayer}
          onEdit={handleEditPlayer}
          loading={loading}
        />;
      case 'draw':
        return <DrawView players={players} />;
      case 'stats':
        return <StatsView players={players} />;
      case 'finance':
        return <FinanceView players={players} userId={session.user.id} />;
      case 'settings':
        return <SettingsView players={players} onProfileClick={() => setActiveTab('profile')} onStatsClick={() => setActiveTab('stats')} onLogout={handleLogout} />;
      case 'download':
        return <DownloadView />;
      case 'profile':
        return <ProfileView onBack={() => setActiveTab('settings')} userId={session.user.id} />;
      default:
        return <PlayersView
          players={players}
          onAddClick={() => {
            setEditingPlayer(null);
            setIsAddModalOpen(true);
          }}
          onRemove={removePlayer}
          onEdit={handleEditPlayer}
          loading={loading}
        />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto relative">
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>

      {session && (
        <div className="fixed bottom-[90px] right-6 text-right pointer-events-none z-0 flex flex-col items-end gap-1">
          <img src="/app_icon.svg" alt="" className="h-8 w-8 rounded-lg opacity-20 grayscale" />
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
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingPlayer(null);
        }}
        onAdd={savePlayer}
        initialPlayer={editingPlayer}
      />
    </div>
  );
};

export default App;

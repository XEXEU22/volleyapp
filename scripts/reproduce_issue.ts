
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Mimic types from types.ts
interface Player {
    // id maps to uuid on server, but in app it's string (often random string locally, ignored by playerToRow)
    name: string;
    position: string;
    rating: number;
    level: string;
    avatarUrl: string;
    isMVP: boolean;
    skills: {
        ataque: number;
        defesa: number;
        recepcao: number;
        levantamento: number;
        saque: number;
        bloqueio: number;
    };
}

// Mimic playerToRow from App.tsx
const playerToRow = (player: Player) => ({
    name: player.name,
    position: player.position,
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

async function testInsert() {
    console.log('Testing insert with App logic...');

    // Construct a player exactly as AddPlayerModal does
    // With generated random ID (which should be ignored by playerToRow)
    const name = "Test Player App Logic";
    const skills = {
        ataque: 3,
        defesa: 3,
        recepcao: 3,
        levantamento: 3,
        saque: 3,
        bloqueio: 3,
    };
    const avgRating = parseFloat(
        (Object.values(skills).reduce((a, b) => a + b, 0) / Object.values(skills).length).toFixed(1)
    );

    const newPlayer: Player = {
        // Mimic the random ID from AddPlayerModal (although playerToRow ignores it)
        // id: Math.random().toString(36).substr(2, 9) <-- In types.ts/App.tsx playerToRow doesn't use id.
        // However, AddPlayerModal creates the object with this ID.
        // The playerToRow function only picks specific props.
        name,
        position: 'Ponteiro',
        level: 'Nível Pro',
        rating: avgRating,
        avatarUrl: `https://picsum.photos/seed/${name}/200`,
        isMVP: avgRating >= 4.8,
        skills,
    };

    const row = playerToRow(newPlayer);
    console.log('Row payload:', row);

    const { data, error } = await supabase
        .from('players')
        .insert(row)
        .select()
        .single();

    if (error) {
        console.error('Insert Error Detail:', JSON.stringify(error, null, 2));
        console.error('Error Message:', error.message);
        console.error('Error Details:', error.details);
        console.error('Error Hint:', error.hint);
    } else {
        console.log('Insert Success:', data);
        // Cleanup
        await supabase.from('players').delete().eq('id', data.id);
        console.log('Cleanup Success');
    }
}

testInsert();

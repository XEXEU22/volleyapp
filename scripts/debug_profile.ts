
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing environment variables");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugProfile() {
    console.log("Checking profiles table...");
    const { data: profileCheck, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

    if (profileError) {
        console.error("Error reading profiles table:", profileError.message);
        if (profileError.message.includes("relation \"public.profiles\" does not exist")) {
            console.log("TIP: You need to run profile_setup.sql in Supabase SQL Editor.");
        }
    } else {
        console.log("Profiles table exists. Found rows:", profileCheck.length);
    }

    console.log("\nChecking avatars bucket...");
    const { data: bucketCheck, error: bucketError } = await supabase.storage.listBuckets();

    if (bucketError) {
        console.error("Error listing buckets:", bucketError.message);
    } else {
        const avatarsBucket = bucketCheck.find(b => b.id === 'avatars');
        if (avatarsBucket) {
            console.log("Avatars bucket exists and is public:", avatarsBucket.public);
        } else {
            console.warn("Avatars bucket DOES NOT EXIST.");
            console.log("TIP: You need to run storage_setup.sql in Supabase SQL Editor.");
        }
    }

    console.log("\nTesting profile upsert...");
    const testProfile = {
        name: 'Debug Test',
        bio: 'Testing save from script',
        position: 'Levantador',
        level: 'Nível Pro'
    };

    const { data: upsertData, error: upsertError } = await supabase
        .from('profiles')
        .upsert(testProfile)
        .select();

    if (upsertError) {
        console.error("Upsert failed:", upsertError.message, upsertError.details, upsertError.hint);
    } else {
        console.log("Upsert successful!");
    }
}

debugProfile();

"use client";

import { useEffect, useState, Suspense } from "react";
import FullSimulation from "@/components/FullSimulation"; 
import { supabase } from "@/utils/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";

function SimulationWrapper() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    
    // 🔥 1. TANGKAP QUERY PARAMETER DARI URL
    // Contoh URL: /simulation?mode=quick
    const searchParams = useSearchParams();
    const modeParam = searchParams.get('mode');
    
    // Validasi: Jika 'quick' maka 'quick', selain itu default 'full'
    const mode = modeParam === 'quick' ? 'quick' : 'full';

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                router.push('/auth'); 
                return;
            }

            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            
            setProfile(data);
            setLoading(false);
        };

        fetchUser();
    }, [router]);

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm animate-pulse">Preparing Exam Room...</p>
        </div>
    );

    // 🔥 2. OPER MODE KE COMPONENT
    return <FullSimulation userProfile={profile} mode={mode} />;
}

export default function SimulationPage() {
    // Suspense wajib digunakan saat menggunakan useSearchParams di client component
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950"></div>}>
            <SimulationWrapper />
        </Suspense>
    );
}
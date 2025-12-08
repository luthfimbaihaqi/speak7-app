"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Copy, Check, RefreshCw, Trash2 } from "lucide-react";

// GANTI DENGAN EMAIL ADMIN ANDA
const ADMIN_EMAIL = "luthfibaihaqi851@gmail.com"; 

export default function AdminPage() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newToken, setNewToken] = useState("");
  const router = useRouter();

  // --- 1. CEK APAKAH INI ADMIN? ---
  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push("/"); // Tendang user nakal ke Home
      } else {
        setIsAdmin(true);
        fetchTokens();
      }
    }
    checkAdmin();
  }, [router]);

  // --- 2. AMBIL LIST TOKEN ---
  const fetchTokens = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .order('created_at', { ascending: false }); // Yang baru diatas
    
    if (error) console.error(error);
    else setTokens(data || []);
    setLoading(false);
  };

  // --- 3. GENERATE TOKEN BARU ---
  const generateToken = async () => {
    // Format: I4-XXXX (4 Huruf Acak)
    const randomCode = "I4-" + Math.random().toString(36).substring(2, 7).toUpperCase();
    
    // Simpan ke DB
    const { data, error } = await supabase
        .from('tokens')
        .insert([{ code: randomCode }])
        .select();

    if (error) {
        alert("Gagal: " + error.message);
    } else {
        fetchTokens(); // Refresh list
    }
  };

  // --- 4. HAPUS TOKEN (Opsional) ---
  const deleteToken = async (id) => {
    if(!confirm("Hapus token ini?")) return;
    await supabase.from('tokens').delete().eq('id', id);
    fetchTokens();
  };

  if (!isAdmin) return null; // Jangan tampilkan apa-apa saat loading auth

  return (
    <main className="min-h-screen bg-slate-950 p-4 pb-20">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 mt-4">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                👮‍♂️ Admin Panel
            </h1>
            <button 
                onClick={() => router.push("/")}
                className="p-2 bg-white/5 rounded-full text-slate-400 hover:text-white"
            >
                <ArrowLeft className="w-5 h-5"/>
            </button>
        </div>

        {/* Action Card */}
        <div className="bg-gradient-to-r from-teal-900/40 to-blue-900/40 border border-teal-500/30 p-6 rounded-2xl mb-8">
            <h2 className="text-lg font-bold text-teal-200 mb-2">Generate Premium Token</h2>
            <p className="text-slate-400 text-sm mb-4">Klik tombol di bawah untuk membuat token unik baru secara instan.</p>
            
            <button 
                onClick={generateToken}
                className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
            >
                <Plus className="w-5 h-5"/> Buat Token Baru
            </button>
        </div>

        {/* Token List */}
        <div className="flex justify-between items-end mb-4">
            <h3 className="text-white font-bold">Token List ({tokens.length})</h3>
            <button onClick={fetchTokens} className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white"><RefreshCw className="w-4 h-4"/></button>
        </div>

        <div className="space-y-3">
            {loading ? (
                <p className="text-slate-500 text-center py-10">Loading data...</p>
            ) : tokens.map((token) => (
                <TokenCard key={token.id} token={token} onDelete={() => deleteToken(token.id)} />
            ))}
        </div>

      </div>
    </main>
  );
}

// Komponen Kecil untuk Card Token
function TokenCard({ token, onDelete }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(token.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`p-4 rounded-xl border flex justify-between items-center ${token.is_used ? 'bg-white/5 border-white/5 opacity-50' : 'bg-slate-900 border-white/10'}`}>
            <div>
                <div className="flex items-center gap-3">
                    <span className={`font-mono text-lg font-bold ${token.is_used ? 'text-slate-500 line-through' : 'text-white'}`}>
                        {token.code}
                    </span>
                    {token.is_used && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded">USED</span>}
                    {!token.is_used && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded">ACTIVE</span>}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                    Created: {new Date(token.created_at).toLocaleDateString()}
                </div>
            </div>

            <div className="flex gap-2">
                {!token.is_used && (
                    <button 
                        onClick={handleCopy}
                        className={`p-2 rounded-lg transition-all ${copied ? 'bg-green-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                        {copied ? <Check className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
                    </button>
                )}
                
                {/* Tombol Hapus (Hanya muncul jika belum dipakai atau untuk bersih-bersih) */}
                <button 
                    onClick={onDelete}
                    className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20"
                >
                    <Trash2 className="w-4 h-4"/>
                </button>
            </div>
        </div>
    )
}
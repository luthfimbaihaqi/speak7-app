"use client";

import Link from "next/link";
import { ArrowLeft, ShieldAlert, Clock, CreditCard, Key } from "lucide-react";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 selection:bg-teal-500/30 selection:text-teal-200">
      
      {/* Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(at_0%_0%,rgba(45,212,191,0.05)_0px,transparent_50%)]"></div>
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="mb-10">
            <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider mb-6">
                <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-4">Terms & Conditions</h1>
            <p className="text-slate-400 leading-relaxed">
                Harap membaca syarat dan ketentuan berikut sebelum melakukan pembelian akses Premium. 
                Dengan melakukan transfer, Anda dianggap telah menyetujui poin-poin di bawah ini.
            </p>
        </div>

        {/* Content Blocks */}
        <div className="space-y-8">
            
            {/* 1. KEBIJAKAN REFUND */}
            <section className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-white">1. Kebijakan Refund (Pengembalian Dana)</h2>
                </div>
                <div className="text-slate-300 text-sm leading-7 space-y-3">
                    <p>
                        IELTS4our menyediakan <strong>Produk Digital</strong> (Software as a Service). Sifat produk ini adalah akses langsung dan tidak dapat dikembalikan secara fisik.
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-slate-400">
                        <li>Semua pembayaran bersifat <strong>FINAL</strong> dan <strong>NON-REFUNDABLE</strong> (Tidak dapat dikembalikan).</li>
                        <li>Kami tidak melayani permintaan refund dengan alasan: berubah pikiran, salah transfer nominal, atau tidak jadi menggunakan layanan.</li>
                        <li>Refund hanya dapat dipertimbangkan jika terjadi kesalahan teknis fatal dari sistem kami yang menyebabkan layanan tidak dapat diakses sama sekali selama lebih dari 7x24 jam.</li>
                    </ul>
                </div>
            </section>

            {/* 2. PROSES VERIFIKASI */}
            <section className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                        <Clock className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-white">2. Proses Verifikasi Pembayaran</h2>
                </div>
                <div className="text-slate-300 text-sm leading-7">
                    <p className="mb-3">
                        Verifikasi pembayaran dilakukan secara <strong>MANUAL</strong> oleh Admin. Mohon perhatikan estimasi waktu berikut:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-slate-400">
                        <li>Verifikasi dilakukan pada jam operasional: <strong>09.00 - 21.00 WIB</strong>.</li>
                        <li>Estimasi waktu pengiriman Token Akses adalah <strong>15 menit - 24 jam</strong> setelah bukti transfer diterima.</li>
                        <li>Mohon tidak melakukan spam chat. Kami memproses permintaan sesuai antrian yang masuk.</li>
                    </ul>
                </div>
            </section>

            {/* 3. TANGGUNG JAWAB TOKEN */}
            <section className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                        <Key className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-white">3. Token Akses</h2>
                </div>
                <div className="text-slate-300 text-sm leading-7">
                    <ul className="list-disc pl-5 space-y-1 text-slate-400">
                        <li>Token yang diberikan bersifat <strong>RAHASIA</strong> dan <strong>SEKALI PAKAI</strong> (One-time use).</li>
                        <li>Satu Token hanya berlaku untuk satu akun.</li>
                        <li><strong>Jaga Token Anda!</strong> Kami tidak bertanggung jawab untuk memberikan token pengganti jika token Anda hilang, terhapus, atau digunakan oleh orang lain karena kelalaian Anda.</li>
                    </ul>
                </div>
            </section>

            {/* 4. KESALAHAN TRANSFER */}
            <section className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                        <CreditCard className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-white">4. Kesalahan Transfer</h2>
                </div>
                <div className="text-slate-300 text-sm leading-7">
                    <p>
                        Jika Anda mentransfer nominal yang tidak sesuai (kurang/lebih) atau ke nomor rekening yang salah, proses verifikasi akan tertunda. Kami berhak meminta bukti tambahan atau menolak aktivasi hingga pembayaran sesuai.
                    </p>
                </div>
            </section>

        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-slate-500 text-xs">
            <p>&copy; {new Date().getFullYear()} IELTS4our. All rights reserved.</p>
        </div>

      </div>
    </main>
  );
}
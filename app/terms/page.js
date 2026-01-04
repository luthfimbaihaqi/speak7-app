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
                Harap membaca syarat dan ketentuan berikut sebelum melakukan <strong>Top Up Token</strong>. 
                Dengan melanjutkan proses pembayaran, Anda dianggap telah memahami dan menyetujui poin-poin di bawah ini.
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
                        IELTS4our menyediakan <strong>Produk Digital</strong> berupa saldo token. Sifat produk ini adalah konsumtif dan tidak dapat dikembalikan secara fisik.
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-slate-400">
                        <li>Semua transaksi Top Up bersifat <strong>FINAL</strong> dan <strong>NON-REFUNDABLE</strong> (Tidak dapat dikembalikan).</li>
                        <li>Kami tidak melayani permintaan refund dengan alasan: salah beli nominal, berubah pikiran, atau jarang menggunakan aplikasi.</li>
                        <li>Refund hanya dapat dipertimbangkan jika terjadi kesalahan teknis fatal dari sistem kami (double charge) yang menyebabkan saldo terpotong dua kali untuk satu transaksi.</li>
                    </ul>
                </div>
            </section>

            {/* 2. PROSES PEMBAYARAN OTOMATIS */}
            <section className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                        <Clock className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-white">2. Pembayaran & Aktivasi Otomatis</h2>
                </div>
                <div className="text-slate-300 text-sm leading-7">
                    <p className="mb-3">
                        Kami menggunakan <em>Payment Gateway</em> otomatis (Midtrans) untuk memproses transaksi Anda secara Real-Time.
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-slate-400">
                        <li>Layanan Top Up tersedia <strong>24 Jam / 7 Hari</strong>.</li>
                        <li>Token akan masuk ke akun Anda secara <strong>INSTAN</strong> (biasanya dalam hitungan detik) setelah pembayaran berhasil dikonfirmasi oleh sistem bank/e-wallet.</li>
                        <li>Anda tidak perlu mengirimkan bukti transfer secara manual, kecuali jika terjadi gangguan teknis pada sistem perbankan.</li>
                    </ul>
                </div>
            </section>

            {/* 3. SISTEM TOKEN */}
            <section className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                        <Key className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-white">3. Aturan Penggunaan Token</h2>
                </div>
                <div className="text-slate-300 text-sm leading-7">
                    <ul className="list-disc pl-5 space-y-1 text-slate-400">
                        <li>Token adalah <strong>Saldo Digital</strong> yang terikat pada akun Anda, bukan kode voucher fisik.</li>
                        <li>Token yang sudah dibeli <strong>TIDAK MEMILIKI MASA KADALUARSA (No Expiry)</strong>. Anda bebas menggunakannya kapan saja, besok, bulan depan, atau tahun depan.</li>
                        <li>Token akan berkurang hanya ketika Anda berhasil menyelesaikan sesi simulasi (Quick Test / Full Test).</li>
                        <li>Token tidak dapat dipindahtangankan ke akun lain atau diuangkan kembali.</li>
                    </ul>
                </div>
            </section>

            {/* 4. KENDALA TEKNIS */}
            <section className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                        <CreditCard className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-white">4. Kendala Teknis</h2>
                </div>
                <div className="text-slate-300 text-sm leading-7">
                    <p>
                        Meskipun sistem kami berjalan otomatis, gangguan jaringan perbankan bisa saja terjadi. Jika saldo Token Anda belum bertambah setelah <strong>15 menit</strong> pembayaran sukses:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
                        <li>Jangan panik, dana Anda aman.</li>
                        <li>Simpan bukti pembayaran Anda.</li>
                        <li>Hubungi tim Support kami melalui email/WhatsApp yang tertera di halaman FAQ. Kami akan melakukan pengecekan dan menginput token Anda secara manual maksimal dalam 1x24 jam.</li>
                    </ul>
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
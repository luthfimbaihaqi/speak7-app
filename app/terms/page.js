"use client";

import Link from "next/link";
import { ArrowLeft, ShieldAlert, Clock, CreditCard, Key } from "lucide-react";

// Abstract shapes — minimal for legal/content page
const AbstractShapes = () => (
  <>
    <svg className="absolute top-[3%] left-[3%] w-12 h-12 md:w-16 md:h-16 opacity-75 -rotate-12" viewBox="0 0 100 100" aria-hidden>
      <path d="M 50 10 Q 80 15 85 45 Q 90 75 60 85 Q 25 90 15 60 Q 10 30 50 10 Z" fill="#D17A5C" />
    </svg>
    <svg className="hidden md:block absolute top-[4%] right-[5%] w-24 h-10 opacity-55 rotate-[15deg]" viewBox="0 0 200 50" aria-hidden>
      <line x1="10" y1="25" x2="190" y2="25" stroke="#4A6B8F" strokeWidth="3" strokeDasharray="8 6" strokeLinecap="round" />
    </svg>
    <svg className="hidden md:block absolute top-[35%] left-[2%] w-14 h-14 opacity-50" viewBox="0 0 100 100" aria-hidden>
      <g stroke="#C9974C" strokeWidth="3" strokeLinecap="round">
        <line x1="20" y1="20" x2="20" y2="32" /><line x1="14" y1="26" x2="26" y2="26" />
        <line x1="60" y1="60" x2="60" y2="72" /><line x1="54" y1="66" x2="66" y2="66" />
      </g>
    </svg>
    <svg className="hidden md:block absolute top-[55%] right-[3%] w-24 h-8 opacity-45 -rotate-6" viewBox="0 0 200 50" aria-hidden>
      <path d="M 5 25 Q 30 5 55 25 T 105 25 T 155 25 T 195 25" fill="none" stroke="#8FA68E" strokeWidth="3" strokeLinecap="round" />
    </svg>
    <svg className="absolute bottom-[8%] right-[5%] w-10 h-10 md:w-12 md:h-12 opacity-60 rotate-[20deg]" viewBox="0 0 100 100" aria-hidden>
      <path d="M 50 15 L 85 80 L 15 80 Z" fill="#C9974C" />
    </svg>
    <svg className="hidden md:block absolute bottom-[12%] left-[4%] w-12 h-12 opacity-50" viewBox="0 0 100 100" aria-hidden>
      <circle cx="50" cy="50" r="40" fill="none" stroke="#4A6B8F" strokeWidth="3" strokeDasharray="8 6" />
    </svg>
  </>
);

export default function TermsPage() {
  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800;900&display=swap');
        body, html { font-family: 'Lexend', system-ui, -apple-system, sans-serif; }
        .font-display { font-family: 'Lexend', system-ui, -apple-system, sans-serif; letter-spacing: -0.02em; }
      `}</style>

      <main className="min-h-screen bg-[#F8F5EE] px-4 py-12 selection:bg-[#D17A5C]/30 selection:text-[#1A1A1A] relative overflow-hidden">
        
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <AbstractShapes />
        </div>

        <div className="max-w-3xl mx-auto relative z-10">
          
          {/* Header */}
          <div className="mb-10">
              <Link href="/" className="inline-flex items-center gap-2 text-[#525252] hover:text-[#1A1A1A] transition-colors text-sm font-bold uppercase tracking-wider mb-6 group">
                  <div className="p-1.5 rounded-full bg-[#1A1A1A]/5 group-hover:bg-[#1A1A1A]/10 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                  </div>
                  Back to Home
              </Link>
              <h1 className="text-3xl md:text-5xl font-black text-[#1A1A1A] mb-4 font-display tracking-tight">Terms & Conditions</h1>
              <p className="text-[#525252] leading-relaxed text-base md:text-lg">
                  Harap membaca syarat dan ketentuan berikut sebelum melakukan <strong className="text-[#1A1A1A]">Top Up Token</strong>. 
                  Dengan melanjutkan proses pembayaran, Anda dianggap telah memahami dan menyetujui poin-poin di bawah ini.
              </p>
          </div>

          {/* Content Blocks */}
          <div className="space-y-6">
              
              {/* 1. KEBIJAKAN REFUND */}
              <section className="bg-[#FAF6EC] border border-[#D17A5C]/20 rounded-2xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-[#D17A5C]/10 rounded-lg text-[#D17A5C]">
                          <ShieldAlert className="w-6 h-6" />
                      </div>
                      <h2 className="text-lg md:text-xl font-black text-[#1A1A1A] font-display">1. Kebijakan Refund (Pengembalian Dana)</h2>
                  </div>
                  <div className="text-[#525252] text-sm leading-7 space-y-3">
                      <p>
                          IELTS4our menyediakan <strong className="text-[#1A1A1A]">Produk Digital</strong> berupa saldo token. Sifat produk ini adalah konsumtif dan tidak dapat dikembalikan secara fisik.
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-[#525252]">
                          <li>Semua transaksi Top Up bersifat <strong className="text-[#1A1A1A]">FINAL</strong> dan <strong className="text-[#1A1A1A]">NON-REFUNDABLE</strong> (Tidak dapat dikembalikan).</li>
                          <li>Kami tidak melayani permintaan refund dengan alasan: salah beli nominal, berubah pikiran, atau jarang menggunakan aplikasi.</li>
                          <li>Refund hanya dapat dipertimbangkan jika terjadi kesalahan teknis fatal dari sistem kami (double charge) yang menyebabkan saldo terpotong dua kali untuk satu transaksi.</li>
                      </ul>
                  </div>
              </section>

              {/* 2. PROSES PEMBAYARAN OTOMATIS */}
              <section className="bg-[#FAF6EC] border border-[#4A6B8F]/20 rounded-2xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-[#4A6B8F]/10 rounded-lg text-[#4A6B8F]">
                          <Clock className="w-6 h-6" />
                      </div>
                      <h2 className="text-lg md:text-xl font-black text-[#1A1A1A] font-display">2. Pembayaran & Aktivasi Otomatis</h2>
                  </div>
                  <div className="text-[#525252] text-sm leading-7">
                      <p className="mb-3">
                          Kami menggunakan <em>Payment Gateway</em> otomatis (Midtrans) untuk memproses transaksi Anda secara Real-Time.
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-[#525252]">
                          <li>Layanan Top Up tersedia <strong className="text-[#1A1A1A]">24 Jam / 7 Hari</strong>.</li>
                          <li>Token akan masuk ke akun Anda secara <strong className="text-[#1A1A1A]">INSTAN</strong> (biasanya dalam hitungan detik) setelah pembayaran berhasil dikonfirmasi oleh sistem bank/e-wallet.</li>
                          <li>Anda tidak perlu mengirimkan bukti transfer secara manual, kecuali jika terjadi gangguan teknis pada sistem perbankan.</li>
                      </ul>
                  </div>
              </section>

              {/* 3. SISTEM TOKEN */}
              <section className="bg-[#FAF6EC] border border-[#C9974C]/20 rounded-2xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-[#C9974C]/10 rounded-lg text-[#C9974C]">
                          <Key className="w-6 h-6" />
                      </div>
                      <h2 className="text-lg md:text-xl font-black text-[#1A1A1A] font-display">3. Aturan Penggunaan Token</h2>
                  </div>
                  <div className="text-[#525252] text-sm leading-7">
                      <ul className="list-disc pl-5 space-y-1 text-[#525252]">
                          <li>Token adalah <strong className="text-[#1A1A1A]">Saldo Digital</strong> yang terikat pada akun Anda, bukan kode voucher fisik.</li>
                          <li>Token yang sudah dibeli <strong className="text-[#1A1A1A]">TIDAK MEMILIKI MASA KADALUARSA (No Expiry)</strong>. Anda bebas menggunakannya kapan saja, besok, bulan depan, atau tahun depan.</li>
                          <li>Token akan berkurang hanya ketika Anda berhasil menyelesaikan sesi simulasi (Quick Test / Full Test).</li>
                          <li>Token tidak dapat dipindahtangankan ke akun lain atau diuangkan kembali.</li>
                      </ul>
                  </div>
              </section>

              {/* 4. KENDALA TEKNIS */}
              <section className="bg-[#FAF6EC] border border-[#8FA68E]/20 rounded-2xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-[#8FA68E]/10 rounded-lg text-[#8FA68E]">
                          <CreditCard className="w-6 h-6" />
                      </div>
                      <h2 className="text-lg md:text-xl font-black text-[#1A1A1A] font-display">4. Kendala Teknis</h2>
                  </div>
                  <div className="text-[#525252] text-sm leading-7">
                      <p>
                          Meskipun sistem kami berjalan otomatis, gangguan jaringan perbankan bisa saja terjadi. Jika saldo Token Anda belum bertambah setelah <strong className="text-[#1A1A1A]">15 menit</strong> pembayaran sukses:
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-[#525252]">
                          <li>Jangan panik, dana Anda aman.</li>
                          <li>Simpan bukti pembayaran Anda.</li>
                          <li>Hubungi tim Support kami melalui email/WhatsApp yang tertera di halaman FAQ. Kami akan melakukan pengecekan dan menginput token Anda secara manual maksimal dalam 1x24 jam.</li>
                      </ul>
                  </div>
              </section>

          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-[#1A1A1A]/10 text-center text-[#525252] text-xs">
              <p>&copy; {new Date().getFullYear()} IELTS4our. All rights reserved.</p>
          </div>

        </div>
      </main>
    </>
  );
}
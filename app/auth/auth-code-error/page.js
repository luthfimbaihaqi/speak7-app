import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-white">
      <div className="bg-white/5 p-8 rounded-2xl border border-white/10 max-w-md text-center">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Link Invalid / Expired</h1>
        <p className="text-slate-400 mb-8">
          Link reset password ini mungkin sudah kadaluarsa, sudah pernah dipakai, atau dibuka di browser yang berbeda.
        </p>
        <Link 
          href="/" 
          className="px-6 py-3 bg-teal-500 text-white rounded-full font-bold hover:bg-teal-400 transition"
        >
          Coba Reset Lagi
        </Link>
      </div>
    </div>
  )
}
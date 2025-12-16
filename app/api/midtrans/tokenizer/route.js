import { NextResponse } from "next/server";
import Midtrans from "midtrans-client";
import { createClient } from "@supabase/supabase-js";

// Init Supabase Admin (Bypassing RLS untuk insert transaksi)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Pastikan variable ini ada di .env.local, kalau belum, pakai Anon key dulu gapapa asal RLS table transactions 'insert' dibolehkan
);

const snap = new Midtrans.Snap({
  isProduction: true, // Ganti true nanti kalau sudah live production
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

export async function POST(request) {
  try {
    const { userId, email, fullName } = await request.json();

    // 1. Buat Order ID Unik
    // Format: ORDER-{UserID}-{Timestamp}
    const orderId = `IELTS-${userId.slice(0, 5)}-${Date.now()}`;
    const grossAmount = 30000; // Harga Fix

    // 2. Parameter untuk Midtrans
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      customer_details: {
        first_name: fullName || "User",
        email: email,
      },
      credit_card: {
        secure: true,
      },
    };

    // 3. Minta Token ke Midtrans
    const transaction = await snap.createTransaction(parameter);
    const token = transaction.token;

    // 4. Simpan Transaksi ke Database Supabase
    const { error } = await supabaseAdmin
      .from("transactions")
      .insert({
        user_id: userId,
        order_id: orderId,
        amount: grossAmount,
        status: "pending",
        snap_token: token,
      });

    if (error) {
        console.error("Supabase Error:", error);
        throw new Error("Gagal menyimpan transaksi ke database.");
    }

    // 5. Kirim Token ke Frontend
    return NextResponse.json({ token });

  } catch (error) {
    console.error("Midtrans Error:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan saat memproses pembayaran." },
      { status: 500 }
    );
  }
}
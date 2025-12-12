import { NextResponse } from "next/server";
import Midtrans from "midtrans-client";
import { createClient } from "@supabase/supabase-js";

// Init Supabase Admin (Wajib Service Role untuk update user lain)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Init Midtrans Core API (Bukan Snap) untuk verifikasi notifikasi
const apiClient = new Midtrans.CoreApi({
  isProduction: false, // Ganti true nanti saat production
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
});

export async function POST(request) {
  try {
    const notificationJson = await request.json();

    // 1. Verifikasi Signature Midtrans (Keamanan)
    // Fungsi ini mengecek apakah data benar-benar dari Midtrans
    const statusResponse = await apiClient.transaction.notification(notificationJson);
    
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    console.log(`🔔 Webhook received: ${orderId} | Status: ${transactionStatus}`);

    // 2. Tentukan Status Transaksi
    let paymentStatus = "pending";
    
    if (transactionStatus == "capture") {
      if (fraudStatus == "challenge") {
        paymentStatus = "challenge"; // Perlu tinjauan manual
      } else if (fraudStatus == "accept") {
        paymentStatus = "success"; // Pembayaran Kartu Kredit Sukses
      }
    } else if (transactionStatus == "settlement") {
      paymentStatus = "success"; // Pembayaran VA/QRIS/E-Wallet Sukses
    } else if (transactionStatus == "cancel" || transactionStatus == "deny" || transactionStatus == "expire") {
      paymentStatus = "failed";
    } else if (transactionStatus == "pending") {
      paymentStatus = "pending";
    }

    // 3. Update Status di Tabel Transactions
    const { error: txError } = await supabaseAdmin
        .from("transactions")
        .update({ status: paymentStatus })
        .eq("order_id", orderId);

    if (txError) throw new Error("Gagal update tabel transaksi");

    // 4. JIKA SUKSES -> Update Status User jadi Premium & Tambah 30 Hari
    if (paymentStatus === "success") {
        // Ambil user_id dari order_id atau query ulang tabel transaksi
        // Kita query tabel transactions untuk dapat user_id
        const { data: txData } = await supabaseAdmin
            .from("transactions")
            .select("user_id")
            .eq("order_id", orderId)
            .single();
        
        if (txData) {
            const userId = txData.user_id;

            // A. Ambil Data Profile User Saat Ini
            const { data: profile } = await supabaseAdmin
                .from("profiles")
                .select("premium_expiry")
                .eq("id", userId)
                .single();

            // B. Hitung Tanggal Expired Baru
            const now = new Date();
            let newExpiryDate = new Date(); // Default hari ini

            // Cek apakah user masih punya masa aktif?
            if (profile?.premium_expiry) {
                const currentExpiry = new Date(profile.premium_expiry);
                if (currentExpiry > now) {
                    // Masih aktif: Tambahkan 30 hari dari tanggal expired lama
                    newExpiryDate = currentExpiry;
                }
            }

            // Tambah 30 Hari (30 * 24 * 60 * 60 * 1000 ms)
            newExpiryDate.setTime(newExpiryDate.getTime() + (30 * 24 * 60 * 60 * 1000));

            // C. Update Profile User
            await supabaseAdmin.from("profiles").update({
                is_premium: true,
                premium_expiry: newExpiryDate.getTime(), // Simpan dalam format timestamp (angka)
            }).eq("id", userId);
            
            console.log(`✅ User ${userId} upgraded until ${newExpiryDate}`);
        }
    }

    return NextResponse.json({ status: "OK" });

  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
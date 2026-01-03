import { NextResponse } from "next/server";
import Midtrans from "midtrans-client";
import { createClient } from "@supabase/supabase-js";

// 1. Init Supabase Admin (Bypass RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 2. Init Midtrans Core API (Production)
const apiClient = new Midtrans.CoreApi({
  isProduction: true, // Pastikan Server Key di Vercel sudah mode Production
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
});

export async function POST(request) {
  try {
    const notificationJson = await request.json();

    // -------------------------------------------------------------------------
    // 🔥 PERBAIKAN UTAMA: BYPASS TEST NOTIFICATION
    // Jika Order ID mengandung kata "test", langsung return OK.
    // -------------------------------------------------------------------------
    if (notificationJson.order_id && notificationJson.order_id.includes("test")) {
        console.warn("⚠️ Menerima Test Notification Midtrans. Mengabaikan proses logic.");
        return NextResponse.json({ status: "OK", message: "Test notification received and ignored." });
    }

    // 3. Verifikasi Signature Midtrans
    const statusResponse = await apiClient.transaction.notification(notificationJson);
    
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    console.log(`🔔 Webhook received: ${orderId} | Status: ${transactionStatus}`);

    // 4. Tentukan Status Transaksi
    let paymentStatus = "pending";
    if (transactionStatus == "capture") {
      if (fraudStatus == "challenge") {
        paymentStatus = "challenge";
      } else if (fraudStatus == "accept") {
        paymentStatus = "success";
      }
    } else if (transactionStatus == "settlement") {
      paymentStatus = "success";
    } else if (transactionStatus == "cancel" || transactionStatus == "deny" || transactionStatus == "expire") {
      paymentStatus = "failed";
    }

    // 5. Cek Database & Ambil Jumlah Token yang Dibeli
    // PENTING: Kita select 'tokens_purchased' dari tabel transactions
    const { data: txData, error: fetchError } = await supabaseAdmin
        .from("transactions")
        .select("user_id, id, tokens_purchased") 
        .eq("order_id", orderId)
        .maybeSingle();

    if (!txData) {
        console.warn(`⚠️ Order ID ${orderId} tidak ditemukan di DB.`);
        return NextResponse.json({ status: "OK", message: "Transaction not found in DB" });
    }

    // 6. Update Status Transaksi di Tabel Transactions
    const { error: txError } = await supabaseAdmin
        .from("transactions")
        .update({ status: paymentStatus })
        .eq("order_id", orderId);

    if (txError) {
        console.error("Gagal update transaksi:", txError);
        return NextResponse.json({ status: "OK", message: "DB Update Failed" }); 
    }

    // 7. PROSES TOP UP TOKEN (Hanya jika status success)
    if (paymentStatus === "success") {
        const userId = txData.user_id;
        // Default ke 0 jika entah kenapa kosong, agar tidak error matematika
        const tokensToAdd = txData.tokens_purchased || 0; 

        console.log(`Processing Top Up: User ${userId} buys ${tokensToAdd} tokens.`);

        // A. Ambil Saldo User Saat Ini
        const { data: profile, error: profileError } = await supabaseAdmin
            .from("profiles")
            .select("token_balance, lifetime_token_purchased")
            .eq("id", userId)
            .single();
        
        if (profileError || !profile) {
            console.error("Gagal ambil profil user:", profileError);
            // Tetap return OK ke Midtrans karena transaksi sudah sukses tercatat,
            // Admin bisa manual fix jika profil tidak ketemu.
            return NextResponse.json({ status: "OK", message: "Profile not found" });
        }

        // B. Hitung Saldo Baru (Handle nilai null dengan || 0)
        const currentBalance = profile.token_balance || 0;
        const currentLifetime = profile.lifetime_token_purchased || 0;

        const newBalance = currentBalance + tokensToAdd;
        const newLifetime = currentLifetime + tokensToAdd;

        // C. Update ke Database Profile
        const { error: updateError } = await supabaseAdmin
            .from("profiles")
            .update({
                token_balance: newBalance,
                lifetime_token_purchased: newLifetime,
                // Kita tidak menyentuh is_premium atau expiry date lagi
            })
            .eq("id", userId);

        if (updateError) {
             console.error("Gagal update saldo token:", updateError);
        } else {
             console.log(`✅ Success! User ${userId} balance updated: ${currentBalance} -> ${newBalance}`);
        }
    }

    return NextResponse.json({ status: "OK" });

  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ status: "OK", error: error.message }); 
  }
}
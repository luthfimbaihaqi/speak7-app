import { NextResponse } from "next/server";
import Midtrans from "midtrans-client";
import { createClient } from "@supabase/supabase-js";

// Init Supabase Admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Init Midtrans Core API (Production)
const apiClient = new Midtrans.CoreApi({
  isProduction: true, // Pastikan ini true
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
});

export async function POST(request) {
  try {
    const notificationJson = await request.json();

    // 1. Verifikasi Signature Midtrans
    const statusResponse = await apiClient.transaction.notification(notificationJson);
    
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    console.log(`🔔 Webhook received: ${orderId} | Status: ${transactionStatus}`);

    // 2. Tentukan Status Transaksi
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

    // 3. Cek apakah Order ID ada di Database? (Pakai maybeSingle biar gak error kalau kosong)
    const { data: txData, error: fetchError } = await supabaseAdmin
        .from("transactions")
        .select("user_id, id")
        .eq("order_id", orderId)
        .maybeSingle(); // <--- INI KUNCI PERBAIKANNYA

    // Jika data tidak ditemukan (misal: Test Notification dari Midtrans), kita stop di sini tapi tetap balas 200 OK
    if (!txData) {
        console.warn(`⚠️ Order ID ${orderId} tidak ditemukan di database. Mengabaikan webhook.`);
        return NextResponse.json({ status: "OK", message: "Order ID not found, ignored." });
    }

    // 4. Update Status di Tabel Transactions
    const { error: txError } = await supabaseAdmin
        .from("transactions")
        .update({ status: paymentStatus })
        .eq("order_id", orderId);

    if (txError) {
        console.error("Gagal update transaksi:", txError);
        // Jangan throw error agar Midtrans tidak kirim email error, cukup log saja
        return NextResponse.json({ status: "OK", message: "Database update failed" });
    }

    // 5. JIKA SUKSES -> Update Status User jadi Premium
    if (paymentStatus === "success") {
        const userId = txData.user_id;

        // Ambil Data Profile User
        const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("premium_expiry")
            .eq("id", userId)
            .single();

        // Hitung Tanggal Expired Baru
        const now = new Date();
        let newExpiryDate = new Date();

        if (profile?.premium_expiry) {
            const currentExpiry = new Date(profile.premium_expiry);
            if (currentExpiry > now) {
                newExpiryDate = currentExpiry;
            }
        }

        // Tambah 30 Hari
        newExpiryDate.setTime(newExpiryDate.getTime() + (30 * 24 * 60 * 60 * 1000));

        // Update Profile
        await supabaseAdmin.from("profiles").update({
            is_premium: true,
            premium_expiry: newExpiryDate.getTime(),
        }).eq("id", userId);
        
        console.log(`✅ User ${userId} upgraded until ${newExpiryDate}`);
    }

    return NextResponse.json({ status: "OK" });

  } catch (error) {
    console.error("Webhook Error:", error);
    // Kita tetap return 500 jika errornya parah (misal Midtrans key salah)
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
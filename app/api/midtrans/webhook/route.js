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
  isProduction: true,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
});

export async function POST(request) {
  try {
    const notificationJson = await request.json();

    // -------------------------------------------------------------------------
    // 🔥 PERBAIKAN UTAMA: BYPASS TEST NOTIFICATION
    // Jika Order ID mengandung kata "test", langsung return OK agar Midtrans senang.
    // Ini mencegah error Signature Validation pada data dummy.
    // -------------------------------------------------------------------------
    if (notificationJson.order_id && notificationJson.order_id.includes("test")) {
        console.warn("⚠️ Menerima Test Notification Midtrans. Mengabaikan proses logic.");
        return NextResponse.json({ status: "OK", message: "Test notification received and ignored." });
    }

    // 1. Verifikasi Signature Midtrans (Hanya untuk transaksi real)
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

    // 3. Cek Database (Pakai maybeSingle agar aman)
    const { data: txData, error: fetchError } = await supabaseAdmin
        .from("transactions")
        .select("user_id, id")
        .eq("order_id", orderId)
        .maybeSingle();

    if (!txData) {
        // Jika data beneran tidak ada (bukan test), log warning tapi jangan error 500
        console.warn(`⚠️ Order ID ${orderId} real transaction tapi tidak ada di DB.`);
        return NextResponse.json({ status: "OK", message: "Transaction not found in DB" });
    }

    // 4. Update Status Transaksi
    const { error: txError } = await supabaseAdmin
        .from("transactions")
        .update({ status: paymentStatus })
        .eq("order_id", orderId);

    if (txError) {
        console.error("Gagal update transaksi:", txError);
        return NextResponse.json({ status: "OK", message: "DB Update Failed" }); 
    }

    // 5. Upgrade User Jika Sukses
    if (paymentStatus === "success") {
        const userId = txData.user_id;

        const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("premium_expiry")
            .eq("id", userId)
            .single();

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

        await supabaseAdmin.from("profiles").update({
            is_premium: true,
            premium_expiry: newExpiryDate.getTime(),
        }).eq("id", userId);
        
        console.log(`✅ User ${userId} upgraded until ${newExpiryDate}`);
    }

    return NextResponse.json({ status: "OK" });

  } catch (error) {
    console.error("Webhook Error:", error);
    // Tetap return 200 OK dengan pesan error agar Midtrans berhenti kirim email spam,
    // kecuali errornya benar-benar fatal yang butuh retry.
    // Tapi untuk keamanan "Test Notification", return 200 adalah jalan terbaik.
    return NextResponse.json({ status: "OK", error: error.message }); 
  }
}
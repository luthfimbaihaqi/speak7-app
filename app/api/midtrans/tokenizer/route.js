import { NextResponse } from "next/server";
import Midtrans from "midtrans-client";
import { createClient } from "@supabase/supabase-js";

// --- CONFIG PACKAGES (SERVER SIDE AUTHORITY) ---
const PACKAGES = {
  'STARTER': { price: 20000, tokens: 10, name: "Starter Pack (10 Tokens)" },
  'POPULAR': { price: 30000, tokens: 25, name: "Popular Pack (25 Tokens)" },
  'PRO':     { price: 50000, tokens: 50, name: "Pro Pack (50 Tokens)" }
};

// Init Supabase Admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY 
);

const snap = new Midtrans.Snap({
  isProduction: true, // Ganti false jika masih sandbox
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

export async function POST(request) {
  try {
    // 1. Terima Package ID, bukan Price
    const { userId, email, fullName, packageId } = await request.json();

    // 2. Validate Package (Security Check)
    const selectedPackage = PACKAGES[packageId];
    if (!selectedPackage) {
        return NextResponse.json({ error: "Invalid Package ID" }, { status: 400 });
    }

    // 3. Buat Order ID Unik
    const orderId = `IELTS-${userId.slice(0, 5)}-${Date.now()}`;
    
    // 4. Parameter Midtrans
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: selectedPackage.price, // Harga diambil dari Server Constant
      },
      customer_details: {
        first_name: fullName || "User",
        email: email,
      },
      item_details: [{
          id: packageId,
          price: selectedPackage.price,
          quantity: 1,
          name: selectedPackage.name
      }],
      credit_card: {
        secure: true,
      },
    };

    // 5. Request Token ke Midtrans
    const transaction = await snap.createTransaction(parameter);
    const token = transaction.token;

    // 6. Simpan Transaksi ke DB (PENTING: Simpan jumlah token yg dibeli)
    const { error } = await supabaseAdmin
      .from("transactions")
      .insert({
        user_id: userId,
        order_id: orderId,
        amount: selectedPackage.price,
        status: "pending",
        snap_token: token,
        // 🔥 Simpan detail paket agar webhook nanti tau harus nambah berapa token
        tokens_purchased: selectedPackage.tokens,
        package_name: selectedPackage.name
      });

    if (error) {
        console.error("Supabase Error:", error);
        throw new Error("Gagal menyimpan transaksi ke database.");
    }

    return NextResponse.json({ token });

  } catch (error) {
    console.error("Midtrans Error:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan saat memproses pembayaran." },
      { status: 500 }
    );
  }
}
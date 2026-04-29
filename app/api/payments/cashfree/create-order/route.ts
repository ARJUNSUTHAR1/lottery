import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, jsonError } from "@/lib/auth";
import { upsertPendingPayment } from "@/lib/payments";
import { ObjectId } from "mongodb";

type CartTicketItem = {
  drawId: string;
  drawName: string;
  drawDate: string;
  drawTime: string;
  pricePerTicket: number;
  ticketNumbers: string[];
};

type CartState = {
  items: CartTicketItem[];
  updatedAt: string;
};

function cashfreeBaseUrl(mode: "sandbox" | "production") {
  return mode === "production" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) return jsonError("Sign in to checkout.", 401);

    const body = (await request.json()) as { cart?: CartState };
    const cart = body.cart;
    if (!cart?.items?.length) return jsonError("Cart is empty.");

    const subtotal = cart.items.reduce((sum, item) => sum + item.ticketNumbers.length * item.pricePerTicket, 0);
    const gst = Math.round(subtotal * 0.18 * 100) / 100;
    const orderAmount = Math.round((subtotal + gst) * 100) / 100;
    if (orderAmount <= 0) return jsonError("Invalid cart total.");

    const mode = (process.env.CASHFREE_MODE === "production" ? "production" : "sandbox") as
      | "sandbox"
      | "production";
    const appId = process.env.CASHFREE_APP_ID;
    const secret = process.env.CASHFREE_SECRET_KEY;
    if (!appId || !secret) return jsonError("Cashfree is not configured on the server.", 500);

    const orderId = `sl_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`.slice(0, 45);
    const returnUrl = `${request.nextUrl.origin}/payment/cashfree?order_id={order_id}`;

    const res = await fetch(`${cashfreeBaseUrl(mode)}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": appId,
        "x-client-secret": secret,
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: orderAmount,
        order_currency: "INR",
        customer_details: {
          customer_id: user.id,
          customer_email: user.email,
          customer_phone: "9999999999",
          customer_name: user.name,
        },
        order_meta: {
          return_url: returnUrl,
        },
      }),
    });

    const data = (await res.json()) as { payment_session_id?: string; order_id?: string; message?: string };
    if (!res.ok || !data.payment_session_id || !data.order_id) {
      return NextResponse.json(
        { error: data.message ?? "Unable to create Cashfree order." },
        { status: 500 },
      );
    }

    await upsertPendingPayment({
      provider: "cashfree",
      orderId: data.order_id,
      orderAmount,
      currency: "INR",
      cart,
      status: "created",
      userId: new ObjectId(user.id),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      payment_session_id: data.payment_session_id,
      order_id: data.order_id,
      mode,
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to create payment order.");
  }
}


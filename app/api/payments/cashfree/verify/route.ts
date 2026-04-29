import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getSessionUser, jsonError } from "@/lib/auth";
import { getPendingPayment, markPaymentProcessed } from "@/lib/payments";
import { bookTicketsByNumbers } from "@/lib/draws";
import { getDb } from "@/lib/mongodb";

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
    if (!user) return jsonError("Sign in to verify payment.", 401);

    const body = (await request.json()) as { orderId?: string };
    const orderId = body.orderId?.trim();
    if (!orderId) return jsonError("orderId is required.");

    const pending = await getPendingPayment("cashfree", orderId);
    if (!pending) return jsonError("Order not found.", 404);
    if (pending.userId.toString() !== user.id) return jsonError("Unauthorized.", 403);
    if (pending.status === "processed") return NextResponse.json({ ok: true });

    const mode = (process.env.CASHFREE_MODE === "production" ? "production" : "sandbox") as
      | "sandbox"
      | "production";
    const appId = process.env.CASHFREE_APP_ID;
    const secret = process.env.CASHFREE_SECRET_KEY;
    if (!appId || !secret) return jsonError("Cashfree is not configured on the server.", 500);

    // Fetch order payments / status from Cashfree
    const res = await fetch(`${cashfreeBaseUrl(mode)}/orders/${encodeURIComponent(orderId)}`, {
      headers: {
        "x-api-version": "2023-08-01",
        "x-client-id": appId,
        "x-client-secret": secret,
      },
      cache: "no-store",
    });
    const order = (await res.json()) as { order_status?: string; message?: string };
    if (!res.ok) return jsonError(order.message ?? "Unable to verify order.", 500);

    if (order.order_status !== "PAID") {
      await markPaymentProcessed("cashfree", orderId, "failed");
      return jsonError("Payment not completed.", 402);
    }

    const cart = pending.cart as CartState;
    if (!cart?.items?.length) return jsonError("Cart snapshot missing for this order.", 500);

    // Book tickets and write history records (one record per ticket number)
    const db = await getDb();
    const userId = new ObjectId(user.id);

    for (const item of cart.items) {
      const booking = await bookTicketsByNumbers(user.id, item.drawId, item.ticketNumbers);
      const bookedNumbers = booking.booked.map((t) => t.number);

      if (bookedNumbers.length) {
        const bookedAt = new Date();
        await db.collection("tickets").insertMany(
          bookedNumbers.map((ticketNumber) => ({
            userId,
            drawName: item.drawName,
            prize: `₹${item.pricePerTicket} + GST`,
            drawTime: `${new Date(item.drawDate).toLocaleDateString("en-IN")} • ${item.drawTime}`,
            ticketNumber,
            status: "draw_pending",
            bookedAt,
          })),
        );
      }
    }

    await markPaymentProcessed("cashfree", orderId, "processed");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to verify payment.");
  }
}


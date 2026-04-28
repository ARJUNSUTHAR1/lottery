import { NextRequest, NextResponse } from "next/server";
import { createTicketBooking, getProfile, getSessionUser, jsonError } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) return jsonError("Not signed in.", 401);

  const profile = await getProfile(user.id);
  if (!profile) return jsonError("User profile not found.", 404);

  return NextResponse.json({ tickets: profile.tickets });
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) return jsonError("Sign in to book tickets.", 401);

    const body = (await request.json()) as {
      drawName?: unknown;
      prize?: unknown;
      drawTime?: unknown;
    };

    if (
      typeof body.drawName !== "string" ||
      typeof body.prize !== "string" ||
      typeof body.drawTime !== "string"
    ) {
      return jsonError("Ticket details are required.");
    }

    const ticket = await createTicketBooking(user.id, {
      drawName: body.drawName,
      prize: body.prize,
      drawTime: body.drawTime,
    });

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to book ticket.");
  }
}

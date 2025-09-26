import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { habitId, date } = await req.json();
    if (!habitId || !date) {
      return NextResponse.json({ error: "habitId & date required" }, { status: 400 });
    }

    const existing = await prisma.record.findFirst({ where: { habitId, date } });

    if (existing) {
      await prisma.record.delete({ where: { id: existing.id } });
      return NextResponse.json({ toggled: false });
    } else {
      await prisma.record.create({ data: { habitId, date } });
      return NextResponse.json({ toggled: true });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to toggle record." }, { status: 500 });
  }
}

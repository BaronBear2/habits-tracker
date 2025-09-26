import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const habits = await prisma.habit.findMany({
      include: { records: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(habits);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch habits." }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }
    const habit = await prisma.habit.create({ data: { name } });
    return NextResponse.json(habit);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create habit." }, { status: 500 });
  }
}
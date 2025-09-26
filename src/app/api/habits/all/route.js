import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function DELETE(req) {
  try {
    // 1. Delete all related records first
    await prisma.record.deleteMany({});
    // 2. Now delete all habits
    await prisma.habit.deleteMany({});
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete all habits:", error);
    return NextResponse.json({ error: "Failed to delete all habits." }, { status: 500 });
  }
}
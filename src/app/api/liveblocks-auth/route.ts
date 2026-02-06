import { NextResponse } from "next/server";

const COLORS = ["#0d9488", "#f59e0b", "#f97316", "#6366f1", "#ec4899", "#14b8a6", "#8b5cf6"];
const NAMES = ["Teacher A", "Teacher B", "Teacher C", "Teacher D", "Teacher E"];

export async function POST() {
  const name = NAMES[Math.floor(Math.random() * NAMES.length)];
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  return NextResponse.json({ name, color });
}
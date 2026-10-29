import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({ include: { studentProfile: true, teacherProfile: true } });
    const classrooms = await prisma.classroom.findMany();
    const students = await prisma.studentProfile.findMany({ include: { classroom: true } });
    const results = await prisma.riasecResult.findMany();
    
    return NextResponse.json({
      users,
      classrooms,
      students,
      results
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

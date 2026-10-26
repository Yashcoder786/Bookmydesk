import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, role = "CUSTOMER" } = body;

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { success: false, error: "Valid email address is required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const displayName =
      (typeof name === "string" && name.trim()) ||
      cleanEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    const targetRole = role === "ADMIN" ? "ADMIN" : "CUSTOMER";

    // Find existing user or create a new user account in database
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
      },
    });

    if (!user) {
      // Deterministic prefix based on clean email
      const safeId = "usr_" + cleanEmail.replace(/[^a-z0-9]/g, "_").slice(0, 20) + "_" + Math.floor(1000 + Math.random() * 9000);
      user = await prisma.user.create({
        data: {
          id: safeId,
          email: cleanEmail,
          name: displayName,
          role: targetRole,
          phone: "+91 98765 43210",
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
        },
      });
    } else if (user.role !== targetRole) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: targetRole },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isLoggedIn: true,
      },
    });
  } catch (error: any) {
    console.error("Auth login error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to authenticate" },
      { status: 500 }
    );
  }
}

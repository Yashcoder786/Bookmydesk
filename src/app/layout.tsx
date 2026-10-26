import type { Metadata } from "next";
import "./globals.css";
import { HeaderNav } from "@/components/HeaderNav";

export const metadata: Metadata = {
  title: "BookMyDesk — Workspace Desk & Cabin Booking",
  description: "Reserve flexible hot desks, dedicated seats and private cabins with instant confirmation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <HeaderNav />
        <main>{children}</main>
      </body>
    </html>
  );
}

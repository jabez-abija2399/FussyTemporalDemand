import type { Metadata } from "next";
import Link from "next/link";
import { getUser } from "@/lib/supabase/server";
import { signOut } from "./sign-in/actions";
import "./globals.css";

export const metadata: Metadata = {
  title: "Salon Booking",
  description: "Book your next haircut in a minute.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();

  return (
    <html lang="en">
      <body>
        <header>
          <Link href="/" className="brand">Salon Booking</Link>
          <nav style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {user ? (
              <>
                <Link href="/bookings">My bookings</Link>
                <form action={signOut}>
                  <button type="submit">Sign out</button>
                </form>
              </>
            ) : (
              <Link href="/sign-in">Sign in</Link>
            )}
          </nav>
        </header>
        <main>{children}</main>
        <footer>
          <span>© {new Date().getFullYear()} Salon Booking</span>
        </footer>
      </body>
    </html>
  );
}

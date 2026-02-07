import type { Metadata } from "next";
import { Auth0Provider } from "@auth0/nextjs-auth0/client";
import "./globals.css";

export const metadata: Metadata = {
  title: "TCLC PBL Tools",
  description:
    "Project-Based Learning Design Tools by Third Coast Learning Collaborative",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Auth0Provider>{children}</Auth0Provider>
      </body>
    </html>
  );
}

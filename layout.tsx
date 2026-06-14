import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OpsPilot AI — The operating system for modern businesses",
  description: "AI-powered business operations platform for SMBs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#0A0B0F" }}>
        {children}
      </body>
    </html>
  );
}

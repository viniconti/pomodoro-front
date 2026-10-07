import type { Metadata } from "next";
import { Allerta, Anuphan } from "next/font/google";
import "./globals.css";

const allerta = Allerta({
  variable: "--font-allerta",
  subsets: ["latin"],
  weight: "400",
});

const anuphan = Anuphan({
  variable: "--font-anuphan",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pomodoro Timer",
  description: "Um site de pomodoro aí",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-br"
      className={`${allerta.variable} ${anuphan.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
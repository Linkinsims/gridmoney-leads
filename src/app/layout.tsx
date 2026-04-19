import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "GridMoney Leads — Get Paid to Find Customers for SA Businesses",
    template: "%s | GridMoney Leads",
  },
  description:
    "South Africa's #1 lead generation marketplace. Businesses post campaigns. Hustlers find customers. Everyone wins. Join free today.",
  keywords: [
    "lead generation south africa",
    "earn money south africa",
    "sa leads marketplace",
    "business leads",
    "make money online south africa",
  ],
  openGraph: {
    title: "GridMoney Leads",
    description: "Get paid to find customers for SA businesses",
    type: "website",
    locale: "en_ZA",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-white antialiased">
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "#141414",
              border: "1px solid #242424",
              color: "#fff",
            },
            classNames: {
              success: "border-success/30",
              error: "border-error/30",
            },
          }}
        />
      </body>
    </html>
  );
}

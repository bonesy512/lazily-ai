// app/(marketing)/layout.tsx

import Header from "@/components/layout/Header";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col min-h-screen">
      <Header />
      <main>{children}</main>
    </section>
  );
}
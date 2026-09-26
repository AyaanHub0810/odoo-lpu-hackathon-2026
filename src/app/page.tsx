'use client';

export default function Home() {
  return (
    <main className="fixed inset-0 w-full h-full border-0 overflow-hidden bg-black z-50">
      <iframe
        src="/landing/index.html"
        title="StockSense WMS - Real-Time Inventory & Warehouse Management System"
        className="w-full h-full border-0 block"
      />
    </main>
  );
}

"use client";
export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex h-11 items-center rounded-[4px] bg-amber px-5 text-[15px] font-bold text-white transition hover:bg-amber-dark"
    >
      {label}
    </button>
  );
}

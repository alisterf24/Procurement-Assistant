const steps = ["Requirement", "Supplier Matching", "RFQ Draft", "Send Confirmation"];

export function Stepper({ current }: { current: number }) {
  return (
    <nav aria-label="Progress" className="rounded-lg border border-white/70 bg-white/[0.42] p-1.5 shadow-[0_14px_40px_rgba(36,39,44,0.06)] backdrop-blur-xl">
      <ol className="grid grid-cols-2 items-center gap-2 md:flex">
        {steps.map((step, index) => (
          <li className="flex items-center gap-2 md:flex-1" key={step}>
            <div
              className={`flex min-h-10 w-full items-center justify-center rounded-md border px-2.5 py-2 text-center text-xs font-bold leading-tight shadow-sm backdrop-blur transition duration-300 sm:px-3 ${
                index <= current
                  ? "border-mahindra-red bg-mahindra-red text-white shadow-[0_14px_32px_rgba(215,25,32,0.2)]"
                  : "border-white/80 bg-white/[0.86] text-zinc-500"
              }`}
            >
              <span className={`mr-2 flex size-5 items-center justify-center rounded ${index <= current ? "bg-white/22" : "bg-zinc-100 text-zinc-500"}`}>
                {index + 1}
              </span>
              {step}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}

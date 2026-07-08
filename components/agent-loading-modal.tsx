import { Loader2 } from "lucide-react";

type AgentLoadingModalProps = {
  open: boolean;
  title: string;
  detail: string;
};

export function AgentLoadingModal({ open, title, detail }: AgentLoadingModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-mahindra-ink/50 px-5 backdrop-blur-md">
      <div className="relative w-full max-w-md overflow-hidden rounded-lg border border-white/80 bg-white/[0.93] p-6 text-center shadow-[0_28px_90px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-mahindra-red via-red-300 to-mahindra-red" />
        <div className="mx-auto flex size-14 items-center justify-center rounded-md bg-red-50 text-mahindra-red shadow-inner ring-8 ring-red-50/45">
          <Loader2 className="animate-spin" size={28} />
        </div>
        <h2 className="mt-5 text-xl font-bold text-mahindra-ink">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">{detail}</p>
        <div className="mt-6 flex items-center justify-center gap-2 rounded-md border border-red-100 bg-red-50/70 px-3 py-2 text-sm font-semibold text-mahindra-red">
          <Loader2 className="animate-spin" size={18} />
          Review in progress
        </div>
      </div>
    </div>
  );
}

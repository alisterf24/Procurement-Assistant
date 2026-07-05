type BrandedBackgroundProps = {
  children: React.ReactNode;
  variant?: "hero" | "workspace";
};

export function BrandedBackground({
  children,
  variant = "workspace"
}: BrandedBackgroundProps) {
  return (
    <div className={`branded-background branded-background--${variant}`}>
      <div className="brand-bg-layer brand-bg-grid" aria-hidden="true" />
      <div className="brand-bg-layer brand-bg-diagonals" aria-hidden="true" />
      <div className="brand-bg-layer brand-bg-accents" aria-hidden="true" />
      <div className="brand-bg-layer brand-bg-ribbons" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="brand-bg-layer brand-bg-glass-panels" aria-hidden="true">
        <span />
        <span />
      </div>
      <svg
        className="brand-bg-layer brand-bg-motifs"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="motifRed" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#d71920" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#9f1017" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="motifInk" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#24272c" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#24272c" stopOpacity="0.03" />
          </linearGradient>
        </defs>

        <g className="motif motif-network">
          <path d="M912 206 C1008 154 1118 176 1190 252 C1260 326 1286 428 1374 470" />
          <path d="M1024 264 L1132 342 L1268 322" />
          <circle cx="912" cy="206" r="8" />
          <circle cx="1024" cy="264" r="6" />
          <circle cx="1132" cy="342" r="8" />
          <circle cx="1268" cy="322" r="6" />
          <circle cx="1374" cy="470" r="8" />
        </g>

        <g className="motif motif-laptop">
          <rect x="104" y="594" width="188" height="118" rx="12" />
          <path d="M78 730 H318 L290 758 H106 Z" />
          <path d="M132 624 H264" />
          <path d="M132 652 H224" />
        </g>

        <g className="motif motif-document">
          <path d="M1138 582 H1268 L1310 624 V780 H1138 Z" />
          <path d="M1268 582 V624 H1310" />
          <path d="M1170 652 H1276" />
          <path d="M1170 686 H1260" />
          <path d="M1170 720 H1284" />
        </g>

        <g className="motif motif-flow">
          <path d="M438 184 H576 C622 184 640 220 680 220 H814" />
          <path d="M794 203 L818 220 L794 237" />
          <path d="M420 244 H560 C612 244 626 286 674 286 H760" />
          <path d="M740 269 L764 286 L740 303" />
        </g>
      </svg>
      <div className="relative z-10 min-h-screen">{children}</div>
    </div>
  );
}

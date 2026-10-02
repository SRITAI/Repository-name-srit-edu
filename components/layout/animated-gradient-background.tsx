export function AnimatedGradientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* 1. Luminous Cyan & Sky Blue - Top Right / Hero Region */}
      <div
        className="animate-blob-1 absolute -top-20 right-[2%] h-[500px] w-[540px] rounded-full opacity-70 blur-[110px] md:-top-28 md:right-[8%] md:h-[660px] md:w-[720px] md:blur-[130px] will-change-transform"
        style={{
          background:
            'radial-gradient(circle, rgba(6, 182, 212, 0.65) 0%, rgba(56, 189, 248, 0.45) 45%, rgba(56, 189, 248, 0) 70%)',
        }}
      />

      {/* 2. Luminous Purple & Magenta Pink - Top Left / Hero Region */}
      <div
        className="animate-blob-2 absolute top-2 left-[-2%] h-[480px] w-[520px] rounded-full opacity-65 blur-[105px] md:top-6 md:left-[6%] md:h-[620px] md:w-[680px] md:blur-[125px] will-change-transform"
        style={{
          background:
            'radial-gradient(circle, rgba(168, 85, 247, 0.65) 0%, rgba(236, 72, 153, 0.42) 50%, rgba(236, 72, 153, 0) 70%)',
        }}
      />

      {/* 3. Soft Warm Sunset Orange & Coral Glow - Hero Lower-Right */}
      <div
        className="animate-blob-3 absolute top-[20%] right-[4%] h-[460px] w-[500px] rounded-full opacity-60 blur-[110px] md:top-[26%] md:right-[14%] md:h-[580px] md:w-[640px] md:blur-[125px] will-change-transform"
        style={{
          background:
            'radial-gradient(circle, rgba(251, 146, 60, 0.58) 0%, rgba(244, 63, 94, 0.38) 48%, rgba(251, 146, 60, 0) 70%)',
        }}
      />

      {/* 4. Deep Indigo & Royal Blue - Hero Mid-Left */}
      <div
        className="animate-blob-4 absolute top-[36%] left-[2%] h-[460px] w-[500px] rounded-full opacity-55 blur-[110px] md:top-[40%] md:left-[10%] md:h-[600px] md:w-[660px] md:blur-[130px] will-change-transform"
        style={{
          background:
            'radial-gradient(circle, rgba(59, 130, 246, 0.55) 0%, rgba(99, 102, 241, 0.35) 50%, rgba(59, 130, 246, 0) 70%)',
        }}
      />

      {/* 5. Ambient Rose Pink & Cyan Accent - Center Lower Content Area */}
      <div
        className="animate-blob-5 absolute top-[60%] left-[20%] h-[440px] w-[480px] rounded-full opacity-50 blur-[115px] md:top-[65%] md:left-[30%] md:h-[560px] md:w-[620px] md:blur-[135px] will-change-transform"
        style={{
          background:
            'radial-gradient(circle, rgba(244, 114, 182, 0.5) 0%, rgba(167, 139, 250, 0.3) 50%, rgba(244, 114, 182, 0) 70%)',
        }}
      />

      {/* Ultra-subtle overlay grid pattern for fintech/modern aesthetic */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `radial-gradient(#182a3f 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />
    </div>
  )
}

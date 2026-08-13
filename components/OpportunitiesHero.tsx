export default function OpportunitiesHero() {
  return (
    <section className="relative overflow-hidden bg-white border-b border-gray-100">
      {/* Soft glow */}
      <div
        aria-hidden
        className="absolute -top-20 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(59,79,232,0.05) 0%, transparent 65%)" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/25 bg-white text-primary text-xs font-semibold shadow-sm mb-6">
            <span>✦</span>
            Всі можливості в одному місці
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-[1.05] mb-4">
            Можливості
          </h1>
          <p className="text-gray-500 text-lg">
            Гранти, стипендії, стажування, обміни та більше — для молоді України.
          </p>
        </div>
      </div>
    </section>
  );
}

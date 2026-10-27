import PartnerLogo from "@/components/PartnerLogo";
import { getPartners, PARTNERS_STATIC_MAX, type Partner } from "@/lib/partners";

function StaticRow({ partners, className = "flex" }: { partners: Partner[]; className?: string }) {
  return (
    <div className={`${className} flex-wrap justify-center gap-x-8 md:gap-x-10 gap-y-6`}>
      {partners.map((p) => <PartnerLogo key={p.slug} partner={p} />)}
    </div>
  );
}

/**
 * Homepage partner strip. Few partners → static centered row. More than
 * PARTNERS_STATIC_MAX → slow looping marquee, with a static wrapped grid for
 * prefers-reduced-motion. The count rule runs once on the server, so server
 * and client render the same mode.
 */
export function PartnersView({ partners }: { partners: Partner[] }) {
  if (partners.length === 0) return null;
  const marquee = partners.length > PARTNERS_STATIC_MAX;

  return (
    <section className="bg-white overflow-x-clip border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Партнери</h2>
          <p className="text-gray-500 text-base mt-2">Організації, що публікують можливості разом з нами</p>
        </div>

        {!marquee ? (
          <StaticRow partners={partners} />
        ) : (
          <>
            <div className="overflow-hidden motion-reduce:hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
              {/* Two identical copies, each with trailing padding equal to the
                  gap, so translateX(-50%) lands exactly on the second copy. */}
              <div
                className="flex w-max animate-marquee-slow hover:[animation-play-state:paused]"
                style={{ animationDuration: `${Math.max(45, partners.length * 6)}s` }}
              >
                {[0, 1].map((copy) => (
                  <div
                    key={copy}
                    aria-hidden={copy === 1 ? true : undefined}
                    className="flex flex-none items-center gap-8 md:gap-10 pr-8 md:pr-10"
                  >
                    {partners.map((p) => <PartnerLogo key={p.slug} partner={p} duplicate={copy === 1} />)}
                  </div>
                ))}
              </div>
            </div>
            <StaticRow partners={partners} className="hidden motion-reduce:flex" />
          </>
        )}
      </div>
    </section>
  );
}

export default async function PartnersSection() {
  const partners = await getPartners();
  return <PartnersView partners={partners} />;
}

"use client";

// To add more photos: add files to /public/about/slides/ and add entry to the slides array below
import Image from "next/image";
import { useEffect, useState } from "react";

const slides = [
  { src: "/about/slides/slide1.jpg", caption: "🌷 Нідерланди · молодіжний обмін" },
  { src: "/about/slides/slide2.jpg", caption: "🏆 Іспанія · міжнародний конкурс" },
  { src: "/about/slides/slide3.jpg", caption: "🌆 Амстердам · обмін" },
  { src: "/about/slides/slide4.jpg", caption: "🎉 Міжнародна зустріч" },
  { src: "/about/slides/slide5.jpg", caption: "🏢 Amazon · робочий візит" },
  { src: "/about/slides/slide6.jpg", caption: "🌅 Іспанія · Erasmus+ проєкт" },
  { src: "/about/slides/slide7.jpg", caption: "🏛️ Рим · культурний обмін" },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
        setVisible(true);
      }, 600);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-2xl max-h-[480px] aspect-[3/4] w-full">
      {/* Photo */}
      <div
        className="absolute inset-0 transition-opacity duration-[600ms]"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <Image
          src={slides[current].src}
          alt={slides[current].caption}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 0px, 50vw"
          priority={current === 0}
        />
      </div>

      {/* Caption overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm px-4 py-2.5">
        <p className="text-white text-sm font-medium">{slides[current].caption}</p>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-1.5">
        {slides.map((_, i) => (
          <span
            key={i}
            className="block w-1.5 h-1.5 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i === current ? "#ffffff" : "rgba(255,255,255,0.4)",
              transform: i === current ? "scale(1.3)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

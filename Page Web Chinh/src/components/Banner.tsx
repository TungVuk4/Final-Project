import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const Banner = () => {
  const [loaded, setLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { width, height, left, top } = currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((clientX - left) / width - 0.5) * 15,
      y: ((clientY - top) / height - 0.5) * 10,
    });
  };

  return (
    <div
      className="banner w-full flex flex-col justify-end items-center pb-16 px-4 relative cursor-default"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
    >
      {/* Parallax overlay layer */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`,
          transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />

      {/* Floating decorative dots */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full anim-float" />
      <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-amber-300/30 rounded-full anim-float delay-200" />
      <div className="absolute bottom-1/3 left-1/5 w-1.5 h-1.5 bg-white/20 rounded-full anim-float delay-400" />

      {/* Content */}
      <div className="flex flex-col items-center gap-4 max-w-4xl text-center relative z-10">
        {/* Eyebrow */}
        <div
          className={`flex items-center gap-3 transition-all duration-700 ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
          style={{ transitionDelay: "0.1s" }}
        >
          <div className="h-px w-12 bg-white/60" />
          <span className="text-white/80 text-xs tracking-[0.35em] uppercase font-medium">
            2026 Collection
          </span>
          <div className="h-px w-12 bg-white/60" />
        </div>

        {/* Main heading */}
        <h1
          className={`text-white font-bold tracking-tight leading-tight transition-all duration-800 ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          } text-5xl sm:text-6xl md:text-7xl lg:text-8xl`}
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 700,
            textShadow: "0 4px 30px rgba(0,0,0,0.4)",
            transitionDelay: "0.25s",
            transform: `perspective(1000px) rotateX(${mousePos.y * 0.3}deg) rotateY(${mousePos.x * -0.2}deg) ${
              loaded ? "translateY(0)" : "translateY(2rem)"
            }`,
            transition: "transform 0.8s cubic-bezier(0.4,0,0.2,1), opacity 0.7s ease",
          }}
        >
          Discover the Best<br />
          <span style={{ color: "#f5c887" }}>Fashion</span> Collection
        </h1>

        {/* Subtitle */}
        <p
          className={`text-white/75 text-base sm:text-lg md:text-xl tracking-widest font-light transition-all duration-700 ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
          style={{ transitionDelay: "0.4s" }}
        >
          The High-Quality Collection · Premium Luxury Fashion
        </p>

        {/* CTA Buttons */}
        <div
          className={`flex flex-col sm:flex-row justify-center items-center gap-3 mt-4 w-full max-w-sm sm:max-w-lg transition-all duration-700 ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
          style={{ transitionDelay: "0.5s" }}
        >
          <Link
            to="/shop"
            className="btn-primary w-full sm:w-auto sm:min-w-[180px] bg-white text-stone-900 font-semibold
                       tracking-[0.1em] uppercase text-sm h-12 flex items-center justify-center px-8
                       rounded-none transition-all duration-300 hover:bg-amber-50 hover:text-amber-900"
          >
            Shop Now
          </Link>
          <Link
            to="/shop"
            className="btn-primary w-full sm:w-auto sm:min-w-[180px] border-2 border-white/70 text-white font-semibold
                       tracking-[0.1em] uppercase text-sm h-12 flex items-center justify-center px-8
                       rounded-none backdrop-blur-sm transition-all duration-300 hover:bg-white/10"
          >
            See Collection
          </Link>
        </div>

        {/* Scroll indicator */}
        <div
          className={`mt-10 flex flex-col items-center gap-2 transition-all duration-700 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          style={{ transitionDelay: "0.8s" }}
        >
          <span className="text-white/50 text-xs tracking-[0.2em] uppercase">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-white/50 to-transparent" />
        </div>
      </div>
    </div>
  );
};

export default Banner;

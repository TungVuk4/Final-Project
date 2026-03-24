import SocialMediaFooter from "./SocialMediaFooter";
import { Link } from "react-router-dom";
import { HiArrowUpRight } from "react-icons/hi2";

const footerLinks = {
  "Client Service": ["After-sale Service", "Free Insurance", "Returns & Exchanges", "FAQ"],
  "Our Brand": ["The Company", "The Excellence", "International Awards", "Our Story"],
  "Collections": ["Luxury Edition", "Special Edition", "Summer Edition", "Unique Collection"],
};

const Footer = () => {
  return (
    <>
      <SocialMediaFooter />
      
      <footer className="bg-stone-900 text-stone-300">
        {/* Main Footer */}
        <div className="max-w-screen-2xl mx-auto px-5 max-[400px]:px-3 pt-16 pb-10">
          {/* Top row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12 border-b border-stone-800 pb-12">
            {/* Brand column */}
            <div className="flex flex-col gap-4">
              <h2
                className="text-4xl font-light text-white tracking-[0.2em]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                FASHION
              </h2>
              <p className="text-sm text-stone-400 leading-relaxed">
                Premium luxury fashion for the modern connoisseur. Crafted with precision, designed for excellence.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors group"
              >
                Explore Collection
                <HiArrowUpRight className="text-lg transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>

            {/* Links */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title} className="flex flex-col gap-3">
                <h3 className="text-white text-sm font-semibold tracking-widest uppercase mb-1">{title}</h3>
                {links.map((link) => (
                  <span
                    key={link}
                    className="text-stone-400 hover:text-amber-400 text-sm transition-colors cursor-pointer"
                  >
                    {link}
                  </span>
                ))}
              </div>
            ))}
          </div>

          {/* Bottom row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-stone-500 text-sm">© 2026 Fashion Studio. All rights reserved.</p>
            <div className="flex items-center gap-6">
              {["Cookie Policy", "Privacy Policy", "Legal Notes"].map((item) => (
                <span key={item} className="text-stone-500 hover:text-stone-300 text-xs transition-colors cursor-pointer tracking-wide">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;

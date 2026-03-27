import SocialMediaFooter from "./SocialMediaFooter";
import { Link } from "react-router-dom";
import { HiArrowUpRight } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

const getFooterLinks = (t: any) => ({
  [t("footer.client_service", "Client Service")]: [t("footer.after_sale"), t("footer.free_insurance"), t("footer.returns"), t("footer.faq")],
  [t("footer.our_brand", "Our Brand")]: [t("footer.the_company"), t("footer.the_excellence"), t("footer.international_awards"), t("footer.our_story")],
  [t("footer.collections", "Collections")]: [t("footer.luxury_edition"), t("footer.special_edition"), t("footer.summer_edition"), t("footer.unique_collection")],
});

const Footer = () => {
  const { t } = useTranslation();
  const footerLinks = getFooterLinks(t);

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
        {t("footer.desc", "Premium luxury fashion for the modern connoisseur. Crafted with precision, designed for excellence.")}
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors group"
              >
                {t("footer.explore", "Explore Collection")}
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
            <p className="text-stone-500 text-sm">{t("footer.rights", "© 2026 Fashion Studio. All rights reserved.")}</p>
            <div className="flex items-center gap-6">
              {[t("footer.cookie", "Cookie Policy"), t("footer.privacy", "Privacy Policy"), t("footer.legal", "Legal Notes")].map((item) => (
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

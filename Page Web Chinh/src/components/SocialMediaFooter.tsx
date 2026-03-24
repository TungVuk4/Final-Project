import { FaFacebookF, FaInstagram, FaTiktok, FaLinkedinIn, FaPinterestP, FaYoutube } from "react-icons/fa6";

const socialLinks = [
  { icon: FaFacebookF, label: "Facebook", href: "#" },
  { icon: FaInstagram, label: "Instagram", href: "#" },
  { icon: FaTiktok, label: "TikTok", href: "#" },
  { icon: FaLinkedinIn, label: "LinkedIn", href: "#" },
  { icon: FaPinterestP, label: "Pinterest", href: "#" },
  { icon: FaYoutube, label: "YouTube", href: "#" },
];

const SocialMediaFooter = () => {
  return (
    <div className="bg-stone-800 py-8">
      <div className="max-w-screen-2xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-stone-400 text-sm tracking-widest uppercase font-light">
          Follow us on
        </p>
        <div className="flex items-center gap-3">
          {socialLinks.map(({ icon: Icon, label, href }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              className="w-10 h-10 bg-stone-700 hover:bg-amber-700 rounded-full flex items-center justify-center
                         text-stone-300 hover:text-white transition-all duration-300 hover:scale-110 hover:-translate-y-0.5"
            >
              <Icon className="text-sm" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SocialMediaFooter;
import CategoryItem from "./CategoryItem";
import { useTranslation } from "react-i18next";

const getCategoryData = (t: any) => [
  { categoryTitle: t("home.special_edition", "Special Edition"), image: "luxury category 1.png", link: "special-edition" },
  { categoryTitle: t("home.luxury_collection", "Luxury Collection"), image: "luxury category 2.png", link: "luxury-collection" },
  { categoryTitle: t("home.summer_edition", "Summer Edition"), image: "luxury category 3.png", link: "summer-edition" },
  { categoryTitle: t("home.unique_collection", "Unique Collection"), image: "luxury category 4.png", link: "unique-collection" },
];

const CategoriesSection = () => {
  const { t } = useTranslation();
  const categoryData = getCategoryData(t);

  return (
    <section className="max-w-screen-2xl px-5 max-[400px]:px-3 mx-auto py-16 max-sm:py-10">
      {/* Section Header */}
      <div className="mb-10">
        <p className="text-xs font-semibold text-amber-700 tracking-[0.3em] uppercase mb-2">
          {t("home.browse_style", "Browse By Style")}
        </p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <h2
            className="text-stone-800 text-4xl sm:text-5xl font-light tracking-wide"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {t("home.our_categories", "Our Categories")}
          </h2>
          <p className="text-stone-400 text-sm max-w-xs leading-relaxed">
            {t("home.explore_categories", "Explore our curated collections, each crafted for a unique style journey.")}
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {categoryData.map((cat, idx) => (
          <div
            key={cat.link}
            className="anim-scaleIn"
            style={{ animationDelay: `${idx * 0.1}s`, animationFillMode: "both" }}
          >
            <CategoryItem {...cat} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoriesSection;

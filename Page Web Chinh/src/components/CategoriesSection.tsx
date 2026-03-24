import CategoryItem from "./CategoryItem";

const categoryData = [
  { categoryTitle: "Special Edition", image: "luxury category 1.png", link: "special-edition" },
  { categoryTitle: "Luxury Collection", image: "luxury category 2.png", link: "luxury-collection" },
  { categoryTitle: "Summer Edition", image: "luxury category 3.png", link: "summer-edition" },
  { categoryTitle: "Unique Collection", image: "luxury category 4.png", link: "unique-collection" },
];

const CategoriesSection = () => {
  return (
    <section className="max-w-screen-2xl px-5 max-[400px]:px-3 mx-auto py-16 max-sm:py-10">
      {/* Section Header */}
      <div className="mb-10">
        <p className="text-xs font-semibold text-amber-700 tracking-[0.3em] uppercase mb-2">
          Browse By Style
        </p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <h2
            className="text-stone-800 text-4xl sm:text-5xl font-light tracking-wide"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Our Categories
          </h2>
          <p className="text-stone-400 text-sm max-w-xs leading-relaxed">
            Explore our curated collections, each crafted for a unique style journey.
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

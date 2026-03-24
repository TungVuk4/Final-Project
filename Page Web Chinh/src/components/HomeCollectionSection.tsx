import ProductGrid from "./ProductGrid";
import ProductGridWrapper from "./ProductGridWrapper";
import { Link } from "react-router-dom";
import { HiArrowRight } from "react-icons/hi2";

const HomeCollectionSection = () => {
  return (
    <section className="py-16 max-sm:py-10">
      {/* Section Header */}
      <div className="max-w-screen-2xl mx-auto px-5 max-[400px]:px-3 mb-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-amber-700 tracking-[0.3em] uppercase mb-2">Curated for You</p>
            <h2
              className="text-stone-800 text-4xl sm:text-5xl font-light tracking-wide"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Our Collection
            </h2>
            <div className="section-divider mt-3" />
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-stone-700 hover:text-amber-800 font-medium text-sm tracking-wide transition-all group whitespace-nowrap"
          >
            View All Products
            <HiArrowRight className="text-lg group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <ProductGridWrapper limit={6}>
        <ProductGrid />
      </ProductGridWrapper>
    </section>
  );
};

export default HomeCollectionSection;

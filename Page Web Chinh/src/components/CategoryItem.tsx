import { Link } from "react-router-dom";

const CategoryItem = ({
  categoryTitle,
  image,
  link,
}: {
  categoryTitle: string;
  image: string;
  link: string;
}) => {
  return (
    <Link
      to={`/shop/${link}`}
      className="group relative overflow-hidden rounded-2xl block
                 w-full aspect-square sm:aspect-[3/4]
                 shadow-md hover:shadow-2xl transition-all duration-500"
    >
      {/* Image */}
      <img
        src={`/assets/${image}`}
        alt={categoryTitle}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
      />

      {/* Overlay gradient */}
      <div
        className="absolute inset-0 transition-all duration-500"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)",
        }}
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-amber-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col gap-2">
        <div className="h-px w-8 bg-amber-400/70 group-hover:w-16 transition-all duration-500" />
        <h3
          className="text-white text-xl sm:text-2xl font-medium tracking-wide"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          {categoryTitle}
        </h3>
        <span className="text-amber-300/80 text-xs tracking-[0.2em] uppercase font-medium opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          Explore →
        </span>
      </div>
    </Link>
  );
};

export default CategoryItem;

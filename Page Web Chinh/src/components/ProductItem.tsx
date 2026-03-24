import { Link } from "react-router-dom";
import { formatCategoryName } from "../utils/formatCategoryName";
import { getImageUrl } from "../utils/formatImageUrl";
import { formatCurrency } from "../utils/formatCurrency";
import { useState } from "react";
import { HiHeart, HiEye } from "react-icons/hi2";

const ProductItem = ({
  id,
  image,
  title,
  category,
  price,
  popularity: _popularity,
  stock: _stock,
  discountPercent = 0,
}: {
  id: string;
  image: string;
  title: string;
  category: string;
  price: number;
  popularity: number;
  stock: number;
  discountPercent?: number;
}) => {
  const [liked, setLiked] = useState(false);
  const finalPrice = discountPercent > 0 ? price * (1 - discountPercent / 100) : price;

  return (
    <div className="product-card group w-full max-w-[380px] flex flex-col bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm">
      
      {/* Image Container */}
      <div className="card-img relative w-full aspect-[4/5] overflow-hidden bg-stone-50">
        <Link to={`/product/${id}`} className="block w-full h-full">
          <img
            src={getImageUrl(image)}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        </Link>

        {/* Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discountPercent > 0 ? (
            <span className="bg-red-500 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-md">
              -{discountPercent}%
            </span>
          ) : (
            <span className="bg-stone-900/80 text-white font-bold text-[10px] px-2.5 py-1 rounded-full tracking-widest uppercase">
              New
            </span>
          )}
        </div>

        {/* Quick actions overlay */}
        <div className="card-actions absolute inset-0 flex items-center justify-center gap-3 bg-black/20">
          <Link
            to={`/product/${id}`}
            className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-stone-900 hover:text-white transition-all duration-200 text-stone-700 hover:scale-110"
            aria-label="Xem chi tiết"
          >
            <HiEye className="text-lg" />
          </Link>
          <button
            onClick={() => setLiked(l => !l)}
            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 ${
              liked ? "bg-red-500 text-white" : "bg-white text-stone-700 hover:bg-red-50 hover:text-red-500"
            }`}
            aria-label="Yêu thích"
          >
            <HiHeart className="text-lg" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-1.5">
        {/* Category */}
        <p className="text-xs font-medium text-amber-700 tracking-widest uppercase">
          {formatCategoryName(category)}
        </p>

        {/* Title */}
        <Link to={`/product/${id}`} className="group/title">
          <h2 className="text-stone-800 font-medium text-base leading-snug group-hover/title:text-amber-800 transition-colors line-clamp-2">
            {title}
          </h2>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2 mt-1">
          {discountPercent > 0 ? (
            <>
              <span className="text-stone-400 line-through text-sm">{formatCurrency(price)}</span>
              <span className="text-orange-500 font-bold text-base">{formatCurrency(finalPrice)}</span>
            </>
          ) : (
            <span className="text-stone-800 font-bold text-base">{formatCurrency(price)}</span>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-1.5 mt-2">
          <Link
            to={`/product/${id}`}
            className="btn-primary w-full bg-stone-900 text-white text-center text-sm font-medium tracking-wide
                       h-10 flex items-center justify-center rounded-lg hover:bg-amber-800 transition-colors"
          >
            View product
          </Link>
          <Link
            to={`/product/${id}`}
            className="w-full text-stone-600 bg-stone-50 text-center text-sm font-medium tracking-wide border border-stone-200
                       h-10 flex items-center justify-center rounded-lg hover:bg-stone-100 transition-colors"
          >
            Learn more
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;

import React from "react";
import ProductItem from "./ProductItem";
import { nanoid } from "nanoid";

const ProductGrid = ({ products }: { products?: Product[] }) => {
  return (
    <div
      id="gridTop"
      className="max-w-screen-2xl mx-auto mt-8 px-5 max-[400px]:px-3
                 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
    >
      {products &&
        products.map((product: Product, idx: number) => (
          <div
            key={nanoid()}
            className="anim-fadeInUp"
            style={{ animationDelay: `${idx * 0.08}s`, animationFillMode: "both" }}
          >
            <ProductItem
              id={product.id}
              image={product.image}
              title={product.title}
              category={product.category}
              price={product.price}
              popularity={product.popularity}
              stock={product.stock}
              discountPercent={product.discountPercent}
            />
          </div>
        ))}
    </div>
  );
};

export default React.memo(ProductGrid);

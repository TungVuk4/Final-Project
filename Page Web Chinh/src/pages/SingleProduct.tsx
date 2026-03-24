import {
  Button,
  Dropdown,
  ProductItem,
  QuantityInput,
  StandardSelectInput,
} from "../components";
import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { addProductToTheCart } from "../features/cart/cartSlice";
import { useAppDispatch, useAppSelector } from "../hooks";
import WithSelectInputWrapper from "../utils/withSelectInputWrapper";
import WithNumberInputWrapper from "../utils/withNumberInputWrapper";
import { formatCategoryName } from "../utils/formatCategoryName";
import toast from "react-hot-toast";
import { getImageUrl } from "../utils/formatImageUrl";
import { formatCurrency } from "../utils/formatCurrency";
import customFetch from "../axios/custom";

const SingleProduct = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [singleProduct, setSingleProduct] = useState<Product | null>(null);
  // defining default values for input fields
  const [size, setSize] = useState<string>("xs");
  const [color, setColor] = useState<string>("black");
  const [quantity, setQuantity] = useState<number>(1);
  const params = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { userInfo } = useAppSelector((state) => state.auth);
  const token = userInfo?.token;

  // defining HOC instances
  const SelectInputUpgrade = WithSelectInputWrapper(StandardSelectInput);
  const QuantityInputUpgrade = WithNumberInputWrapper(QuantityInput);

  useEffect(() => {
    const fetchSingleProduct = async () => {
      const response = await fetch(
        `http://localhost:8080/api/products/${params.id}`
      );
      const data = await response.json();
      setSingleProduct(data);
    };

    const fetchProducts = async () => {
      const response = await fetch("http://localhost:8080/api/products");
      const data = await response.json();
      setProducts(data);
    };
    fetchSingleProduct();
    fetchProducts();
  }, [params.id]);

  const handleAddToCart = async () => {
    if (singleProduct) {
      dispatch(
        addProductToTheCart({
          id: singleProduct.id + size + color,
          productId: singleProduct.id,
          image: singleProduct.image,
          title: singleProduct.title,
          category: singleProduct.category,
          price: (singleProduct.discountPercent && singleProduct.discountPercent > 0)
            ? singleProduct.price * (1 - singleProduct.discountPercent / 100)
            : singleProduct.price,
          quantity,
          size,
          color,
          popularity: singleProduct.popularity,
          stock: singleProduct.stock,
        })
      );
      toast.success("Product added to the cart");

      if (token) {
        // User đã đăng nhập → sync lên DB bằng JWT
        try {
          await customFetch.post(
            "/cart/add",
            { productId: singleProduct.id, quantity, size },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (error) {
          console.error("Sync cart to db failed:", error);
        }
      } else {
        // Khách vãng lai → tạo/lấy guestToken, sync lên DB qua /cart/guest/add
        try {
          let guestToken = localStorage.getItem("fashionGuestToken");
          if (!guestToken) {
            guestToken = crypto.randomUUID();
            localStorage.setItem("fashionGuestToken", guestToken);
          }
          await customFetch.post("/cart/guest/add", {
            guestToken,
            productId: singleProduct.id,
            quantity,
            size,
          });
        } catch (error) {
          console.error("Sync guest cart to db failed:", error);
        }
      }
    }
  };


  return (
    <div className="max-w-screen-2xl mx-auto px-5 max-[400px]:px-3">
      <div className="grid grid-cols-3 gap-x-8 max-lg:grid-cols-1">
        <div className="lg:col-span-2">
          <img
            src={getImageUrl(singleProduct?.image || "")}
            alt={singleProduct?.title}
            className="w-full object-cover rounded-xl shadow-sm"
          />
        </div>
        <div className="w-full flex flex-col gap-5 mt-9">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl">{singleProduct?.title}</h1>
            <div className="flex justify-between items-center">
              <p className="text-base text-secondaryBrown">
                {formatCategoryName(singleProduct?.category || "")}
              </p>
              <div className="flex items-center gap-3">
                {(singleProduct?.discountPercent ?? 0) > 0 ? (
                  <>
                    <span className="bg-orange-500 text-white font-bold text-sm px-2 py-0.5 rounded-md shadow-sm">
                      -{singleProduct?.discountPercent}%
                    </span>
                    <span className="text-gray-400 line-through text-lg">
                      {formatCurrency(singleProduct?.price || 0)}
                    </span>
                    <p className="text-orange-500 text-2xl font-bold">
                      {formatCurrency((singleProduct?.price || 0) * (1 - (singleProduct?.discountPercent || 0) / 100))}
                    </p>
                  </>
                ) : (
                  <p className="text-2xl font-bold">{formatCurrency(singleProduct?.price || 0)}</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <SelectInputUpgrade
              selectList={[
                { id: "xs", value: "XS" },
                { id: "sm", value: "SM" },
                { id: "m", value: "M" },
                { id: "lg", value: "LG" },
                { id: "xl", value: "XL" },
                { id: "2xl", value: "2XL" },
              ]}
              value={size}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setSize(() => e.target.value)
              }
            />
            <SelectInputUpgrade
              selectList={[
                { id: "black", value: "BLACK" },
                { id: "red", value: "RED" },
                { id: "blue", value: "BLUE" },
                { id: "white", value: "WHITE" },
                { id: "rose", value: "ROSE" },
                { id: "green", value: "GREEN" },
              ]}
              value={color}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setColor(() => e.target.value)
              }
            />

            <QuantityInputUpgrade
              value={quantity}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setQuantity(() => parseInt(e.target.value))
              }
            />
          </div>
          <div className="flex flex-col gap-3">
            {singleProduct?.stock && singleProduct.stock > 0 ? (
              <Button mode="brown" text="Add to cart" onClick={handleAddToCart} />
            ) : (
              <button disabled className="w-full bg-red-500 text-white font-bold py-3 rounded-md uppercase tracking-wide opacity-80 cursor-not-allowed flex justify-center items-center gap-2">
                <i className="pi pi-ban"></i> Đã hết hàng
              </button>
            )}
            <p className="text-secondaryBrown text-sm text-right">
              Delivery estimated on the Friday, July 26
            </p>
          </div>
          <div>
            {/* drowdown items */}
            <Dropdown dropdownTitle="Description">
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Labore
              quos deleniti, mollitia, vitae harum suscipit voluptatem quasi, ab
              assumenda accusantium rem praesentium accusamus quae quam tempore
              nostrum corporis eaque. Mollitia.
            </Dropdown>

            <Dropdown dropdownTitle="Product Details">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuga ad
              at odio illo, necessitatibus, reprehenderit dolore voluptas ea
              consequuntur ducimus repellat soluta mollitia facere sapiente.
              Unde provident possimus hic dolore.
            </Dropdown>

            <Dropdown dropdownTitle="Delivery Details">
              Sản phẩm sẽ được giao trong vòng 2-4 ngày làm việc. Quý khách vui lòng kiểm tra kỹ số điện thoại và địa chỉ nhận hàng trước khi thanh toán.
            </Dropdown>

            {/* BÌNH LUẬN & ĐÁNH GIÁ (REVIEWS) */}
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 uppercase tracking-wide flex items-center gap-2">
                <span className="text-orange-400">★</span> Đánh giá sản phẩm ({singleProduct?.reviews?.length || 0})
              </h3>
              
              <div className="flex flex-col gap-5 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {singleProduct?.reviews && singleProduct.reviews.length > 0 ? (
                  singleProduct.reviews.map((rv, index) => (
                    <div key={index} className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex gap-4 transition-all hover:bg-white hover:shadow-sm">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-400 to-amber-300 flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0">
                        {rv.author.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-semibold text-gray-900">{rv.author}</h4>
                          <span className="text-xs text-gray-400">
                            {new Date(rv.date).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <div className="flex text-orange-400 text-sm mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i}>{i < rv.rating ? "★" : "☆"}</span>
                          ))}
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">{rv.comment}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p>Chưa có đánh giá nào cho sản phẩm này.</p>
                  </div>
                )}
              </div>
              
              {/* Form Gửi Review (Dành cho Client tương lai gắn API) */}
              <div className="mt-6 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                 <h4 className="font-semibold mb-3">Viết đánh giá của bạn</h4>
                 <div className="flex flex-col gap-3">
                    <input type="text" placeholder="Tên của bạn" className="border py-2 px-3 rounded-md outline-none focus:border-brown-400 text-sm" id="reviewName" />
                    <select className="border py-2 px-3 rounded-md outline-none text-sm" id="reviewRating">
                      <option value="5">5 Sao - Rất tuyệt vời</option>
                      <option value="4">4 Sao - Sản phẩm tốt</option>
                      <option value="3">3 Sao - Tạm được</option>
                      <option value="2">2 Sao - Không như mong đợi</option>
                      <option value="1">1 Sao - Rất tệ</option>
                    </select>
                    <textarea placeholder="Chia sẻ cảm nhận..." rows={3} className="border py-2 px-3 rounded-md outline-none resize-none text-sm" id="reviewComment"></textarea>
                    <button 
                      onClick={async () => {
                        const name = (document.getElementById('reviewName') as HTMLInputElement).value;
                        const rating = (document.getElementById('reviewRating') as HTMLSelectElement).value;
                        const comment = (document.getElementById('reviewComment') as HTMLTextAreaElement).value;
                        if(!name || !comment) return toast.error("Vui lòng nhập tên và bình luận!");
                        
                        try {
                           const res = await fetch('http://localhost:8080/api/reviews', {
                             method: 'POST',
                             headers: { 'Content-Type': 'application/json' },
                             body: JSON.stringify({ ProductID: Number(singleProduct?.id), GuestName: name, Rating: Number(rating), Comment: comment })
                           });
                           if(res.ok) {
                             toast.success("Cảm ơn bạn đã đánh giá!");
                             // Tự Refresh Data
                             const pRes = await fetch(`http://localhost:8080/api/products/${params.id}`);
                             const pData = await pRes.json();
                             setSingleProduct(pData);
                             (document.getElementById('reviewName') as HTMLInputElement).value = '';
                             (document.getElementById('reviewComment') as HTMLTextAreaElement).value = '';
                           }
                        } catch (err) { toast.error("Có lỗi xảy ra"); }
                      }}
                      className="bg-black text-white hover:bg-gray-800 py-2 rounded-md font-medium transition-colors"
                    >
                      Gửi Đánh Giá
                    </button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* similar products */}
      <div>
        <h2 className="text-black/90 text-5xl mt-24 mb-12 text-center max-lg:text-4xl">
          Similar Products
        </h2>
        <div className="flex flex-wrap justify-between items-center gap-y-8 mt-12 max-xl:justify-start max-xl:gap-5 ">
          {products.slice(0, 3).map((product: Product) => (
            <ProductItem
              key={product?.id}
              id={product?.id}
              image={product?.image}
              title={product?.title}
              category={product?.category}
              price={product?.price}
              popularity={product?.popularity}
              stock={product?.stock}
              discountPercent={product?.discountPercent}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
export default SingleProduct;

import React, { useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Paginator } from "primereact/paginator";
import { Sidebar } from "primereact/sidebar";
import { RadioButton } from "primereact/radiobutton";
import { Slider } from "primereact/slider";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useAuthStore } from "../stores/auth";

const API_URL = "http://localhost:8080/api";

export default function Product() {
  const { t } = useTranslation();

  const [visibleFilter, setVisibleFilter] = useState(false);
  const [productDialog, setProductDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(8);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 10000]);

  const [product, setProduct] = useState({
    name: "",
    price: 0,
    category: null,
    discountPercent: 0,
  });

  const [dbProducts, setDbProducts] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [dbColors, setDbColors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState("all");
  const token = useAuthStore((state) => state.token);
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // Fetch dữ liệu khởi tạo
  React.useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [resCats, resColors] = await Promise.all([
        axios.get(`${API_URL}/categories/getCategories`),
        axios.get(`${API_URL}/colors`)
      ]);
      if (resCats.data?.success) setDbCategories(resCats.data.data);
      if (resColors.data?.success) setDbColors(resColors.data.data);
      
      fetchProducts();
    } catch (err) {
      console.error("Lỗi fetch data khởi tạo:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (filters = {}) => {
    try {
      const { 
        catID = selectedCategory, 
        colID = selectedColor,
        minP = priceRange[0],
        maxP = priceRange[1]
      } = filters;

      const params = new URLSearchParams();
      if (catID !== "all") params.append("categoryID", catID);
      if (colID !== "all") params.append("colorID", colID);
      params.append("minPrice", minP);
      params.append("maxPrice", maxP);

      const res = await axios.get(`${API_URL}/products/getProducts_Admin?${params.toString()}`, config);
      if (res.data?.success) {
        setDbProducts(res.data.data);
      }
    } catch (err) {
      console.error("Lỗi fetch products:", err);
    }
  };

  const handleSaveProduct = async () => {
    if (!product.name || product.price === undefined || !product.category) {
      alert("Vui lòng nhập đầy đủ Tên, Giá và Danh mục!");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        ProductName: product.name,
        Price: product.price,
        CategoryID: product.category,
        StockQuantity: product.stockQuantity || 100,
        DiscountPercent: product.discountPercent || 0,
        Description: product.description || "",
      };

      if (isEdit) {
        await axios.put(`${API_URL}/products/${product.id}`, payload, config);
      } else {
        await axios.post(`${API_URL}/products`, payload, config);
      }
      
      setProductDialog(false);
      fetchProducts();
    } catch (err) {
      console.error("Lỗi khi lưu sản phẩm:", err);
      alert(err.response?.data?.message || "Lỗi khi lưu sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) return;
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/products/${product.id}`, config);
      setProductDialog(false);
      fetchProducts();
    } catch (err) {
      console.error("Lỗi khi xóa sản phẩm:", err);
      alert(err.response?.data?.message || "Lỗi khi xóa sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    fetchProducts();
    setVisibleFilter(false);
  };

  const handleClearFilters = () => {
    setSelectedCategory("all");
    setSelectedColor("all");
    setPriceRange([0, 10000]);
    fetchProducts({ catID: "all", colID: "all", minP: 0, maxP: 10000 });
  };

  return (
    <div className="p-8 bg-[#F9FAFB] min-h-screen font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#212B36] tracking-tight">
            {t("products_title")}
          </h1>
          <p className="text-gray-500 mt-1 font-medium italic">
            JimVu Fashion Premium Management
          </p>
        </div>
        <Button
          label={t("new_product")}
          icon="pi pi-plus"
          className="bg-[#212B36] text-white rounded-xl px-6 py-3 font-bold border-none shadow-lg hover:bg-black transition-all"
          onClick={() => {
            setProduct({ name: "", price: 0, category: null, discountPercent: 0, stockQuantity: 100 });
            setIsEdit(false);
            setProductDialog(true);
          }}
        />
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col lg:flex-row gap-4 mb-10 items-center w-full">
        <div className="bg-white px-4 py-1 rounded-2xl shadow-sm border border-gray-100 flex-1 flex items-center w-full focus-within:ring-1 focus-within:ring-gray-300">
          <i className="pi pi-search text-gray-400 mr-3"></i>
          <InputText
            placeholder={t("search_placeholder")}
            className="w-full border-none focus:ring-0 bg-transparent py-3 text-sm"
          />
        </div>
        <Button
          icon="pi pi-filter"
          label={t("filters")}
          className="bg-white text-[#212B36] border border-gray-200 rounded-2xl px-6 py-3 font-bold shadow-sm hover:bg-gray-50"
          onClick={() => setVisibleFilter(true)}
        />
      </div>

      {/* GRID SẢN PHẨM */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {dbProducts.slice(first, first + rows).map((p, index) => (
          <div
            key={p.ProductID}
            className="group bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 flex flex-col h-full"
            onClick={() => {
              setProduct({
                id: p.ProductID,
                name: p.ProductName,
                price: p.Price,
                category: p.CategoryID || null,
                discountPercent: p.DiscountPercent,
                stockQuantity: p.StockQuantity,
                description: p.Description
              });
              setIsEdit(true);
              setProductDialog(true);
            }}
          >
            <div className="aspect-[4/5] bg-[#F4F6F8] flex items-center justify-center relative overflow-hidden flex-shrink-0">
              <i className="pi pi-image text-5xl text-slate-200 group-hover:scale-110 transition-transform duration-500"></i>
              {p.DiscountPercent > 0 ? (
                <div className="absolute top-3 left-3 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm">
                  -{p.DiscountPercent}%
                </div>
              ) : (
                <div className="absolute top-3 left-3 bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                  NEW
                </div>
              )}
            </div>

            <div className="p-5 flex flex-col flex-grow justify-between min-w-0">
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-[#212B36] mb-1 truncate">
                  {p.ProductName}
                </p>
                <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest">
                  {p.CategoryName || "Fashion JimVu"}
                </p>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div className="flex gap-1">
                  {p.colors && p.colors.length > 0 ? (
                    p.colors.map((c, i) => (
                      <span key={i} className="w-2.5 h-2.5 rounded-full border border-gray-200" style={{ backgroundColor: c.HexCode }}></span>
                    ))
                  ) : (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-black"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    </>
                  )}
                </div>
                <div className="text-right">
                  {p.DiscountPercent > 0 ? (
                    <div className="flex flex-col items-end">
                      <span className="text-gray-400 line-through text-xs font-medium">${p.Price}</span>
                      <span className="font-extrabold text-red-500">${(p.Price * (1 - p.DiscountPercent/100)).toFixed(2)}</span>
                    </div>
                  ) : (
                    <p className="font-extrabold text-[#212B36]">${p.Price}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PHÂN TRANG */}
      <div className="flex justify-center mt-12 mb-10">
        <Paginator
          first={first}
          rows={rows}
          totalRecords={dbProducts.length}
          onPageChange={(e) => setFirst(e.first)}
          className="bg-transparent border-none custom-paginator"
        />
      </div>

      {/* DIALOG THÊM/SỬA */}
      <Dialog
        visible={productDialog}
        style={{ width: "90vw", maxWidth: "500px" }}
        header={
          <span className="font-extrabold text-xl text-[#212B36]">
            {isEdit ? t("edit_product_title") : t("add_product_title")}
          </span>
        }
        modal
        className="rounded-[28px]"
        onHide={() => setProductDialog(false)}
        footer={
          <div className="flex justify-between items-center p-4 border-t border-gray-50">
            {isEdit && (
              <Button
                label={t("delete")}
                icon="pi pi-trash"
                className="p-button-text p-button-danger font-bold text-sm"
                onClick={handleDeleteProduct}
              />
            )}
            <div className="flex gap-3 ml-auto">
              <Button
                label={t("cancel")}
                className="p-button-text text-gray-400 font-bold text-sm border-none"
                onClick={() => setProductDialog(false)}
              />
              <Button
                label={t("save")}
                icon="pi pi-check"
                className="bg-[#212B36] text-white border-none font-bold px-8 py-2.5 rounded-xl shadow-md hover:bg-black transition-all"
                onClick={handleSaveProduct}
                loading={loading}
              />
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-6 py-4 px-2">
          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm text-[#212B36]">
              {t("product_name")}
            </label>
            <InputText
              value={product.name}
              onChange={(e) => setProduct({ ...product, name: e.target.value })}
              className="p-3 border-gray-200 bg-gray-50/50 rounded-xl focus:bg-white transition-all w-full"
              placeholder="VD: Áo Polo Thể Thao..."
            />
          </div>
          <div className="flex gap-4 w-full">
            <div className="flex flex-col gap-2 flex-1">
              <label className="font-bold text-sm text-[#212B36]">
                {t("product_price")} ($)
              </label>
              <InputNumber
                value={product.price}
                onValueChange={(e) => setProduct({ ...product, price: e.value })}
                mode="currency"
                currency="USD"
                className="rounded-xl w-full"
                inputClassName="p-3 bg-gray-50/50 rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <label className="font-bold text-sm text-[#212B36]">
                Khuyến Mãi (%)
              </label>
              <InputNumber
                value={product.discountPercent}
                onValueChange={(e) => setProduct({ ...product, discountPercent: e.value })}
                suffix=" %"
                min={0}
                max={100}
                className="rounded-xl w-full"
                inputClassName="p-3 bg-gray-50/50 border-gray-200 text-red-500 font-bold focus:bg-white rounded-xl"
                placeholder="VD: 20%"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm text-[#212B36]">
              {t("select_category")}
            </label>
            <Dropdown
              value={product.category}
              options={dbCategories.map(c => ({ label: c.CategoryName, value: c.CategoryID }))}
              onChange={(e) => setProduct({ ...product, category: e.value })}
              placeholder={t("select_category")}
              className="rounded-xl border-gray-200 bg-gray-50/50 p-1"
              filter
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm text-[#212B36]">
              Mô tả (Description)
            </label>
            <InputText
              value={product.description || ""}
              onChange={(e) => setProduct({ ...product, description: e.target.value })}
              className="p-3 border-gray-200 bg-gray-50/50 rounded-xl focus:bg-white transition-all w-full"
              placeholder="Nhập mô tả chi tiết sản phẩm..."
            />
          </div>
        </div>
      </Dialog>

      {/* SIDEBAR BỘ LỌC */}
      <Sidebar
        visible={visibleFilter}
        position="right"
        onHide={() => setVisibleFilter(false)}
        className="w-full md:w-[360px] p-0"
        header={
          <span className="font-extrabold text-xl px-6 pt-6">{t("filters")}</span>
        }
      >
        <div className="px-8 py-4 flex flex-col gap-10 h-full overflow-y-auto pb-32">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-bold text-xs text-gray-400 uppercase tracking-widest">{t("price")}</h4>
              <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                ${priceRange[0]} - ${priceRange[1]}
              </span>
            </div>
            <Slider
              value={priceRange}
              onChange={(e) => setPriceRange(e.value)}
              range
              min={0}
              max={10000}
              className="w-full"
            />
          </div>
          
          <div className="border-t border-gray-100 pt-8">
            <h4 className="font-extrabold text-[11px] uppercase tracking-[0.1em] text-gray-400 mb-5 flex items-center">
              {t("group_collections")} <i className="pi pi-chevron-right ml-2 text-[8px]"></i>
            </h4>
            <div className="flex flex-col gap-4">
              <div
                className="flex items-center group cursor-pointer"
                onClick={() => setSelectedCategory("all")}
              >
                <RadioButton
                  inputId="all_cat"
                  value="all"
                  onChange={(e) => setSelectedCategory(e.value)}
                  checked={selectedCategory === "all"}
                />
                <label htmlFor="all_cat" className={`ml-4 text-sm font-medium cursor-pointer ${selectedCategory === "all" ? "text-black font-bold" : "text-gray-500"}`}>
                  Tất cả bộ sưu tập
                </label>
              </div>
              {dbCategories.map((item) => (
                <div
                  key={item.CategoryID}
                  className="flex items-center group cursor-pointer"
                  onClick={() => setSelectedCategory(item.CategoryID)}
                >
                  <RadioButton
                    inputId={`cat_${item.CategoryID}`}
                    value={item.CategoryID}
                    onChange={(e) => setSelectedCategory(e.value)}
                    checked={selectedCategory === item.CategoryID}
                  />
                  <label
                    htmlFor={`cat_${item.CategoryID}`}
                    className={`ml-4 text-sm font-medium transition-colors cursor-pointer ${
                      selectedCategory === item.CategoryID
                        ? "text-black font-bold"
                        : "text-gray-500 group-hover:text-black"
                    }`}
                  >
                    {item.CategoryName}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8">
            <h4 className="font-extrabold text-[11px] uppercase tracking-[0.1em] text-gray-400 mb-5 flex items-center">
              {t("colors_label")} <i className="pi pi-chevron-right ml-2 text-[8px]"></i>
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div 
                className={`flex flex-col items-center gap-2 p-2 rounded-xl cursor-pointer border transition-all ${selectedColor === "all" ? "border-blue-500 bg-blue-50" : "border-gray-100"}`}
                onClick={() => setSelectedColor("all")}
              >
                <div className="w-6 h-6 rounded-full border border-gray-200 bg-gradient-to-tr from-gray-200 to-gray-500"></div>
                <span className="text-[10px] font-bold">ALL</span>
              </div>
              {dbColors.map((color) => (
                <div 
                  key={color.ColorID}
                  className={`flex flex-col items-center gap-2 p-2 rounded-xl cursor-pointer border transition-all ${selectedColor === color.ColorID ? "border-blue-500 bg-blue-50" : "border-gray-100 hover:border-gray-300"}`}
                  onClick={() => setSelectedColor(color.ColorID)}
                >
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-200 shadow-sm" 
                    style={{ backgroundColor: color.HexCode }}
                  ></div>
                  <span className="text-[10px] font-bold truncate w-full text-center">
                    {t(`color_${color.ColorName.toLowerCase()}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 w-full p-8 bg-white/90 backdrop-blur-sm border-t border-gray-100 flex gap-4">
            <Button
              label={t("clear")}
              text
              className="flex-1 font-bold text-gray-400 text-sm hover:text-red-500"
              onClick={handleClearFilters}
            />
            <Button
              label={t("apply")}
              className="flex-1 bg-[#212B36] text-white rounded-xl font-bold border-none shadow-lg py-3 text-sm"
              onClick={handleApplyFilters}
            />
          </div>
        </div>
      </Sidebar>

      <style jsx="true">{`
        .p-radiobutton .p-radiobutton-box.p-highlight,
        .p-slider .p-slider-range {
          background: #212b36 !important;
          border-color: #212b36 !important;
        }
        .p-slider .p-slider-handle {
          border: 2px solid #212b36 !important;
          height: 16px;
          width: 16px;
        }
        .custom-paginator .p-highlight {
          background-color: #212b36 !important;
          color: white !important;
          box-shadow: 0 4px 10px rgba(33, 43, 54, 0.2) !important;
        }
        .p-dialog-mask {
          background-color: rgba(0, 0, 0, 0.4) !important;
          backdrop-filter: blur(4px);
        }
        .p-inputnumber-input {
          width: 100% !important;
        }
      `}</style>
    </div>
  );
}

import React, { useState, useRef } from "react";
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
const IMG_URL = "http://localhost:8080/uploads/product_images";

export default function Product() {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  const [visibleFilter, setVisibleFilter] = useState(false);
  const [productDialog, setProductDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [first, setFirst] = useState(0);
  const [rows] = useState(8);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 10000]);

  const [product, setProduct] = useState({
    name: "", price: 0, category: null, discountPercent: 0,
    stockQuantity: 100, description: "", images: []
  });
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);

  const [dbProducts, setDbProducts] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [dbColors, setDbColors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedColor, setSelectedColor] = useState("all");

  const token = useAuthStore((state) => state.token);
  const config = { headers: { Authorization: `Bearer ${token}` } };

  React.useEffect(() => { fetchInitialData(); }, []);

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
        maxP = priceRange[1],
        q = searchQuery
      } = filters;
      const params = new URLSearchParams();
      if (catID !== "all") params.append("categoryID", catID);
      if (colID !== "all") params.append("colorID", colID);
      params.append("minPrice", minP);
      params.append("maxPrice", maxP);
      if (q) params.append("query", q);

      const res = await axios.get(`${API_URL}/products/getProducts_Admin?${params.toString()}`, config);
      if (res.data?.success) setDbProducts(res.data.data);
    } catch (err) {
      console.error("Lỗi fetch products:", err);
    }
  };

  // Ghi nhật ký hoạt động sau mỗi thao tác quan trọng
  const logAction = async (action, details) => {
    try {
      await axios.post(`${API_URL}/admin-logs`, { action, details }, config);
    } catch (err) {
      console.warn("Ghi log thất bại (không ảnh hưởng chức năng):", err.message);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setUploadPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleUploadImage = async () => {
    if (!uploadFile) return null;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", uploadFile);
      const res = await axios.post(
        `${API_URL}/products/upload-image`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );
      if (res.data?.success) return res.data.fileName;
    } catch (err) {
      console.error("Lỗi upload ảnh:", err);
      alert("Lỗi khi upload ảnh!");
    } finally {
      setUploadingImage(false);
    }
    return null;
  };

  const handleSaveProduct = async () => {
    if (!product.name || product.price === undefined || !product.category) {
      alert("Vui lòng nhập đầy đủ Tên, Giá và Danh mục!");
      return;
    }
    try {
      setLoading(true);
      let imageFileName = product.images?.[0] || null;
      if (uploadFile) {
        const uploaded = await handleUploadImage();
        if (uploaded) imageFileName = uploaded;
      }
      const payload = {
        ProductName: product.name,
        Price: product.price,
        CategoryID: product.category,
        StockQuantity: product.stockQuantity || 100,
        DiscountPercent: product.discountPercent || 0,
        Description: product.description || "",
        Images: imageFileName ? [{ FileName: imageFileName }] : []
      };
      if (isEdit) {
        await axios.put(`${API_URL}/products/${product.id}`, payload, config);
        await logAction(
          "Cập nhật sản phẩm",
          `Đã sửa sản phẩm "${product.name}" (ID: ${product.id}) — Giá: $${product.price}`
        );
      } else {
        const res2 = await axios.post(`${API_URL}/products`, payload, config);
        await logAction(
          "Thêm sản phẩm mới",
          `Đã thêm sản phẩm mới "${product.name}" — Giá: $${product.price}, Danh mục ID: ${product.category}`
        );
      }
      setProductDialog(false);
      setUploadPreview(null);
      setUploadFile(null);
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
      await logAction(
        "Xóa sản phẩm",
        `Đã xóa sản phẩm "${product.name}" (ID: ${product.id})`
      );
      setProductDialog(false);
      fetchProducts();
    } catch (err) {
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
    setSearchQuery("");
    fetchProducts({ catID: "all", colID: "all", minP: 0, maxP: 10000, q: "" });
  };

  const filteredProducts = dbProducts.filter(p =>
    p.ProductName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.CategoryName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openProductDialog = (p = null) => {
    setUploadPreview(null);
    setUploadFile(null);
    if (p) {
      setProduct({
        id: p.ProductID, name: p.ProductName, price: p.Price,
        category: p.CategoryID || null, discountPercent: p.DiscountPercent,
        stockQuantity: p.StockQuantity, description: p.Description,
        images: p.firstImage ? [p.firstImage] : []
      });
      if (p.firstImage) setUploadPreview(`${IMG_URL}/${p.firstImage}`);
      setIsEdit(true);
    } else {
      setProduct({ name: "", price: 0, category: null, discountPercent: 0, stockQuantity: 100, description: "", images: [] });
      setIsEdit(false);
    }
    setProductDialog(true);
  };

  const colorMap = {
    BLACK: "#1a1a1a", RED: "#e53e3e", BLUE: "#3182ce",
    WHITE: "#f7fafc", ROSE: "#ed6b9e", GREEN: "#38a169"
  };

  return (
    <div className="min-h-screen font-sans" style={{ background: "linear-gradient(135deg, #0f0f23 0%, #1a1a35 50%, #0f0f23 100%)" }}>
      
      {/* HEADER HERO */}
      <div className="relative overflow-hidden px-8 pt-10 pb-6">
        <div className="absolute inset-0 opacity-20" style={{backgroundImage:"radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 50%), radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 50%)"}}></div>
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="text-xs font-bold text-purple-400 uppercase tracking-[0.3em] mb-2 block">Fashion Premium</span>
            <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-2xl">
              {t("products_title") || "Sản Phẩm"}
            </h1>
            <p className="text-gray-400 mt-1 font-medium text-sm">
              {dbProducts.length} sản phẩm · JimVu Fashion Collection
            </p>
          </div>
          <Button
            label={t("new_product") || "Thêm sản phẩm"}
            icon="pi pi-plus"
            onClick={() => openProductDialog()}
            className="border-none font-bold px-8 py-3 rounded-2xl shadow-2xl text-sm"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff" }}
          />
        </div>
      </div>

      {/* SEARCH + FILTER BAR */}
      <div className="px-8 pb-6">
        <div className="flex gap-3 items-center">
          <div className="flex-1 flex items-center gap-3 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-sm"
            style={{ background: "rgba(255,255,255,0.05)" }}>
            <i className="pi pi-search text-gray-400 text-sm"></i>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="bg-transparent text-white placeholder-gray-500 text-sm flex-1 outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-gray-500 hover:text-white">
                <i className="pi pi-times text-xs"></i>
              </button>
            )}
          </div>
          <Button
            icon="pi pi-sliders-h"
            label={t("filters") || "Bộ lọc"}
            onClick={() => setVisibleFilter(true)}
            className="border font-bold px-6 py-3 rounded-2xl text-sm backdrop-blur-sm"
            style={{ background: "rgba(255,255,255,0.07)", borderColor: "rgba(255,255,255,0.15)", color: "white" }}
          />
        </div>

        {/* Active Filter Chips */}
        {(selectedCategory !== "all" || selectedColor !== "all") && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {selectedCategory !== "all" && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-purple-300 border border-purple-500/30 bg-purple-500/10">
                {dbCategories.find(c => c.CategoryID === selectedCategory)?.CategoryName}
                <button onClick={() => { setSelectedCategory("all"); fetchProducts({ catID: "all" }); }}>
                  <i className="pi pi-times text-[10px] ml-1"></i>
                </button>
              </span>
            )}
            {selectedColor !== "all" && (
              <span className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-blue-300 border border-blue-500/30 bg-blue-500/10">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dbColors.find(c => c.ColorID === selectedColor)?.HexCode }}></span>
                {dbColors.find(c => c.ColorID === selectedColor)?.ColorName}
                <button onClick={() => { setSelectedColor("all"); fetchProducts({ colID: "all" }); }}>
                  <i className="pi pi-times text-[10px]"></i>
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* PRODUCT GRID */}
      <div className="px-8 pb-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
              <p className="text-gray-400 text-sm">Đang tải sản phẩm...</p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(99,102,241,0.15)" }}>
              <i className="pi pi-box text-3xl text-purple-400"></i>
            </div>
            <p className="text-gray-400 font-medium">Không tìm thấy sản phẩm nào</p>
            <button onClick={handleClearFilters} className="text-purple-400 text-sm hover:text-purple-300 underline">
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.slice(first, first + rows).map((p) => {
              const discountedPrice = p.DiscountPercent > 0
                ? (p.Price * (1 - p.DiscountPercent / 100)).toFixed(0)
                : null;
              return (
                <div
                  key={p.ProductID}
                  onClick={() => openProductDialog(p)}
                  className="group relative cursor-pointer rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2"
                  style={{
                    background: "linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)"
                  }}
                >
                  {/* Image Zone */}
                  <div className="relative aspect-[4/5] overflow-hidden" style={{ background: "linear-gradient(135deg, #1e1b4b, #312e81)" }}>
                    {p.firstImage ? (
                      <img
                        src={`${IMG_URL}/${p.firstImage}`}
                        alt={p.ProductName}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                      />
                    ) : null}
                    <div className={`w-full h-full items-center justify-center ${p.firstImage ? "hidden" : "flex"}`}>
                      <i className="pi pi-image text-5xl text-indigo-300/30"></i>
                    </div>

                    {/* Badge */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {p.DiscountPercent > 0 ? (
                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-black text-white shadow-lg"
                          style={{ background: "linear-gradient(135deg, #ef4444, #f97316)" }}>
                          -{p.DiscountPercent}%
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-black text-white shadow-lg"
                          style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                          NEW
                        </span>
                      )}
                    </div>

                    {/* Edit overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                      style={{ background: "rgba(99,102,241,0.2)", backdropFilter: "blur(4px)" }}>
                      <div className="flex gap-2">
                        <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
                          <i className="pi pi-pencil text-white text-sm"></i>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <p className="text-white font-bold text-sm truncate mb-1">{p.ProductName}</p>
                    <p className="text-purple-400/70 text-[10px] font-bold uppercase tracking-widest mb-3">
                      {p.CategoryName || "JimVu Collection"}
                    </p>

                    {/* Colors + Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {p.colors?.length > 0 ? (
                          p.colors.slice(0, 4).map((c, i) => (
                            <span key={i}
                              className="w-3 h-3 rounded-full border border-white/20 shadow-inner"
                              style={{ backgroundColor: c.HexCode }}
                            ></span>
                          ))
                        ) : (
                          <span className="text-gray-600 text-[10px]">—</span>
                        )}
                      </div>
                      <div className="text-right">
                        {discountedPrice ? (
                          <div>
                            <span className="text-gray-500 line-through text-[10px] mr-1">${p.Price}</span>
                            <span className="text-orange-400 font-extrabold text-sm">${discountedPrice}</span>
                          </div>
                        ) : (
                          <span className="text-white font-extrabold text-sm">${p.Price}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PHÂN TRANG */}
        {filteredProducts.length > rows && (
          <div className="flex justify-center mt-10">
            <Paginator
              first={first}
              rows={rows}
              totalRecords={filteredProducts.length}
              onPageChange={(e) => setFirst(e.first)}
              className="bg-transparent border-none"
            />
          </div>
        )}
      </div>

      {/* ====== DIALOG THÊM/SỬA ====== */}
      <Dialog
        visible={productDialog}
        style={{ width: "95vw", maxWidth: "560px" }}
        header={
          <span className="font-black text-xl text-white">
            {isEdit ? "✏️ Cập nhật sản phẩm" : "✨ Thêm sản phẩm mới"}
          </span>
        }
        modal
        onHide={() => setProductDialog(false)}
        contentStyle={{ background: "linear-gradient(135deg, #1a1a35, #0f0f23)", padding: "0" }}
        headerStyle={{ background: "linear-gradient(135deg, #1a1a35, #0f0f23)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        footer={
          <div className="flex justify-between items-center p-5 border-t" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
            {isEdit && (
              <Button
                label="Xóa sản phẩm"
                icon="pi pi-trash"
                severity="danger"
                text
                className="font-bold text-sm text-red-400 hover:text-red-300"
                onClick={handleDeleteProduct}
              />
            )}
            <div className="flex gap-3 ml-auto">
              <Button
                label="Hủy"
                text
                className="font-bold text-sm text-gray-400"
                onClick={() => setProductDialog(false)}
              />
              <Button
                label={loading ? "Đang lưu..." : "Lưu sản phẩm"}
                icon="pi pi-check"
                disabled={loading}
                onClick={handleSaveProduct}
                className="font-bold px-8 py-2.5 rounded-xl border-none text-sm text-white shadow-lg"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              />
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-5 p-6">
          {/* Upload Ảnh */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Ảnh sản phẩm</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative cursor-pointer rounded-2xl overflow-hidden flex items-center justify-center transition-all"
              style={{ height: "200px", background: "rgba(99,102,241,0.08)", border: "2px dashed rgba(99,102,241,0.3)" }}
            >
              {uploadPreview ? (
                <>
                  <img src={uploadPreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-all">
                    <p className="text-white text-sm font-bold">Nhấn để thay đổi ảnh</p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 text-center p-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(99,102,241,0.2)" }}>
                    <i className="pi pi-image text-2xl text-purple-400"></i>
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">Click để chọn ảnh</p>
                    <p className="text-gray-500 text-xs mt-1">PNG, JPG, WEBP (max 5MB)</p>
                  </div>
                </div>
              )}
              {uploadingImage && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>

          {/* Tên + Số lượng */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tên sản phẩm *</label>
              <input
                value={product.name}
                onChange={(e) => setProduct({ ...product, name: e.target.value })}
                placeholder="VD: Luxury Dress..."
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>
            <div style={{ width: "120px" }}>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tồn kho</label>
              <input
                type="number"
                value={product.stockQuantity}
                onChange={(e) => setProduct({ ...product, stockQuantity: parseInt(e.target.value) || 0 })}
                placeholder="100"
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>
          </div>

          {/* Giá + Khuyến mãi */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Giá ($) *</label>
              <InputNumber
                value={product.price}
                onValueChange={(e) => setProduct({ ...product, price: e.value })}
                mode="currency" currency="USD"
                className="rounded-xl w-full"
                inputClassName="w-full px-4 py-3 rounded-xl text-sm"
                inputStyle={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Khuyến mãi (%)</label>
              <InputNumber
                value={product.discountPercent}
                onValueChange={(e) => setProduct({ ...product, discountPercent: e.value })}
                suffix=" %" min={0} max={100}
                className="rounded-xl w-full"
                inputClassName="w-full px-4 py-3 rounded-xl text-sm"
                inputStyle={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#f97316" }}
              />
            </div>
          </div>

          {/* Danh mục */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Bộ sưu tập *</label>
            <div className="grid grid-cols-2 gap-2">
              {dbCategories.map((cat) => (
                <button
                  key={cat.CategoryID}
                  onClick={() => setProduct({ ...product, category: cat.CategoryID })}
                  className="px-4 py-3 rounded-xl text-sm font-bold text-left transition-all"
                  style={{
                    background: product.category === cat.CategoryID
                      ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                      : "rgba(255,255,255,0.05)",
                    border: product.category === cat.CategoryID
                      ? "1px solid #6366f1"
                      : "1px solid rgba(255,255,255,0.08)",
                    color: product.category === cat.CategoryID ? "#fff" : "#9ca3af"
                  }}
                >
                  <span className="mr-2">{
                    cat.CategoryName.includes("Luxury") ? "💎" :
                    cat.CategoryName.includes("Special") ? "⭐" :
                    cat.CategoryName.includes("Summer") ? "🌞" : "✨"
                  }</span>
                  {cat.CategoryName}
                </button>
              ))}
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Mô tả</label>
            <input
              value={product.description || ""}
              onChange={(e) => setProduct({ ...product, description: e.target.value })}
              placeholder="Mô tả chi tiết sản phẩm..."
              className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
          </div>
        </div>
      </Dialog>

      {/* ====== SIDEBAR BỘ LỌC DARK ====== */}
      <Sidebar
        visible={visibleFilter}
        position="right"
        onHide={() => setVisibleFilter(false)}
        className="w-full md:w-[380px] p-0"
        style={{ background: "linear-gradient(180deg, #1a1a35 0%, #0f0f23 100%)" }}
        header={
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <span className="font-black text-xl text-white">Bộ lọc</span>
            <button onClick={handleClearFilters} className="text-xs font-bold text-purple-400 hover:text-purple-300 underline">
              Xóa tất cả
            </button>
          </div>
        }
      >
        <div className="p-6 flex flex-col gap-8 overflow-y-auto h-full pb-36">
          {/* Giá */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.15em]">Khoảng giá</h4>
              <span className="text-sm font-extrabold text-purple-400">
                ${priceRange[0].toLocaleString()} – ${priceRange[1].toLocaleString()}
              </span>
            </div>
            <Slider
              value={priceRange}
              onChange={(e) => setPriceRange(e.value)}
              range min={0} max={10000}
              className="w-full"
            />
          </div>

          {/* Bộ sưu tập */}
          <div className="border-t pt-6" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.15em] mb-4">Bộ sưu tập</h4>
            <div className="flex flex-col gap-2">
              {[{ CategoryID: "all", CategoryName: "Tất cả bộ sưu tập", icon: "🏷️" },
                ...dbCategories.map(c => ({
                  ...c,
                  icon: c.CategoryName.includes("Luxury") ? "💎" : c.CategoryName.includes("Special") ? "⭐" : c.CategoryName.includes("Summer") ? "🌞" : "✨"
                }))
              ].map((item) => (
                <button
                  key={item.CategoryID}
                  onClick={() => setSelectedCategory(item.CategoryID)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left transition-all"
                  style={{
                    background: selectedCategory === item.CategoryID ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.03)",
                    border: selectedCategory === item.CategoryID ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(255,255,255,0.05)",
                    color: selectedCategory === item.CategoryID ? "#a5b4fc" : "#6b7280"
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.CategoryName}</span>
                  {selectedCategory === item.CategoryID && <i className="pi pi-check ml-auto text-purple-400 text-xs"></i>}
                </button>
              ))}
            </div>
          </div>

          {/* Màu sắc */}
          <div className="border-t pt-6" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.15em] mb-4">Màu sắc</h4>
            <div className="grid grid-cols-3 gap-3">
              {[{ ColorID: "all", ColorName: "ALL", HexCode: null },
                ...dbColors
              ].map((color) => (
                <button
                  key={color.ColorID}
                  onClick={() => setSelectedColor(color.ColorID)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all"
                  style={{
                    background: selectedColor === color.ColorID ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.03)",
                    border: selectedColor === color.ColorID ? "1px solid rgba(99,102,241,0.6)" : "1px solid rgba(255,255,255,0.06)"
                  }}
                >
                  <div className="w-7 h-7 rounded-full shadow-inner"
                    style={{
                      background: color.HexCode || "conic-gradient(red, orange, yellow, green, blue, violet, red)",
                      border: color.ColorName === "WHITE" ? "2px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.1)"
                    }}
                  ></div>
                  <span className="text-[10px] font-bold" style={{ color: selectedColor === color.ColorID ? "#a5b4fc" : "#6b7280" }}>
                    {color.ColorName}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 w-full p-5 border-t flex gap-3"
          style={{ background: "rgba(15,15,35,0.95)", backdropFilter: "blur(12px)", borderColor: "rgba(255,255,255,0.08)" }}>
          <button
            onClick={() => setVisibleFilter(false)}
            className="flex-1 py-3 rounded-xl font-bold text-sm border transition-all"
            style={{ color: "#9ca3af", borderColor: "rgba(255,255,255,0.1)", background: "transparent" }}
          >
            Đóng
          </button>
          <button
            onClick={handleApplyFilters}
            className="flex-1 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            Áp dụng
          </button>
        </div>
      </Sidebar>

      <style>{`
        .p-slider .p-slider-range { background: linear-gradient(90deg, #6366f1, #8b5cf6) !important; }
        .p-slider .p-slider-handle { border: 2px solid #8b5cf6 !important; background: #1a1a35 !important; }
        .p-paginator { background: transparent !important; }
        .p-paginator .p-paginator-pages .p-paginator-page.p-highlight { background: linear-gradient(135deg, #6366f1, #8b5cf6) !important; color: white !important; border: none !important; }
        .p-paginator .p-paginator-element { color: #6b7280 !important; }
        .p-paginator .p-paginator-element:hover { background: rgba(99,102,241,0.15) !important; color: #a5b4fc !important; }
        .p-dialog .p-dialog-header { padding: 1.5rem 1.5rem 1rem !important; }
        .p-dialog { border-radius: 1.5rem !important; border: 1px solid rgba(255,255,255,0.1) !important; overflow: hidden; }
        .p-dialog-mask { background: rgba(0,0,0,0.7) !important; backdrop-filter: blur(8px); }
        .p-sidebar { box-shadow: -20px 0 60px rgba(0,0,0,0.5) !important; }
        .p-inputnumber-input { background: transparent !important; }
      `}</style>
    </div>
  );
}

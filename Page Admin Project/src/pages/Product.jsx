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

export default function Product() {
  const { t } = useTranslation();

  const [visibleFilter, setVisibleFilter] = useState(false);
  const [productDialog, setProductDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(8);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 1000]);

  const [product, setProduct] = useState({
    name: "",
    price: 0,
    category: null,
  });

  const products = Array.from({ length: 40 });

  const filterGroups = [
    {
      label: t("group_tops"),
      items: [
        { label: t("tanktop"), value: "tanktop" },
        { label: t("t_shirt"), value: "t_shirt" },
        { label: t("sport_shirt"), value: "sport_top" }, // Đã khớp với i18n
        { label: t("polo"), value: "polo" },
        { label: t("shirt"), value: "shirt" },
        { label: t("long_sleeve"), value: "long_sleeve" },
        { label: t("sweater"), value: "sweater" },
        { label: t("hoodie"), value: "hoodie" },
        { label: t("jacket"), value: "jacket" },
        { label: t("graphic_tshirt"), value: "graphic_t_shirt" }, // Đã khớp key i18n
      ],
    },
    {
      label: t("group_bottoms"),
      items: [
        { label: t("short"), value: "short" },
        { label: t("jogger"), value: "jogger" },
        { label: t("sport_pants"), value: "sport_pants" },
        { label: t("long_pants"), value: "long_pants" },
        { label: t("pants"), value: "pants" },
        { label: t("jeans"), value: "jeans" },
        { label: t("khaki"), value: "khaki" },
        { label: t("swimwear"), value: "swimwear" },
      ],
    },
    {
      label: t("group_underwear"),
      items: [
        { label: t("brief"), value: "brief" },
        { label: t("trunk"), value: "trunk" },
        { label: t("boxer_brief"), value: "boxer_brief" },
        { label: t("long_leg"), value: "long_leg" },
        { label: t("homewear"), value: "home_short" }, // Đã khớp key i18n
      ],
    },
    {
      label: t("group_accessories"),
      items: [{ label: t("all_accessories"), value: "accessories" }],
    },
  ];

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
            setProduct({ name: "", price: 0, category: null });
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

      {/* GRID SẢN PHẨM: Đã fix lỗi tràn chữ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {products.slice(first, first + rows).map((_, index) => (
          <div
            key={index}
            className="group bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 flex flex-col h-full"
            onClick={() => {
              setIsEdit(true);
              setProductDialog(true);
            }}
          >
            {/* Ảnh sản phẩm với tỉ lệ cố định */}
            <div className="aspect-[4/5] bg-[#F4F6F8] flex items-center justify-center relative overflow-hidden flex-shrink-0">
              <i className="pi pi-image text-5xl text-slate-200 group-hover:scale-110 transition-transform duration-500"></i>
              <div className="absolute top-3 left-3 bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                NEW
              </div>
            </div>

            {/* Nội dung sản phẩm - Chống tràn chữ */}
            <div className="p-5 flex flex-col flex-grow justify-between min-w-0">
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-[#212B36] mb-1 truncate">
                  {/* Dòng này quan trọng: truncate sẽ biến chữ dài thành dấu ... */}
                  {t("product")} #{first + index + 1} - Mẫu thiết kế cao cấp
                  giới hạn JimVu
                </p>
                <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest">
                  Fashion JimVu
                </p>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div className="flex gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-black"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                </div>
                <p className="font-extrabold text-[#212B36]">$99.00</p>
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
          totalRecords={products.length}
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
                onClick={() => setProductDialog(false)}
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
          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm text-[#212B36]">
              {t("product_price")}
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
          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm text-[#212B36]">
              {t("select_category")}
            </label>
            <Dropdown
              value={product.category}
              options={filterGroups}
              optionLabel="label"
              optionGroupLabel="label"
              optionGroupChildren="items"
              onChange={(e) => setProduct({ ...product, category: e.value })}
              placeholder="-- Chọn danh mục --"
              className="rounded-xl border-gray-200 bg-gray-50/50 p-1"
              filter
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
          <span className="font-extrabold text-xl px-6 pt-6">
            {t("filters")}
          </span>
        }
      >
        <div className="px-8 py-4 flex flex-col gap-10 h-full overflow-y-auto pb-32">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-bold text-xs text-gray-400 uppercase tracking-widest">
                {t("price")}
              </h4>
              <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                ${priceRange[0]} - ${priceRange[1]}
              </span>
            </div>
            <Slider
              value={priceRange}
              onChange={(e) => setPriceRange(e.value)}
              range
              min={0}
              max={1000}
              className="w-full"
            />
          </div>
          {filterGroups.map((group, idx) => (
            <div key={idx} className="border-t border-gray-100 pt-8">
              <h4 className="font-extrabold text-[11px] uppercase tracking-[0.1em] text-gray-400 mb-5 flex items-center">
                {group.label}{" "}
                <i className="pi pi-chevron-right ml-2 text-[8px]"></i>
              </h4>
              <div className="flex flex-col gap-4">
                {group.items.map((item) => (
                  <div
                    key={item.value}
                    className="flex items-center group cursor-pointer"
                    onClick={() => setSelectedCategory(item.value)}
                  >
                    <RadioButton
                      inputId={item.value}
                      value={item.value}
                      onChange={(e) => setSelectedCategory(e.value)}
                      checked={selectedCategory === item.value}
                    />
                    <label
                      htmlFor={item.value}
                      className={`ml-4 text-sm font-medium transition-colors cursor-pointer ${
                        selectedCategory === item.value
                          ? "text-black font-bold"
                          : "text-gray-500 group-hover:text-black"
                      }`}
                    >
                      {item.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="absolute bottom-0 left-0 w-full p-8 bg-white/90 backdrop-blur-sm border-t border-gray-100 flex gap-4">
            <Button
              label={t("clear")}
              text
              className="flex-1 font-bold text-gray-400 text-sm hover:text-red-500"
              onClick={() => {
                setSelectedCategory("all");
                setPriceRange([0, 1000]);
              }}
            />
            <Button
              label={t("apply")}
              className="flex-1 bg-[#212B36] text-white rounded-xl font-bold border-none shadow-lg py-3 text-sm"
              onClick={() => setVisibleFilter(false)}
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

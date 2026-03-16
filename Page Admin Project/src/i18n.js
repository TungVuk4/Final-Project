import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  vi: {
    translation: {
      // --- Topbar & Sidebar keys ---
      search: "Tìm kiếm...",
      search_placeholder: "Tìm kiếm sản phẩm...",
      home: "Trang chủ",
      dashboard: "Bảng điều khiển",
      users: "Người dùng",
      roles: "Vai trò",
      product: "Sản phẩm",
      products_title: "Sản phẩm",
      login: "Đăng nhập",

      // --- Profile Popover keys ---
      profile: "Hồ sơ",
      settings: "Cài đặt",
      logout: "Đăng xuất",

      // --- Product Page Actions & Modal ---
      new_product: "Thêm sản phẩm",
      add_product_title: "Thêm sản phẩm mới",
      edit_product_title: "Cập nhật sản phẩm",
      product_name: "Tên sản phẩm",
      product_price: "Giá tiền",
      select_category: "Chọn danh mục",
      save: "Lưu lại",
      delete: "Xóa sản phẩm",
      cancel: "Hủy bỏ",

      // --- User Page Keys (MỚI CẬP NHẬT) ---
      user_management_sub: "Quản lý tài khoản và phân quyền hệ thống",
      user_table_name: "Người dùng",
      user_table_role: "Vai trò",
      user_table_date: "Ngày tạo",
      user_table_status: "Trạng thái",
      user_table_action: "Hành động",
      search_user_placeholder: "Tìm kiếm theo tên hoặc email...",

      // Dialog Cập nhật
      update_user_header: "Chi tiết tài khoản",
      full_name_label: "HỌ VÀ TÊN",
      role_label: "VAI TRÒ",
      admin_role: "Quản trị viên (Admin)",
      customer_role: "Khách hàng (Customer)",
      update_btn: "Cập nhật",
      close_btn: "Đóng",

      // Xác nhận xóa
      confirm_delete_header: "Cảnh báo bảo mật",
      confirm_delete_msg:
        "Hành động này sẽ xóa vĩnh viễn tài khoản. Bạn có chắc chắn không?",
      bulk_delete_header: "Xác nhận xóa hàng loạt",
      bulk_delete_msg:
        "Bạn có chắc chắn muốn xóa {{count}} người dùng đã chọn?",
      confirm_yes: "Xác nhận xóa",
      confirm_no: "Quay lại",

      // --- Filter Sidebar keys ---
      filters: "Bộ lọc",
      gender: "Giới tính",
      men: "Nam",
      price: "Giá",
      clear: "Xóa tất cả",
      apply: "Áp dụng",
      category: "Danh mục sản phẩm",

      // Nhóm Áo Nam
      group_tops: "Áo Nam",
      tanktop: "Áo Tanktop",
      t_shirt: "Áo thun",
      sport_shirt: "Áo Thể Thao",
      polo: "Áo Polo",
      shirt: "Áo Sơ Mi",
      long_sleeve: "Áo Dài Tay",
      sweater: "Áo Sweater",
      hoodie: "Áo Hoodie",
      jacket: "Áo Khoác",
      graphic_tshirt: "Áo thun Graphic",

      // Nhóm Quần Nam
      group_bottoms: "Quần Nam",
      short: "Quần Short",
      jogger: "Quần Jogger",
      sport_pants: "Quần Thể Thao",
      long_pants: "Quần Dài",
      pants: "Quần Pants",
      jeans: "Quần Jean",
      khaki: "Quần Kaki",
      swimwear: "Quần Bơi",

      // Nhóm Quần Lót
      group_underwear: "Quần Lót Nam",
      brief: "Brief (Tam giác)",
      trunk: "Trunk (Boxer)",
      boxer_brief: "Boxer Brief (Boxer dài)",
      long_leg: "Long Leg",
      homewear: "Short mặc nhà",

      // Phụ kiện
      group_accessories: "Phụ kiện",
      all_accessories: "Tất cả phụ kiện (Tất, mũ, túi...)",

      // --- Sort keys ---
      sort_by: "Sắp xếp theo",
      sort_featured: "Nổi bật",
      sort_newest: "Mới nhất",
      sort_price_high: "Giá: Cao đến Thấp",
      sort_price_low: "Giá: Thấp đến Cao",
    },
  },
  en: {
    translation: {
      // --- Topbar & Sidebar keys ---
      search: "Search...",
      search_placeholder: "Search product...",
      home: "Home",
      dashboard: "Dashboard",
      users: "Users",
      roles: "Roles",
      product: "Product",
      products_title: "Products",
      login: "Sign in",

      // --- Profile Popover keys ---
      profile: "Profile",
      settings: "Settings",
      logout: "Logout",

      // --- Product Page Actions & Modal ---
      new_product: "New Product",
      add_product_title: "Add New Product",
      edit_product_title: "Update Product",
      product_name: "Product Name",
      product_price: "Price",
      select_category: "Select Category",
      save: "Save",
      delete: "Delete",
      cancel: "Cancel",

      // --- User Page Keys (NEW) ---
      user_management_sub: "System account and permission management",
      user_table_name: "User",
      user_table_role: "Role",
      user_table_date: "Created At",
      user_table_status: "Status",
      user_table_action: "Action",
      search_user_placeholder: "Search by name or email...",

      // Update Dialog
      update_user_header: "Account Details",
      full_name_label: "FULL NAME",
      role_label: "ROLE",
      admin_role: "Administrator (Admin)",
      customer_role: "Customer",
      update_btn: "Update",
      close_btn: "Close",

      // Confirm Delete
      confirm_delete_header: "Security Warning",
      confirm_delete_msg:
        "This action will permanently delete the account. Are you sure?",
      bulk_delete_header: "Confirm Bulk Delete",
      bulk_delete_msg:
        "Are you sure you want to delete {{count}} selected users?",
      confirm_yes: "Confirm Delete",
      confirm_no: "Go Back",

      // --- Filter Sidebar keys ---
      filters: "Filters",
      gender: "Gender",
      men: "Men",
      price: "Price",
      clear: "Clear All",
      apply: "Apply",
      category: "Category",

      // Nhóm Áo Nam
      group_tops: "Men's Tops",
      tanktop: "Tanktop",
      t_shirt: "T-Shirt",
      sport_shirt: "Sport Shirt",
      polo: "Polo",
      shirt: "Shirt",
      long_sleeve: "Long Sleeve",
      sweater: "Sweater",
      hoodie: "Hoodie",
      jacket: "Jacket",
      graphic_tshirt: "Graphic T-Shirt",

      // Nhóm Quần Nam
      group_bottoms: "Men's Bottoms",
      short: "Shorts",
      jogger: "Joggers",
      sport_pants: "Sport Pants",
      long_pants: "Long Pants",
      pants: "Pants",
      jeans: "Jeans",
      khaki: "Khaki",
      swimwear: "Swimwear",

      // Nhóm Quần Lót
      group_underwear: "Men's Underwear",
      brief: "Briefs",
      trunk: "Trunks",
      boxer_brief: "Boxer Briefs",
      long_leg: "Long Leg",
      homewear: "Home Shorts",

      // Phụ kiện
      group_accessories: "Accessories",
      all_accessories: "All Accessories",

      // --- Sort keys ---
      sort_by: "Sort By",
      sort_featured: "Featured",
      sort_newest: "Newest",
      sort_price_high: "Price: High-Low",
      sort_price_low: "Price: Low-High",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "vi",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;

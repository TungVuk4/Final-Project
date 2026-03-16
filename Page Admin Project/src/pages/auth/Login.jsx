import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Password } from "primereact/password";
import { useState, useRef } from "react";
import { useAuthStore } from "../../stores/auth";
import { useNavigate } from "react-router-dom";
import { Toast } from "primereact/toast";
// Import hàm gọi API từ ApiServices
import { loginApi } from "../../services/ApiServices";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const setLogin = useAuthStore((state) => state.setLogin);
  const navigate = useNavigate();
  const toast = useRef(null);

  const handleClick = async () => {
    // 1. Kiểm tra dữ liệu đầu vào cơ bản
    if (!email || !pass) {
      toast.current.show({
        severity: "warn",
        summary: "Thông báo",
        detail: "Vui lòng nhập đầy đủ Email và Mật khẩu",
      });
      return;
    }

    try {
      // 2. Gọi API đăng nhập từ Backend
      // Truyền đúng các trường Email và Password như Backend yêu cầu
      const response = await loginApi(email, pass);
      if (response.success) {
        console.log("Dữ liệu User từ Backend:", response.user);
        // PHẢI TRUYỀN response.user để lấy đúng dữ liệu từ Backend gửi về
        setLogin(response.token, response.user);
        navigate("/");
      }
      if (response.success) {
        // 3. Kiểm tra phân quyền: Chỉ cho phép Admin vào trang này
        if (response.user.role === "Admin") {
          // Lưu token và thông tin user vào Auth Store
          setLogin(response.token, response.user);

          toast.current.show({
            severity: "success",
            summary: "Thành công",
            detail: `Chào mừng ${response.user.name} quay trở lại!`,
          });

          // Điều hướng về trang chủ sau 1 giây để người dùng kịp nhìn thông báo thành công
          setTimeout(() => {
            navigate("/");
          }, 1000);
        } else {
          // Nếu đăng nhập bằng tài khoản Customer
          toast.current.show({
            severity: "error",
            summary: "Truy cập bị từ chối",
            detail: "Tài khoản của bạn không có quyền truy cập trang quản trị",
          });
        }
      }
    } catch (error) {
      // 4. Hiển thị lỗi từ Backend trả về (Ví dụ: "Email hoặc mật khẩu không đúng")
      toast.current.show({
        severity: "error",
        summary: "Lỗi đăng nhập",
        detail: error || "Không thể kết nối tới máy chủ",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50 p-4">
      <Toast ref={toast} />

      {/* Logo góc trên trái */}
      <div
        onClick={() => navigate("/")}
        className="absolute top-8 left-8 cursor-pointer"
      >
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
          <i className="pi pi-prime text-white text-xl"></i>
        </div>
      </div>

      <div className="w-full max-w-[480px] bg-white rounded-[24px] p-8 md:p-12 shadow-xl shadow-gray-200/50 border border-gray-100/50">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Sign in</h2>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-500 ml-1">
              Email address
            </label>
            <InputText
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@gmail.com"
              className="p-3 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-semibold text-slate-500 ml-1">
                Password
              </label>
            </div>
            <Password
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              toggleMask
              feedback={false}
              placeholder="••••••••"
              inputClassName="w-full p-3 rounded-xl border-gray-200"
              className="w-full"
            />
          </div>

          <Button
            label="Sign in"
            onClick={handleClick}
            className="w-full py-4 bg-black border-none rounded-xl font-bold text-white hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
          />

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400 font-semibold">
                OR
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-6 text-xl">
            <i className="pi pi-google text-red-500 cursor-pointer hover:scale-110 transition-transform"></i>
            <i className="pi pi-github text-slate-800 cursor-pointer hover:scale-110 transition-transform"></i>
            <i className="pi pi-twitter text-blue-400 cursor-pointer hover:scale-110 transition-transform"></i>
          </div>
        </div>
      </div>
    </div>
  );
}

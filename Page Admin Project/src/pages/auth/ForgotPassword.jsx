import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic gửi email khôi phục mật khẩu ở đây
    console.log("Reset email sent to:", email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50 p-4">
      {/* Logo góc trên trái */}
      <div
        className="absolute top-8 left-8 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center shadow-lg">
          <i className="pi pi-prime text-white text-xl"></i>
        </div>
      </div>

      <div className="w-full max-w-[480px] bg-white rounded-[24px] p-8 md:p-12 shadow-xl shadow-gray-200/50 border border-gray-100/50">
        {/* Hình ảnh minh họa nhỏ (Icon ổ khóa) */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-cyan-50 rounded-full flex items-center justify-center text-cyan-600">
            <i className="pi pi-lock text-4xl"></i>
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Forgot your password?
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed px-4">
            Please enter the email address associated with your account and We
            will email you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Email Input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-500 ml-1">
              Email address
            </label>
            <InputText
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              className="p-3 rounded-xl border-gray-200 focus:ring-1 focus:ring-cyan-400"
              required
            />
          </div>

          <Button
            label="Send Request"
            type="submit"
            className="w-full py-4 bg-black border-none rounded-xl font-bold text-white hover:bg-gray-800 transition-all shadow-lg"
          />

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="inline-flex items-center text-sm font-semibold text-slate-700 hover:text-black transition-colors"
            >
              <i className="pi pi-chevron-left mr-2 text-xs font-bold"></i>
              Return to sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

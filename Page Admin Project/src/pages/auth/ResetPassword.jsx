import React, { useState } from "react";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleReset = (e) => {
    e.preventDefault();
    if (newPassword === confirmPassword) {
      // Logic gọi API cập nhật mật khẩu mới ở đây
      console.log("Password reset successful");
      navigate("/login");
    } else {
      alert("Passwords do not match!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50 p-4">
      {/* Logo */}
      <div
        className="absolute top-8 left-8 cursor-pointer"
        onClick={() => navigate("/login")}
      >
        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center shadow-lg">
          <i className="pi pi-prime text-white text-xl"></i>
        </div>
      </div>

      <div className="w-full max-w-[480px] bg-white rounded-[24px] p-8 md:p-12 shadow-xl shadow-gray-200/50 border border-gray-100/50">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Reset Password
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Please enter your new password below.
          </p>
        </div>

        <form onSubmit={handleReset} className="flex flex-col gap-6">
          {/* New Password */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-500 ml-1">
              New Password
            </label>
            <Password
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              toggleMask
              placeholder="••••••••"
              inputClassName="w-full p-3 rounded-xl border-gray-200"
              className="w-full"
              promptLabel="Choose a password"
            />
          </div>

          {/* Confirm New Password */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-500 ml-1">
              Confirm New Password
            </label>
            <Password
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              toggleMask
              feedback={false}
              placeholder="••••••••"
              inputClassName="w-full p-3 rounded-xl border-gray-200"
              className="w-full"
            />
          </div>

          <Button
            label="Reset Password"
            type="submit"
            className="w-full py-4 bg-black border-none rounded-xl font-bold text-white hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
          />

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-sm font-semibold text-blue-600 hover:underline transition-colors"
            >
              Back to login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Password } from "primereact/password";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50 p-4">
      <div className="w-full max-w-[480px] bg-white rounded-[24px] p-8 md:p-12 shadow-xl shadow-gray-200/50">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Get started absolutely free.
          </h2>
          <p className="text-slate-500 text-sm">
            Already have an account?{" "}
            <span
              className="text-blue-600 font-semibold cursor-pointer hover:underline"
              onClick={() => navigate("/login")}
            >
              Login
            </span>
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-500 ml-1">
              Full Name
            </label>
            <InputText
              placeholder="Tùng Vũ"
              className="p-3 rounded-xl border-gray-200"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-500 ml-1">
              Email address
            </label>
            <InputText
              placeholder="vutung@gmail.com"
              className="p-3 rounded-xl border-gray-200"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-500 ml-1">
              Password
            </label>
            <Password
              toggleMask
              placeholder="••••••••"
              inputClassName="w-full p-3 rounded-xl border-gray-200"
              className="w-full"
            />
          </div>
          <Button
            label="Register"
            // Nền đen (bg-black), chữ trắng (text-white)
            className="w-full py-4 bg-black border-none rounded-xl font-bold text-white mt-4 hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
          />
          <p className="text-[11px] text-center text-gray-400 mt-4 leading-relaxed px-4">
            By registering, I agree to Minimals{" "}
            <span className="underline cursor-pointer">Terms of Service</span>{" "}
            and <span className="underline cursor-pointer">Privacy Policy</span>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

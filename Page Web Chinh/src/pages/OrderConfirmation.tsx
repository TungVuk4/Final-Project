import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const OrderConfirmation = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20">
      {/* Icon */}
      <div className="w-28 h-28 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
        <svg className="w-14 h-14 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-3xl font-light text-gray-800 text-center mb-2">{t("checkout.order_success", "Đặt hàng thành công! 🎉")}</h1>
      <p className="text-gray-500 text-center max-w-md mb-8">
        {t("checkout.thanks_shopping", "Cảm ơn bạn đã mua sắm tại")} <span className="font-semibold text-gray-700">FashionStyle</span>.
        {" "}{t("checkout.order_received", "Đơn hàng của bạn đã được tiếp nhận và sẽ được xử lý trong thời gian sớm nhất.")}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <Link
          to="/order-history"
          className="flex-1 text-center bg-gray-900 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-xl transition-all"
        >
          {t("checkout.view_order_history", "Xem lịch sử đơn hàng")}
        </Link>
        <Link
          to="/shop"
          className="flex-1 text-center border border-gray-300 hover:border-gray-500 text-gray-700 font-medium py-3 px-6 rounded-xl transition-all"
        >
          {t("checkout.continue_shopping", "Tiếp tục mua sắm")}
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmation;

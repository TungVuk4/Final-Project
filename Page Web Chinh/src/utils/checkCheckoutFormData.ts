import toast from "react-hot-toast";

export const checkCheckoutFormData = (checkoutData: {
  data: {
    [k: string]: FormDataEntryValue;
  };
  products: ProductInCart[];
  subtotal: number;
  paymentMethod?: string;
}) => {
  if (checkoutData.data?.address === "") {
    toast.error("Vui lòng nhập Địa chỉ");
    return false;
  } else if (checkoutData.data?.city === "") {
    toast.error("Vui lòng nhập Thành phố");
    return false;
  } else if (checkoutData.data?.country === "") {
    toast.error("Vui lòng chọn Quốc gia");
    return false;
  } else if (checkoutData.data?.emailAddress === "") {
    toast.error("Vui lòng nhập Địa chỉ Email");
    return false;
  } else if (checkoutData.data?.firstName === "") {
    toast.error("Vui lòng nhập Tên");
    return false;
  } else if (checkoutData.data?.lastName === "") {
    toast.error("Vui lòng nhập Họ");
    return false;
  } else if (checkoutData?.paymentMethod === "") {
    toast.error("Vui lòng chọn Hình thức thanh toán");
    return false;
  } else if (checkoutData.data?.phone === "") {
    toast.error("Vui lòng nhập Số điện thoại");
    return false;
  } else if (checkoutData.data?.postalCode === "") {
    toast.error("Vui lòng nhập Mã bưu điện (Postal Code)");
    return false;
  } else if (checkoutData?.products.length === 0) {
    toast.error("Giỏ hàng của bạn đang trống");
    return false;
  } else if (checkoutData?.subtotal === 0) {
    toast.error("Có lỗi xảy ra, tổng tiền không hợp lệ");
    return false;
  }

  return true;
};

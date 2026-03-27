import { formatCategoryName } from "../utils/formatCategoryName";
import { useTranslation } from "react-i18next";

const ShopBanner = ({ category }: { category: string }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-secondaryBrown text-white py-10 flex justify-center items-center mx-5 my-10">
      <h2 className="text-3xl max-sm:text-2xl">
        {category ? formatCategoryName(category) : t("shop.shop_page", "Shop page")}
      </h2>
    </div>
  );
};
export default ShopBanner;

import { useAppSelector } from "../hooks";
import { useTranslation } from "react-i18next";

const ShopFilterAndSort = ({
  sortCriteria,
  setSortCriteria,
}: {
  sortCriteria: string;
  setSortCriteria: (value: string) => void;
}) => {
  const { showingProducts, totalProducts } = useAppSelector(state => state.shop);
  const { t } = useTranslation();
  return (
    <div className="flex justify-between items-center px-5 max-sm:flex-col max-sm:gap-5">
      <p className="text-lg">{t("shop.showing_results", "Showing 1–{{showing}} of {{total}} results", { showing: showingProducts, total: totalProducts })}</p>
      <div className="flex gap-3 items-center">
        <p>{t("shop.sort_by", "Sort by:")}</p>
        <div className="relative">
          <select
            className="border border-[rgba(0,0,0,0.40)] px-2 py-1"
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setSortCriteria(e.target.value)
            }
            value={sortCriteria}
          >
            <option value="default">{t("shop.default", "Default")}</option>
            <option value="popularity">{t("shop.popularity", "Popularity")}</option>
            <option value="price-asc">{t("shop.price_asc", "Price: low to high")}</option>
            <option value="price-desc">{t("shop.price_desc", "Price: high to low")}</option>
          </select>
        </div>
      </div>
    </div>
  );
};
export default ShopFilterAndSort;

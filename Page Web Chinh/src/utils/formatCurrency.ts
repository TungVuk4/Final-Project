export const formatCurrency = (amount: number) => {
  if (!amount) return "0$";
  return new Intl.NumberFormat("en-US").format(amount) + "$";
};

export const money = (amount: number) =>
  "₹" + amount.toLocaleString("en-IN", { minimumFractionDigits: 2 });

export const formatDate = (date: Date | string) =>
  new Date(date).toLocaleDateString("en-IN");

export const formatDateTime = (date: Date | string) =>
  new Date(date).toLocaleString("en-IN");

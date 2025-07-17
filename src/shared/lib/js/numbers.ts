export const formatBalance = (balance: number | string) => {
  return Number(balance) % 1 === 0
    ? balance.toString()
    : Number(balance)?.toFixed(2) || "0";
};

export const formatNumber = (number: number, fractionDigits: number) => {
  return number.toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
};

export const formatChangePercent = (changePercent: number | string) => {
  const sign = Number(changePercent) >= 0 ? "+" : "";
  return `${sign} ${Number(changePercent)?.toFixed(2) || "0"}%`;
};

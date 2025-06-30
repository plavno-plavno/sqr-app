export const formatBalance = (balance: number) => {
  return balance % 1 === 0 ? balance.toString() : balance.toFixed(2);
};

export const formatNumber = (number: number, fractionDigits: number) => {
  return number.toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
};

export const formatChangePercent = (changePercent: number) => {
  const sign = changePercent >= 0 ? "+" : "";
  return `${sign} ${changePercent.toFixed(2)}%`;
};

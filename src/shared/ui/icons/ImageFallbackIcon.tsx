import type { CustomIconProps } from "@/shared/model/icons";

export const ImageFallbackIcon = ({
  svgClasses,
  pathClasses,
  pathProps,
  ...svgProps
}: CustomIconProps) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={svgClasses}
    {...svgProps}
  >
    <path
      d="M9.66667 4C9.66667 4.92048 8.92048 5.66667 8 5.66667C7.07953 5.66667 6.33333 4.92048 6.33333 4C6.33333 3.07953 7.07953 2.33333 8 2.33333C8.92048 2.33333 9.66667 3.07953 9.66667 4Z"
      fill="#787878"
      className={pathClasses}
      {...pathProps}
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2.66667 0H9.32667C10.8 0 11.9933 1.19333 11.9933 2.66667V9.33333C11.9933 10.8067 10.8 12 9.32667 12H2.66667C1.19333 12 0 10.8067 0 9.33333V2.66667C0 1.19333 1.19333 0 2.66667 0ZM9.33333 1.33333H2.66667V1.34C1.93333 1.34 1.33333 1.94 1.33333 2.67333V6.14667L2.18 5.51333L2.19333 5.5C3.00667 4.95333 4.1 5.08 4.76667 5.8C5.74667 6.85333 6.72667 7.63333 8 7.63333C9.13333 7.63333 9.90667 7.26 10.6667 6.55333V2.66667C10.6667 1.93333 10.0667 1.33333 9.33333 1.33333Z"
      fill="#787878"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);

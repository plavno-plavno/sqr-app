import type { CustomIconProps } from "@/shared/model/icons";

export const PlusIcon = ({
  svgClasses,
  pathClasses,
  pathProps,
  ...svgProps
}: CustomIconProps) => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 17 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={svgClasses}
    {...svgProps}
  >
    <path
      d="M1 8.49219H15.9902"
      stroke="#787878"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
    <path
      d="M8.4917 15.9902L8.4917 0.999999"
      stroke="#787878"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);

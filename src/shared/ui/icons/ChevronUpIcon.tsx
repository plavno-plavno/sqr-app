import type { CustomIconProps } from "@/shared/model/icons";

export const ChevronUpIcon = ({
  svgClasses,
  pathClasses,
  pathProps,
  ...svgProps
}: CustomIconProps) => (
  <svg
    width="10"
    height="6"
    viewBox="0 0 10 6"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={svgClasses}
    {...svgProps}
  >
    <path
      d="M1 5L4.99999 1L9 5"
      stroke="#242424"
      strokeWidth="1.33333"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);

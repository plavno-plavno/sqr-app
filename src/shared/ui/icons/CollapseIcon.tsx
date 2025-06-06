import type { CustomIconProps } from "@/shared/model/icons";

export const CollapseIcon = ({
  svgClasses,
  pathClasses,
  pathProps,
  ...svgProps
}: CustomIconProps) => (
  <svg
    width="14"
    height="10"
    viewBox="0 0 14 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={svgClasses}
    {...svgProps}
  >
    <path
      d="M1.33008 5H13.3301M1.33008 1H13.3301M1.33008 9H13.3301"
      stroke="#242424"
      strokeWidth="1.33333"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);

import type { CustomIconProps } from "@/shared/model/icons";

export const CardIcon = ({
  svgClasses,
  pathClasses,
  pathProps,
  ...svgProps
}: CustomIconProps) => (
  <svg
    width="18"
    height="14"
    viewBox="0 0 18 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={svgClasses}
    {...svgProps}
  >
    <path
      d="M1.14258 5.42857H16.8569M2.71401 1.5H15.2854C16.1533 1.5 16.8569 2.20355 16.8569 3.07143V10.9286C16.8569 11.7964 16.1533 12.5 15.2854 12.5H2.71401C1.84613 12.5 1.14258 11.7964 1.14258 10.9286V3.07143C1.14258 2.20355 1.84613 1.5 2.71401 1.5Z"
      stroke="#787878"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);

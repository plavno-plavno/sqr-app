import type { CustomIconProps } from "@/shared/model/icons";

export const AiCircleIcon = ({
  svgClasses,
  pathClasses,
  pathProps,
  ...svgProps
}: CustomIconProps) => (
  <svg
    width="100"
    height="100"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={svgClasses}
    {...svgProps}
  >
    <circle cx="50" cy="50" r="50" fill="#D9D9D9" />
    <path
      d="M100 49.9993C100 77.6136 77.6142 99.9993 50 99.9993C22.3858 99.9993 0 77.6136 0 49.9993C37 77.999 50 -14.001 100 49.9993Z"
      fill="#E1E1E1"
      className={pathClasses}
      {...pathProps}
    />
    <path
      d="M100 49.9996C100 77.6138 77.6142 99.9996 50 99.9996C22.3858 99.9996 0 77.6138 0 49.9996C60.5 93.4995 50 16.4997 100 49.9996Z"
      fill="#D2D0D0"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);

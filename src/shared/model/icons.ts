import type { ComponentProps } from "react";

export type CustomIconProps = {
  svgClasses?: string;
  pathClasses?: string;
  pathProps?: ComponentProps<"path">;
} & ComponentProps<"svg">;

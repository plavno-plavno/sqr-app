import VoiceVisualizationImage from "@/shared/assets/images/voice-visualization.png";
import { cn } from "@/shared/lib/css/tailwind";
import { IconWrapper } from "@/shared/ui/icon-wrapper";
import { ChatDialogCardLayout } from "./chat-dialog-card-layout";
import React from "react";

export const ChatDialogActionCardRowWithIcon = ({
  firstLine,
  secondLine,
  className,
}: {
  firstLine?: React.ReactNode;
  secondLine?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("grid grid-cols-[auto_1fr] gap-3", className)}>
      <IconWrapper />
      <div className="flex flex-col gap-px">
        {firstLine}
        {secondLine}
      </div>
    </div>
  );
};

export const ChatDialogActionCardRowTwoItems = ({
  leftValue,
  rightValue,
  className,
}: {
  leftValue?: React.ReactNode;
  rightValue?: React.ReactNode;
  className?: string;
}) => {
  const isLeftValueElement = React.isValidElement(leftValue);
  const isRightValueElement = React.isValidElement(rightValue);

  return (
    <div
      className={cn(
        "grid grid-cols-[1fr_auto] justify-between items-end",
        className
      )}
    >
      {isLeftValueElement ? (
        leftValue
      ) : (
        <p className="text-[32px] font-semibold truncate">
          <span className="text-primary-foreground">$</span>
          {leftValue}
        </p>
      )}
      {isRightValueElement ? (
        rightValue
      ) : (
        <p className="text-base font-semibold text-foreground/50">
          <span className="text-primary-foreground/50">$</span>
          {rightValue}
        </p>
      )}
    </div>
  );
};

export const ChatDialogActionCardDetails = ({
  details,
  className,
}: {
  details: {
    name: string;
    value: string;
  }[];
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {details.map((detail) => (
        <div key={detail.name}>
          <p className="text-base font-medium">{detail.name}:</p>
          <p className="text-base font-light">{detail.value}</p>
        </div>
      ))}
    </div>
  );
};

export const ChatDialogActionCardSection = ({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <p className="text-sm font-medium text-primary-foreground">{title}</p>
      {children}
    </div>
  );
};

export function ChatDialogActionCard({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <ChatDialogCardLayout className={cn(className)}>
      {children}
      <img src={VoiceVisualizationImage} alt="Voice Vizualization Image" />
    </ChatDialogCardLayout>
  );
}

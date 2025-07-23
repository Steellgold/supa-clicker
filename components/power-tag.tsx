import { useGame } from "@/lib/providers/game-provider";
import { cn } from "@/lib/utils";
import { Component } from "@/type/component";
import Image, { ImageProps } from "next/image";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren & {
  power?: number | string;
  imageProps?: Partial<Omit<ImageProps, "src" | "alt">>;
};

export const PowerTag: Component<Props> = ({ power, children, imageProps }) => {
  const { className: imageClassName, ...restImageProps } = imageProps || {};

  const prestigeLevel = useGame().gameState.prestigeLevel || 0;
  
  return (
    <span className="gap-1">
      {children || power || "0"}
      <Image
        src={
          prestigeLevel === 0
            ? "https://s7yh4pytyr.ufs.sh/f/UAfcSNyPsVRcaZbCWfRtnFV2sdUP3CpEvxLX6hT07JoGkQRK"
            : "https://s7yh4pytyr.ufs.sh/f/UAfcSNyPsVRcEMs5MqP0aZASkifH6LNlXoWQ5O28eqMPxcUj"
        }
        alt="Power Icon"
        width={20}
        height={20}
        className={cn("inline-block ml-2 mb-1", imageClassName)}
        {...restImageProps}
      />
    </span>
  );
}
'use client';

import NextImage, { type ImageProps } from "next/image";
import { canOptimizeImage } from "@/lib/image-loader";

export default function SiteImage({ src, unoptimized, ...props }: ImageProps) {
    return (
        <NextImage
            {...props}
            src={src}
            unoptimized={unoptimized || typeof src !== "string" || !canOptimizeImage(src)}
        />
    );
}

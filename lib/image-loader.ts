import type { ImageLoaderProps } from "next/image";
import optimizedImages from "./optimized-images.json";

const assetsPrefix = "/gh/Ethereumistic/db-prod-assets/";
const assets: Record<string, { id: string; widths: number[] }> = optimizedImages;

function getImageSource(src: string) {
    let url: URL;
    try {
        url = new URL(src);
    } catch {
        return undefined;
    }

    if (url.protocol !== "https:") return undefined;

    if (url.host === "cdn.sanity.io" && url.pathname.startsWith("/images/")) {
        return { type: "sanity" as const, url };
    }

    if (url.host === "cdn.jsdelivr.net" && url.pathname.startsWith(assetsPrefix) && !url.search) {
        const key = url.pathname.slice(assetsPrefix.length);
        if (Object.hasOwn(assets, key)) {
            return { type: "static" as const, asset: assets[key] };
        }
    }
}

export function canOptimizeImage(src: string) {
    return Boolean(getImageSource(src));
}

export default function imageLoader({ src, width, quality }: ImageLoaderProps) {
    const source = getImageSource(src);

    if (source?.type === "static") {
        const { id, widths } = source.asset;
        const size = widths.find((candidate) => candidate >= width) ?? widths[widths.length - 1];
        return `/optimized-images/${id}-${size}.webp`;
    }

    if (source?.type === "sanity") {
        source.url.searchParams.set("w", String(width));
        source.url.searchParams.set("q", String(quality ?? 75));
        if (!source.url.searchParams.has("fit")) source.url.searchParams.set("fit", "max");
        if (!source.url.searchParams.has("fm")) source.url.searchParams.set("auto", "format");
        return source.url.href;
    }

    return src;
}

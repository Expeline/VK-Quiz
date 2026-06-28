import { useEffect, useMemo } from "react";

const stickerTypes = ["leaf", "check", "bolt", "trophy", "spark", "target"];

function createStickers() {
    return Array.from({ length: 216 }, (_, index) => ({
        id: index,
        type: stickerTypes[Math.floor(Math.random() * stickerTypes.length)],
        x: Math.random() * 112 - 4,
        y: Math.random() * 116 - 6,
        size: 13 + Math.random() * 31,
        delay: -Math.random() * 12,
        rotate: Math.random() * 110 - 55,
    }));
}

function StickerIcon({ type }) {
    if (type === "leaf") {
        return <path d="M18 3C9 4 4 10 4 18c8 0 14-5 14-15Zm-1 4C9 11 6 15 4 22" />;
    }

    if (type === "check") {
        return <path d="m4 12 5 5L20 6" />;
    }

    if (type === "bolt") {
        return <path d="M13 2 4 14h7l-1 8 10-13h-7l0-7Z" />;
    }

    if (type === "trophy") {
        return <path d="M8 4h8v5a4 4 0 0 1-8 0V4Zm0 2H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4M12 14v4m-4 2h8" />;
    }

    if (type === "target") {
        return (
            <>
                <circle cx="12" cy="12" r="8" />
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
            </>
        );
    }

    return <path d="M12 2v5m0 10v5M2 12h5m10 0h5M5 5l3.5 3.5M15.5 15.5 19 19M19 5l-3.5 3.5M8.5 15.5 5 19" />;
}

function StickerField({ stickers, className = "" }) {
    return (
        <div className={`sticker-field ${className}`} aria-hidden="true">
            {stickers.map((sticker) => (
                <svg
                    key={sticker.id}
                    className="sticker-float"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.3"
                    style={{
                        "--x": `${sticker.x.toFixed(2)}%`,
                        "--y": `${sticker.y.toFixed(2)}%`,
                        "--delay": `${sticker.delay.toFixed(2)}s`,
                        "--size": `${sticker.size.toFixed(2)}px`,
                        "--rotate": `${sticker.rotate.toFixed(2)}deg`,
                    }}
                >
                    <StickerIcon type={sticker.type} />
                </svg>
            ))}
        </div>
    );
}

function EmojiBackdrop() {
    const stickers = useMemo(() => createStickers(), []);

    useEffect(() => {
        const handlePointerMove = (event) => {
            document.documentElement.style.setProperty("--cursor-x", `${event.clientX}px`);
            document.documentElement.style.setProperty("--cursor-y", `${event.clientY}px`);
        };

        window.addEventListener("pointermove", handlePointerMove);

        return () => window.removeEventListener("pointermove", handlePointerMove);
    }, []);

    return (
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <StickerField stickers={stickers} className="sticker-field-muted" />
            <StickerField stickers={stickers} className="sticker-field-reveal" />
        </div>
    );
}

export default EmojiBackdrop;

import { useEffect } from "react";
import type { ArchiveEntry } from "@/types/api";
import { cx } from "@/utils/cx";

type PreviewImageKind = "backdrop" | "poster";

interface ImagePreviewModalProps {
    entry: ArchiveEntry;
    imageKind: PreviewImageKind;
    imageUrl: string;
    onClose: () => void;
}

const previewContent = {
    backdrop: {
        imageClassName: "aspect-[16/9] w-full max-w-[min(82vw,1120px)]",
    },
    poster: {
        imageClassName: "aspect-[2/3] w-full max-w-[min(72vw,440px)]",
    },
} satisfies Record<
    PreviewImageKind,
    {
        imageClassName: string;
    }
>;

export const ImagePreviewModal = ({ entry, imageKind, imageUrl, onClose }: ImagePreviewModalProps) => {
    const content = previewContent[imageKind];

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/80 p-4 backdrop-blur-[6px] sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-label={`${entry.title} image preview`}
            onClick={onClose}
        >
            <img
                src={imageUrl}
                alt={entry.title}
                className={cx(content.imageClassName, "max-h-[76vh] rounded-[28px] border border-secondary bg-secondary object-contain shadow-xl")}
                onClick={(event) => event.stopPropagation()}
            />
        </div>
    );
};

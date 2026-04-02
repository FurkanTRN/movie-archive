import type { MouseEvent, ReactNode } from "react";
import { CloseButton } from "@/components/base/buttons/close-button";
import { cx } from "@/utils/cx";

interface ArchiveModalShellProps {
    children: ReactNode;
    contentClassName?: string;
    description: string;
    onClose: () => void;
    title: string;
}

export const ArchiveModalShell = ({ children, contentClassName, description, onClose, title }: ArchiveModalShellProps) => {
    const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-overlay/70 px-3 pb-3 pt-10 backdrop-blur-[6px] sm:px-4 sm:pb-4 sm:pt-16 lg:items-center lg:p-8" onClick={handleOverlayClick}>
            <div
                className="flex max-h-[min(96dvh,960px)] w-full max-w-5xl flex-col overflow-hidden rounded-[24px] border border-secondary bg-primary shadow-xl sm:rounded-[28px]"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="shrink-0 grid gap-4 p-4 sm:gap-6 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <h2 className="text-xl font-semibold text-primary sm:text-2xl">{title}</h2>
                            <p className="mt-1.5 text-sm text-tertiary sm:mt-2 sm:text-md">{description}</p>
                        </div>
                        <CloseButton size="sm" onPress={onClose} />
                    </div>
                </div>

                <div className={cx("scrollbar-ui flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4 sm:px-6 sm:pb-6", contentClassName)}>{children}</div>
            </div>
        </div>
    );
};

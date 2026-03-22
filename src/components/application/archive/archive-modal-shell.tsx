import type { MouseEvent, ReactNode } from "react";
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
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-overlay/70 px-4 pb-4 pt-16 backdrop-blur-[6px] sm:items-center sm:p-8" onClick={handleOverlayClick}>
            <div
                className="flex max-h-[min(92vh,960px)] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-secondary bg-primary shadow-xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="shrink-0 grid gap-6 p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-primary">{title}</h2>
                            <p className="mt-2 text-md text-tertiary">{description}</p>
                        </div>
                    </div>
                </div>

                <div className={cx("scrollbar-ui flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-5 sm:px-6 sm:pb-6", contentClassName)}>{children}</div>
            </div>
        </div>
    );
};

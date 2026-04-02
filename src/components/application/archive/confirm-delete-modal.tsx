import { Button } from "@/components/base/buttons/button";
import type { ArchiveEntry } from "@/types/api";
import { ArchiveModalShell } from "./archive-modal-shell";

interface ConfirmDeleteModalProps {
    entry: ArchiveEntry;
    isLoading: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const ConfirmDeleteModal = ({ entry, isLoading, onClose, onConfirm }: ConfirmDeleteModalProps) => {
    return (
        <ArchiveModalShell
            title="Delete entry"
            description={`"${entry.title}" will be removed from the archive. This action cannot be undone.`}
            onClose={onClose}
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
                <Button color="secondary" size="lg" className="w-full sm:w-auto" onClick={onClose}>
                    Cancel
                </Button>
                <Button color="primary-destructive" size="lg" className="w-full sm:w-auto" isLoading={isLoading} onClick={onConfirm}>
                    Delete
                </Button>
            </div>
        </ArchiveModalShell>
    );
};

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
            title="Kaydı sil"
            description={`"${entry.title}" arşivden kaldırılacak. Bu işlem geri alınamaz.`}
            onClose={onClose}
        >
            <div className="flex flex-wrap justify-end gap-3">
                <Button color="secondary" size="lg" onClick={onClose}>
                    İptal
                </Button>
                <Button color="primary-destructive" size="lg" isLoading={isLoading} onClick={onConfirm}>
                    Sil
                </Button>
            </div>
        </ArchiveModalShell>
    );
};

import { Button } from "@/components/base/buttons/button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { DatePicker } from "@/components/application/date-picker/date-picker";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import type { DateValue } from "react-aria-components";
import type { ArchiveEntry } from "@/types/api";
import { ArchiveModalShell } from "./archive-modal-shell";

interface EditFormState {
    watchedAt: DateValue | null;
    isWatchedDateUnknown: boolean;
    notes: string;
    personalRating: string;
}

interface EditEntryModalProps {
    entry: ArchiveEntry;
    error: string | null;
    fieldErrors?: Partial<Record<"personalRating" | "watchedAt", string>>;
    form: EditFormState;
    isLoading: boolean;
    onClose: () => void;
    onFormChange: (field: keyof EditFormState, value: string | DateValue | null) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    onWatchedDateUnknownChange: (isSelected: boolean) => void;
}

export const EditEntryModal = ({ entry, error, fieldErrors, form, isLoading, onClose, onFormChange, onSubmit, onWatchedDateUnknownChange }: EditEntryModalProps) => {
    return (
        <ArchiveModalShell title={entry.title} description="Update the watched date, note, and rating." onClose={onClose}>
            <form className="grid gap-5" onSubmit={onSubmit}>
                <Checkbox label="I don't remember the date" isSelected={form.isWatchedDateUnknown} onChange={onWatchedDateUnknownChange} />

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-1.5">
                        <span className="text-sm font-medium text-secondary">Watched date</span>
                        <DatePicker
                            value={form.watchedAt}
                            isDisabled={form.isWatchedDateUnknown}
                            onChange={(value) => onFormChange("watchedAt", value)}
                        />
                        {fieldErrors?.watchedAt ? <span className="text-sm text-error-primary">{fieldErrors.watchedAt}</span> : null}
                    </div>
                    <Input
                        label="Personal rating"
                        type="number"
                        value={form.personalRating}
                        onChange={(value) => onFormChange("personalRating", value)}
                        isInvalid={Boolean(fieldErrors?.personalRating)}
                        hint={fieldErrors?.personalRating}
                    />
                </div>

                <TextArea label="Note" rows={5} value={form.notes} onChange={(value) => onFormChange("notes", value)} />

                {error && <div className="rounded-xl border border-error_subtle bg-error-primary px-4 py-3 text-sm text-error-primary">{error}</div>}

                <div className="flex flex-wrap gap-3">
                    <Button size="lg" type="submit" isLoading={isLoading}>
                        Save
                    </Button>
                    <Button color="secondary" size="lg" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </form>
        </ArchiveModalShell>
    );
};

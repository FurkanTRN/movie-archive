import { ButtonGroup, ButtonGroupItem } from "@/components/base/button-group/button-group";
import type { ArchiveEntry } from "@/types/api";
import { formatDate, formatRuntime } from "./archive-utils";

interface ArchiveCardProps {
    entry: ArchiveEntry;
    onDelete: (entryId: number) => void;
    onOpenDetail: (entry: ArchiveEntry) => void;
    onEdit: (entry: ArchiveEntry) => void;
}

export const ArchiveCard = ({ entry, onDelete, onEdit, onOpenDetail }: ArchiveCardProps) => {
    return (
        <article className="overflow-hidden rounded-[28px] border border-secondary bg-primary shadow-xs">
            <div className="h-40 bg-secondary">
                {entry.backdropUrl ? (
                    <img src={entry.backdropUrl} alt={entry.title} className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(47,116,255,0.18),transparent_40%),linear-gradient(135deg,rgba(17,24,39,0.06),transparent)] text-sm font-semibold text-tertiary">
                        Görsel yok
                    </div>
                )}
            </div>

            <div className="grid gap-5 p-5">
                <div className="flex gap-4">
                    <div className="h-28 w-20 shrink-0 overflow-hidden rounded-2xl bg-secondary">
                        {entry.posterUrl ? (
                            <img src={entry.posterUrl} alt={entry.title} className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full items-center justify-center text-xs text-tertiary">Poster yok</div>
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <button
                                    type="button"
                                    className="line-clamp-2 cursor-pointer text-left text-xl font-semibold text-primary transition duration-100 ease-linear hover:text-brand-secondary"
                                    onClick={() => onOpenDetail(entry)}
                                >
                                    {entry.title}
                                </button>
                                <p className="mt-1 text-sm text-tertiary">
                                    {entry.releaseYear ?? "Yıl yok"} • {formatRuntime(entry.runtimeMinutes)}
                                </p>
                            </div>
                            {entry.personalRating ? (
                                <div className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-primary">{entry.personalRating}/10</div>
                            ) : null}
                        </div>

                        {entry.genres.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {entry.genres.slice(0, 3).map((genre) => (
                                    <span key={genre} className="rounded-full border border-secondary bg-secondary px-2.5 py-1 text-xs font-medium text-secondary">
                                        {genre}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid gap-3">
                    <div className="grid gap-1 text-sm">
                        <span className="font-medium text-secondary">İzleme tarihi</span>
                        <span className="text-tertiary">{formatDate(entry.watchedAt)}</span>
                    </div>
                </div>

                <div className="flex items-center justify-end">
                    <ButtonGroup
                        size="md"
                        selectionMode="multiple"
                        selectedKeys={[]}
                        onSelectionChange={() => undefined}
                    >
                        <ButtonGroupItem id={`edit-${entry.id}`} onClick={() => onEdit(entry)}>
                            Düzenle
                        </ButtonGroupItem>
                        {entry.imdbUrl ? (
                            <ButtonGroupItem id={`imdb-${entry.id}`} onClick={() => window.open(entry.imdbUrl ?? "", "_blank", "noopener,noreferrer")}>
                                IMDb
                            </ButtonGroupItem>
                        ) : null}
                        <ButtonGroupItem id={`delete-${entry.id}`} className="text-error-primary" onClick={() => onDelete(entry.id)}>
                            Sil
                        </ButtonGroupItem>
                    </ButtonGroup>
                </div>
            </div>
        </article>
    );
};

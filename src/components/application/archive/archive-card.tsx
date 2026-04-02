import { Button } from "@/components/base/buttons/button";
import { ButtonGroup, ButtonGroupItem } from "@/components/base/button-group/button-group";
import type { ArchiveEntry } from "@/types/api";
import { formatDate, formatRuntime } from "./archive-utils";

interface ArchiveCardProps {
    entry: ArchiveEntry;
    onDelete: (entryId: number) => void;
    onOpenDetail: (entry: ArchiveEntry) => void;
    onOpenImagePreview: (entry: ArchiveEntry, imageKind: "backdrop" | "poster") => void;
    onEdit: (entry: ArchiveEntry) => void;
}

export const ArchiveCard = ({ entry, onDelete, onEdit, onOpenDetail, onOpenImagePreview }: ArchiveCardProps) => {
    return (
        <article className="overflow-hidden rounded-[28px] border border-secondary bg-primary shadow-xs">
            <div className="h-36 bg-secondary sm:h-40">
                {entry.backdropUrl ? (
                    <button
                        type="button"
                        className="group relative h-full w-full cursor-pointer overflow-hidden outline-focus-ring transition duration-100 ease-linear focus-visible:outline-2 focus-visible:outline-offset-0"
                        aria-label="Open backdrop preview"
                        onClick={() => onOpenImagePreview(entry, "backdrop")}
                    >
                        <img src={entry.backdropUrl} alt={entry.title} className="h-full w-full object-cover transition duration-100 ease-linear group-hover:scale-[1.02]" />
                        <div className="absolute inset-0 bg-alpha-black/0 transition duration-100 ease-linear group-hover:bg-alpha-black/10" />
                    </button>
                ) : (
                    <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(47,116,255,0.18),transparent_40%),linear-gradient(135deg,rgba(17,24,39,0.06),transparent)] text-sm font-semibold text-tertiary">
                        No image
                    </div>
                )}
            </div>

            <div className="grid gap-4 p-4 sm:gap-5 sm:p-5">
                <div className="flex items-start gap-3 sm:gap-4">
                    <div className="h-24 w-[4.25rem] shrink-0 overflow-hidden rounded-2xl bg-secondary sm:h-28 sm:w-20">
                        {entry.posterUrl ? (
                            <button
                                type="button"
                                className="group h-full w-full cursor-pointer overflow-hidden outline-focus-ring transition duration-100 ease-linear focus-visible:outline-2 focus-visible:outline-offset-0"
                                aria-label="Open poster preview"
                                onClick={() => onOpenImagePreview(entry, "poster")}
                            >
                                <img
                                    src={entry.posterUrl}
                                    alt={entry.title}
                                    className="h-full w-full object-cover transition duration-100 ease-linear group-hover:scale-[1.02]"
                                />
                            </button>
                        ) : (
                            <div className="flex h-full items-center justify-center text-xs text-tertiary">No poster</div>
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <button
                                    type="button"
                                    className="line-clamp-2 cursor-pointer text-left text-lg font-semibold text-primary transition duration-100 ease-linear hover:text-brand-secondary sm:text-xl"
                                    onClick={() => onOpenDetail(entry)}
                                >
                                    {entry.title}
                                </button>
                                <p className="mt-1 text-xs text-tertiary sm:text-sm">
                                    {entry.releaseYear ?? "No year"} • {formatRuntime(entry.runtimeMinutes)}
                                </p>
                            </div>
                            {entry.personalRating ? (
                                <div className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-primary sm:px-3 sm:text-sm">{entry.personalRating}/10</div>
                            ) : null}
                        </div>

                        {entry.genres.length > 0 && (
                            <div className="mt-2.5 flex flex-wrap gap-2 sm:mt-3">
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
                        <span className="font-medium text-secondary">Watched date</span>
                        <span className="text-tertiary">{formatDate(entry.watchedAt)}</span>
                    </div>
                </div>

                <div className="grid gap-2 sm:hidden">
                    <div className={`grid gap-2 ${entry.imdbUrl ? "grid-cols-3" : "grid-cols-2"}`}>
                        <Button color="secondary" size="md" className="w-full" onClick={() => onEdit(entry)}>
                            Edit
                        </Button>
                        {entry.imdbUrl ? (
                            <Button color="secondary" size="md" className="w-full" onClick={() => window.open(entry.imdbUrl ?? "", "_blank", "noopener,noreferrer")}>
                                IMDb
                            </Button>
                        ) : null}
                        <Button color="secondary-destructive" size="md" className="w-full" onClick={() => onDelete(entry.id)}>
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="hidden items-center justify-end sm:flex">
                    <ButtonGroup size="md" selectionMode="multiple" selectedKeys={[]} onSelectionChange={() => undefined}>
                        <ButtonGroupItem id={`edit-${entry.id}`} onClick={() => onEdit(entry)}>
                            Edit
                        </ButtonGroupItem>
                        {entry.imdbUrl ? (
                            <ButtonGroupItem id={`imdb-${entry.id}`} onClick={() => window.open(entry.imdbUrl ?? "", "_blank", "noopener,noreferrer")}>
                                IMDb
                            </ButtonGroupItem>
                        ) : null}
                        <ButtonGroupItem id={`delete-${entry.id}`} className="text-error-primary" onClick={() => onDelete(entry.id)}>
                            Delete
                        </ButtonGroupItem>
                    </ButtonGroup>
                </div>
            </div>
        </article>
    );
};

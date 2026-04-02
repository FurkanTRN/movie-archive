import { Button } from "@/components/base/buttons/button";
import type { ArchiveEntry, MovieDetail } from "@/types/api";
import { ArchiveModalShell } from "./archive-modal-shell";
import { formatDate, formatRuntime } from "./archive-utils";
import { LeadCastList } from "./lead-cast-list";

interface MovieDetailModalProps {
    archiveEntry: ArchiveEntry;
    detail: MovieDetail | null;
    error: string | null;
    isLoading: boolean;
    onClose: () => void;
}

export const MovieDetailModal = ({ archiveEntry, detail, error, isLoading, onClose }: MovieDetailModalProps) => {
    const movie = detail ?? archiveEntry;
    const voteAverage = detail?.voteAverage ?? null;
    const releaseDate = detail?.releaseDate ?? null;

    return (
        <ArchiveModalShell title={archiveEntry.title} description="Movie details and your archive notes." onClose={onClose}>
            {isLoading ? (
                <div className="py-20 text-center text-sm text-tertiary">Loading movie details...</div>
            ) : error ? (
                <div className="rounded-xl border border-error_subtle bg-error-primary px-4 py-3 text-sm text-error-primary">{error}</div>
            ) : (
                <div className="grid gap-6">
                    <div className="rounded-3xl border border-secondary bg-secondary p-4 sm:p-5">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                            <div className="h-28 w-20 shrink-0 overflow-hidden rounded-2xl bg-primary sm:h-32 sm:w-24">
                                {movie.posterUrl ? (
                                    <img src={movie.posterUrl} alt={movie.title} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-xs text-tertiary">No poster</div>
                                )}
                            </div>

                            <div className="grid min-w-0 gap-3">
                                <div className="flex flex-wrap items-start gap-3">
                                    <h3 className="text-2xl font-semibold text-primary sm:text-3xl">{movie.title}</h3>
                                    {voteAverage ? (
                                        <div className="rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary">TMDb rating {voteAverage}</div>
                                    ) : null}
                                </div>
                                <p className="text-md text-tertiary">
                                    {archiveEntry.originalTitle !== archiveEntry.title ? archiveEntry.originalTitle : "No original title"}
                                </p>
                                <p className="text-sm text-tertiary">
                                    {(releaseDate ?? archiveEntry.watchedAt) ? formatDate(releaseDate ?? archiveEntry.watchedAt) : "No date"} •{" "}
                                    {formatRuntime(movie.runtimeMinutes ?? archiveEntry.runtimeMinutes)}
                                </p>

                                {movie.genres.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {movie.genres.map((genre) => (
                                            <span key={genre} className="rounded-full border border-secondary bg-primary px-2.5 py-1 text-xs font-medium text-secondary">
                                                {genre}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <h4 className="text-sm font-semibold text-secondary">Overview</h4>
                        <p className="text-md leading-7 text-tertiary">{movie.overview || "No description is available for this movie."}</p>
                    </div>

                    <div className="grid gap-2">
                        <h4 className="text-sm font-semibold text-secondary">Lead cast</h4>
                        <LeadCastList cast={detail?.leadCast ?? []} />
                    </div>

                    <div className="grid gap-4 rounded-3xl border border-secondary bg-secondary px-4 py-4 sm:grid-cols-2">
                        <div>
                            <p className="text-sm font-semibold text-secondary">Watched date</p>
                            <p className="mt-1 text-sm text-tertiary">{formatDate(archiveEntry.watchedAt)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-secondary">Personal rating</p>
                            <p className="mt-1 text-sm text-tertiary">{archiveEntry.personalRating ? `${archiveEntry.personalRating}/10` : "No rating yet"}</p>
                        </div>
                    </div>

                    <div className="grid gap-2 rounded-3xl border border-secondary bg-secondary px-4 py-4">
                        <h4 className="text-sm font-semibold text-secondary">Note</h4>
                        <p className="text-md leading-7 text-tertiary">{archiveEntry.notes || "No note added yet."}</p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                        {archiveEntry.imdbUrl ? (
                            <Button color="secondary" className="w-full sm:w-auto" href={archiveEntry.imdbUrl} target="_blank" rel="noreferrer">
                                Open on IMDb
                            </Button>
                        ) : null}
                        <Button color="secondary" className="w-full sm:w-auto" href={archiveEntry.tmdbUrl} target="_blank" rel="noreferrer">
                            Open on TMDb
                        </Button>
                    </div>
                </div>
            )}
        </ArchiveModalShell>
    );
};

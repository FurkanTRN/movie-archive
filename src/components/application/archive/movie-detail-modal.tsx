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
        <ArchiveModalShell title={archiveEntry.title} description="Film hakkında detaylar ve arşiv notların." onClose={onClose}>
            {isLoading ? (
                <div className="py-20 text-center text-sm text-tertiary">Film detayları yükleniyor...</div>
            ) : error ? (
                <div className="rounded-xl border border-error_subtle bg-error-primary px-4 py-3 text-sm text-error-primary">{error}</div>
            ) : (
                <div className="grid gap-6">
                    <div className="rounded-3xl border border-secondary bg-secondary p-4 sm:p-5">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                            <div className="h-32 w-24 shrink-0 overflow-hidden rounded-2xl bg-primary">
                                {movie.posterUrl ? (
                                    <img src={movie.posterUrl} alt={movie.title} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-xs text-tertiary">Poster yok</div>
                                )}
                            </div>

                            <div className="grid min-w-0 gap-3">
                                <div className="flex flex-wrap items-start gap-3">
                                    <h3 className="text-3xl font-semibold text-primary">{movie.title}</h3>
                                    {voteAverage ? (
                                        <div className="rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary">TMDb puanı {voteAverage}</div>
                                    ) : null}
                                </div>
                                <p className="text-md text-tertiary">
                                    {archiveEntry.originalTitle !== archiveEntry.title ? archiveEntry.originalTitle : "Orijinal başlık yok"}
                                </p>
                                <p className="text-sm text-tertiary">
                                    {(releaseDate ?? archiveEntry.watchedAt) ? formatDate(releaseDate ?? archiveEntry.watchedAt) : "Tarih yok"} •{" "}
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
                        <h4 className="text-sm font-semibold text-secondary">Konu</h4>
                        <p className="text-md leading-7 text-tertiary">{movie.overview || "Bu film için açıklama bulunmuyor."}</p>
                    </div>

                    <div className="grid gap-2">
                        <h4 className="text-sm font-semibold text-secondary">Başrol oyuncuları</h4>
                        <LeadCastList cast={detail?.leadCast ?? []} />
                    </div>

                    <div className="grid gap-4 rounded-3xl border border-secondary bg-secondary px-4 py-4 sm:grid-cols-2">
                        <div>
                            <p className="text-sm font-semibold text-secondary">İzleme tarihi</p>
                            <p className="mt-1 text-sm text-tertiary">{formatDate(archiveEntry.watchedAt)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-secondary">Kişisel puan</p>
                            <p className="mt-1 text-sm text-tertiary">{archiveEntry.personalRating ? `${archiveEntry.personalRating}/10` : "Henüz puan yok"}</p>
                        </div>
                    </div>

                    <div className="grid gap-2 rounded-3xl border border-secondary bg-secondary px-4 py-4">
                        <h4 className="text-sm font-semibold text-secondary">Not</h4>
                        <p className="text-md leading-7 text-tertiary">{archiveEntry.notes || "Henüz not eklenmedi."}</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {archiveEntry.imdbUrl ? (
                            <Button color="secondary" href={archiveEntry.imdbUrl} target="_blank" rel="noreferrer">
                                IMDb’de aç
                            </Button>
                        ) : null}
                        <Button color="secondary" href={archiveEntry.tmdbUrl} target="_blank" rel="noreferrer">
                            TMDb’de aç
                        </Button>
                    </div>
                </div>
            )}
        </ArchiveModalShell>
    );
};

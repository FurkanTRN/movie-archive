import { Button } from "@/components/base/buttons/button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { DatePicker } from "@/components/application/date-picker/date-picker";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import type { DateValue } from "react-aria-components";
import type { MovieDetail, MovieSearchResult } from "@/types/api";
import { ArchiveModalShell } from "./archive-modal-shell";
import { formatRuntime } from "./archive-utils";
import { LeadCastList } from "./lead-cast-list";

interface ArchiveFormState {
    watchedAt: DateValue | null;
    isWatchedDateUnknown: boolean;
    notes: string;
    personalRating: string;
}

interface AddMovieModalProps {
    fieldErrors?: Partial<Record<"personalRating" | "watchedAt", string>>;
    form: ArchiveFormState;
    isLoading: boolean;
    isMovieDetailLoading: boolean;
    isMovieSearchLoading: boolean;
    movieDetailError: string | null;
    movieQuery: string;
    movieResults: MovieSearchResult[];
    movieSearchError: string | null;
    onClose: () => void;
    onFormChange: (field: keyof ArchiveFormState, value: string | DateValue | null) => void;
    onMovieQueryChange: (value: string) => void;
    onSelectMovie: (tmdbId: number) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    onWatchedDateUnknownChange: (isSelected: boolean) => void;
    selectedMovie: MovieDetail | null;
}

export const AddMovieModal = ({
    fieldErrors,
    form,
    isLoading,
    isMovieDetailLoading,
    isMovieSearchLoading,
    movieDetailError,
    movieQuery,
    movieResults,
    movieSearchError,
    onClose,
    onFormChange,
    onMovieQueryChange,
    onSelectMovie,
    onSubmit,
    onWatchedDateUnknownChange,
    selectedMovie,
}: AddMovieModalProps) => {
    return (
        <ArchiveModalShell
            title="Film ekle"
            description="TMDb üzerinden arat, filmi seç ve arşivine kaydet."
            contentClassName="lg:h-full lg:overflow-hidden"
            onClose={onClose}
        >
            <div className="grid gap-6 lg:h-full lg:min-h-0 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch">
                <div className="grid gap-4 lg:h-full lg:min-h-0 lg:grid-rows-[auto_minmax(0,1fr)]">
                    <Input label="Film ara" placeholder="Inception, Dune, Parasite..." value={movieQuery} onChange={onMovieQueryChange} />

                    <div className="scrollbar-ui rounded-2xl border border-secondary bg-secondary p-3 lg:h-full lg:min-h-0 lg:overflow-y-auto">
                        {isMovieSearchLoading ? (
                            <div className="px-3 py-6 text-sm text-tertiary">Aranıyor...</div>
                        ) : movieSearchError ? (
                            <div className="px-3 py-6 text-sm text-error-primary">{movieSearchError}</div>
                        ) : movieResults.length === 0 ? (
                            <div className="px-3 py-6 text-sm text-tertiary">En az 2 karakter yazıp arama başlat.</div>
                        ) : (
                            <div className="grid gap-3">
                                {movieResults.map((movie) => (
                                    <button
                                        key={movie.tmdbId}
                                        type="button"
                                        className="flex w-full items-center gap-3 rounded-2xl border border-transparent bg-primary px-3 py-3 text-left transition duration-100 ease-linear hover:border-secondary"
                                        onClick={() => onSelectMovie(movie.tmdbId)}
                                    >
                                        <div className="h-20 w-14 shrink-0 overflow-hidden rounded-xl bg-secondary">
                                            {movie.posterUrl ? (
                                                <img src={movie.posterUrl} alt={movie.title} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-[10px] text-tertiary">Poster yok</div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-primary">{movie.title}</p>
                                                    <p className="text-xs text-tertiary">{movie.releaseYear ?? "Yıl yok"}</p>
                                                </div>
                                                {movie.voteAverage ? (
                                                    <span className="rounded-full bg-secondary px-2 py-1 text-[11px] font-semibold text-primary">{movie.voteAverage}</span>
                                                ) : null}
                                            </div>
                                            <p className="mt-2 line-clamp-2 text-xs text-tertiary">{movie.overview || "Özet yok."}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="scrollbar-ui rounded-3xl border border-secondary bg-secondary p-4 sm:p-5 lg:h-full lg:min-h-0 lg:overflow-y-auto">
                    {isMovieDetailLoading ? (
                        <div className="py-20 text-center text-sm text-tertiary">Film detayı yükleniyor...</div>
                    ) : !selectedMovie ? (
                        <div className="py-20 text-center text-sm text-tertiary">Sağ tarafta form açmak için soldan bir film seç.</div>
                    ) : (
                        <form className="grid gap-5" onSubmit={onSubmit}>
                            <div className="flex gap-4">
                                <div className="h-36 w-24 shrink-0 overflow-hidden rounded-2xl bg-primary">
                                    {selectedMovie.posterUrl ? (
                                        <img src={selectedMovie.posterUrl} alt={selectedMovie.title} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-xs text-tertiary">Poster yok</div>
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <h3 className="text-xl font-semibold text-primary">{selectedMovie.title}</h3>
                                    <p className="mt-1 text-sm text-tertiary">
                                        {selectedMovie.releaseYear ?? "Yıl yok"} • {formatRuntime(selectedMovie.runtimeMinutes)}
                                    </p>
                                    {selectedMovie.genres.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {selectedMovie.genres.map((genre) => (
                                                <span key={genre} className="rounded-full border border-secondary bg-primary px-2.5 py-1 text-xs font-medium text-secondary">
                                                    {genre}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <p className="text-sm text-tertiary">{selectedMovie.overview || "Bu film için özet yok."}</p>

                            <div className="grid gap-2">
                                <span className="text-sm font-medium text-secondary">Başrol oyuncuları</span>
                                <LeadCastList cast={selectedMovie.leadCast} />
                            </div>

                            <div className="grid gap-4">
                                <Checkbox
                                    label="Tarihi hatırlamıyorum"
                                    isSelected={form.isWatchedDateUnknown}
                                    onChange={onWatchedDateUnknownChange}
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {/* <Input
                                    label="İzleme tarihi"
                                    isDisabled={form.isWatchedDateUnknown}
                                    wrapperClassName="hidden"
                                /> */}
                                <div className="grid gap-1.5">
                                    <span className="text-sm font-medium text-secondary">İzleme tarihi</span>
                                    <DatePicker
                                        value={form.watchedAt}
                                        isDisabled={form.isWatchedDateUnknown}
                                        onChange={(value) => onFormChange("watchedAt", value)}
                                    />
                                    {fieldErrors?.watchedAt ? <span className="text-sm text-error-primary">{fieldErrors.watchedAt}</span> : null}
                                </div>
                                <Input
                                    label="Kişisel puan"
                                    type="number"
                                    placeholder="8"
                                    value={form.personalRating}
                                    onChange={(value) => onFormChange("personalRating", value)}
                                    isInvalid={Boolean(fieldErrors?.personalRating)}
                                    hint={fieldErrors?.personalRating}
                                />
                            </div>

                            <TextArea
                                label="Not"
                                rows={5}
                                placeholder="Bu film sende nasıl bir iz bıraktı?"
                                value={form.notes}
                                onChange={(value) => onFormChange("notes", value)}
                            />

                            {movieDetailError && (
                                <div className="rounded-xl border border-error_subtle bg-error-primary px-4 py-3 text-sm text-error-primary">{movieDetailError}</div>
                            )}

                            <div className="flex flex-wrap items-center gap-3">
                                <Button size="lg" type="submit" isLoading={isLoading}>
                                    Arşive kaydet
                                </Button>
                                {selectedMovie.imdbUrl ? (
                                    <Button color="link-color" href={selectedMovie.imdbUrl} target="_blank" rel="noreferrer">
                                        IMDb sayfası
                                    </Button>
                                ) : null}
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </ArchiveModalShell>
    );
};

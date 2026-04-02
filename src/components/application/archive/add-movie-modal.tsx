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
            title="Add movie"
            description="Search TMDb, select a movie, and save it to your archive."
            contentClassName="pt-0 lg:h-full lg:overflow-hidden"
            onClose={onClose}
        >
            <div className="grid gap-4 lg:h-full lg:min-h-0 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch lg:gap-6">
                <div className="grid gap-3 lg:h-full lg:min-h-0 lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-4">
                    <Input label="Search movies" placeholder="Inception, Dune, Parasite..." value={movieQuery} onChange={onMovieQueryChange} />

                    <div className="scrollbar-ui max-h-[34vh] rounded-2xl border border-secondary bg-secondary p-3 overflow-y-auto lg:h-full lg:max-h-none lg:min-h-0">
                        {isMovieSearchLoading ? (
                            <div className="px-3 py-6 text-sm text-tertiary">Searching...</div>
                        ) : movieSearchError ? (
                            <div className="px-3 py-6 text-sm text-error-primary">{movieSearchError}</div>
                        ) : movieResults.length === 0 ? (
                            <div className="px-3 py-6 text-sm text-tertiary">Type at least 2 characters to start searching.</div>
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
                                                <div className="flex h-full items-center justify-center text-[10px] text-tertiary">No poster</div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-primary">{movie.title}</p>
                                                    <p className="text-xs text-tertiary">{movie.releaseYear ?? "No year"}</p>
                                                </div>
                                                {movie.voteAverage ? (
                                                    <span className="rounded-full bg-secondary px-2 py-1 text-[11px] font-semibold text-primary">{movie.voteAverage}</span>
                                                ) : null}
                                            </div>
                                            <p className="mt-2 line-clamp-2 text-xs text-tertiary">{movie.overview || "No overview available."}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="scrollbar-ui rounded-3xl border border-secondary bg-secondary p-4 sm:p-5 lg:h-full lg:min-h-0 lg:overflow-y-auto">
                    {isMovieDetailLoading ? (
                        <div className="py-20 text-center text-sm text-tertiary">Loading movie details...</div>
                    ) : !selectedMovie ? (
                        <div className="py-20 text-center text-sm text-tertiary">Select a movie on the left to open the form.</div>
                    ) : (
                        <form className="grid gap-5" onSubmit={onSubmit}>
                            <div className="flex items-start gap-3 sm:gap-4">
                                <div className="h-32 w-[5.5rem] shrink-0 overflow-hidden rounded-2xl bg-primary sm:h-36 sm:w-24">
                                    {selectedMovie.posterUrl ? (
                                        <img src={selectedMovie.posterUrl} alt={selectedMovie.title} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-xs text-tertiary">No poster</div>
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <h3 className="text-lg font-semibold text-primary sm:text-xl">{selectedMovie.title}</h3>
                                    <p className="mt-1 text-xs text-tertiary sm:text-sm">
                                        {selectedMovie.releaseYear ?? "No year"} • {formatRuntime(selectedMovie.runtimeMinutes)}
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

                            <p className="text-sm text-tertiary">{selectedMovie.overview || "No overview is available for this movie."}</p>

                            <div className="grid gap-2">
                                <span className="text-sm font-medium text-secondary">Lead cast</span>
                                <LeadCastList cast={selectedMovie.leadCast} />
                            </div>

                            <div className="grid gap-4">
                                <Checkbox
                                    label="I don't remember the date"
                                    isSelected={form.isWatchedDateUnknown}
                                    onChange={onWatchedDateUnknownChange}
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {/* <Input
                                    label="Watched date"
                                    isDisabled={form.isWatchedDateUnknown}
                                    wrapperClassName="hidden"
                                /> */}
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
                                    placeholder="8"
                                    value={form.personalRating}
                                    onChange={(value) => onFormChange("personalRating", value)}
                                    isInvalid={Boolean(fieldErrors?.personalRating)}
                                    hint={fieldErrors?.personalRating}
                                />
                            </div>

                            <TextArea
                                label="Note"
                                rows={5}
                                placeholder="What kind of impression did this movie leave on you?"
                                value={form.notes}
                                onChange={(value) => onFormChange("notes", value)}
                            />

                            {movieDetailError && (
                                <div className="rounded-xl border border-error_subtle bg-error-primary px-4 py-3 text-sm text-error-primary">{movieDetailError}</div>
                            )}

                            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                                <Button size="lg" className="w-full sm:w-auto" type="submit" isLoading={isLoading}>
                                    Save to archive
                                </Button>
                                {selectedMovie.imdbUrl ? (
                                    <Button color="link-color" className="justify-start sm:justify-normal" href={selectedMovie.imdbUrl} target="_blank" rel="noreferrer">
                                        IMDb page
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

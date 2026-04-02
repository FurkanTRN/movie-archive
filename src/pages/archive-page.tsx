import { lazy, Suspense, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { ArchiveCard } from "@/components/application/archive/archive-card";
import { ArchiveHeader } from "@/components/application/archive/archive-header";
import { buildUniqueValues, toDatePickerValue } from "@/components/application/archive/archive-utils";
import { PaginationPageDefault } from "@/components/application/pagination/pagination";
import { Button } from "@/components/base/buttons/button";
import { useAuth } from "@/providers/auth-provider";
import type { ArchiveEntry, ArchivePagination, MovieDetail, MovieSearchResult } from "@/types/api";
import { ApiError, apiRequest } from "@/utils/api-client";
import { archiveFormSchema } from "@/validation/forms";
import type { DateValue } from "react-aria-components";
import { z } from "zod";

interface ArchiveResponse {
    entries: ArchiveEntry[];
    filters: {
        genres: string[];
        years: number[];
    };
    pagination: ArchivePagination;
}

interface MovieSearchResponse {
    results: MovieSearchResult[];
}

interface MovieDetailResponse {
    movie: MovieDetail;
}

interface ArchiveMutationResponse {
    entry: ArchiveEntry;
}

type SortOption = "rating" | "recent" | "releaseYearDesc" | "title" | "watchedAt";

interface FormState {
    isWatchedDateUnknown: boolean;
    notes: string;
    personalRating: string;
    watchedAt: DateValue | null;
}

const sortOptions = [
    { label: "Recently updated", value: "recent" },
    { label: "Title", value: "title" },
    { label: "Release year (Newest to oldest)", value: "releaseYearDesc" },
    { label: "Personal rating", value: "rating" },
    { label: "Watched date", value: "watchedAt" },
];

const ratingFilterOptions = [{ label: "All ratings", value: "all" }, ...Array.from({ length: 10 }, (_, index) => ({ label: `${index + 1}+`, value: String(index + 1) }))];

const initialFormState: FormState = {
    isWatchedDateUnknown: false,
    notes: "",
    personalRating: "",
    watchedAt: null,
};

const defaultPagination: ArchivePagination = {
    hasNextPage: false,
    hasPreviousPage: false,
    limit: 12,
    page: 1,
    totalItems: 0,
    totalPages: 0,
};

const pageSize = 12;
const LazyAddMovieModal = lazy(async () => {
    const module = await import("@/components/application/archive/add-movie-modal");
    return { default: module.AddMovieModal };
});
const LazyEditEntryModal = lazy(async () => {
    const module = await import("@/components/application/archive/edit-entry-modal");
    return { default: module.EditEntryModal };
});
const LazyConfirmDeleteModal = lazy(async () => {
    const module = await import("@/components/application/archive/confirm-delete-modal");
    return { default: module.ConfirmDeleteModal };
});
const LazyMovieDetailModal = lazy(async () => {
    const module = await import("@/components/application/archive/movie-detail-modal");
    return { default: module.MovieDetailModal };
});
const LazyImagePreviewModal = lazy(async () => {
    const module = await import("@/components/application/archive/image-preview-modal");
    return { default: module.ImagePreviewModal };
});

type ArchivePreviewImageKind = "backdrop" | "poster";

interface ArchiveImagePreviewState {
    entry: ArchiveEntry;
    imageKind: ArchivePreviewImageKind;
    imageUrl: string;
}

const modalFallback = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/40 px-4">
        <div className="rounded-2xl border border-secondary bg-primary px-4 py-3 text-sm text-tertiary shadow-xs">Loading...</div>
    </div>
);

export const ArchivePage = () => {
    const { isPending: authPending, logout, user } = useAuth();
    const [archiveEntries, setArchiveEntries] = useState<ArchiveEntry[]>([]);
    const [archivePagination, setArchivePagination] = useState<ArchivePagination>(defaultPagination);
    const [archiveQuery, setArchiveQuery] = useState("");
    const [sort, setSort] = useState<SortOption>("recent");
    const [genreFilter, setGenreFilter] = useState("all");
    const [availableGenres, setAvailableGenres] = useState<string[]>([]);
    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const [yearFilter, setYearFilter] = useState("all");
    const [ratingFilter, setRatingFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [archiveError, setArchiveError] = useState<string | null>(null);
    const [archiveLoading, setArchiveLoading] = useState(true);
    const [addMovieOpen, setAddMovieOpen] = useState(false);
    const [movieQuery, setMovieQuery] = useState("");
    const deferredMovieQuery = useDeferredValue(movieQuery);
    const [movieResults, setMovieResults] = useState<MovieSearchResult[]>([]);
    const [movieSearchLoading, setMovieSearchLoading] = useState(false);
    const [movieSearchError, setMovieSearchError] = useState<string | null>(null);
    const [selectedMovie, setSelectedMovie] = useState<MovieDetail | null>(null);
    const [movieDetailLoading, setMovieDetailLoading] = useState(false);
    const [movieDetailError, setMovieDetailError] = useState<string | null>(null);
    const [createForm, setCreateForm] = useState<FormState>(initialFormState);
    const [saveLoading, setSaveLoading] = useState(false);
    const [createFieldErrors, setCreateFieldErrors] = useState<Partial<Record<"personalRating" | "watchedAt", string>>>({});
    const [editEntry, setEditEntry] = useState<ArchiveEntry | null>(null);
    const [editForm, setEditForm] = useState<FormState>(initialFormState);
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);
    const [editFieldErrors, setEditFieldErrors] = useState<Partial<Record<"personalRating" | "watchedAt", string>>>({});
    const [pendingDeleteEntry, setPendingDeleteEntry] = useState<ArchiveEntry | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [selectedDetailEntry, setSelectedDetailEntry] = useState<ArchiveEntry | null>(null);
    const [detailMovie, setDetailMovie] = useState<MovieDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<ArchiveImagePreviewState | null>(null);
    const movieDetailCacheRef = useRef(new Map<number, MovieDetail>());
    const movieSearchAbortRef = useRef<AbortController | null>(null);

    const loadArchive = async (targetPage = page) => {
        setArchiveLoading(true);
        setArchiveError(null);

        try {
            const params = new URLSearchParams();

            if (archiveQuery.trim()) {
                params.set("q", archiveQuery.trim());
            }

            if (genreFilter !== "all") {
                params.set("genre", genreFilter);
            }

            if (yearFilter !== "all") {
                params.set("year", yearFilter);
            }

            if (ratingFilter !== "all") {
                params.set("minRating", ratingFilter);
            }

            params.set("limit", String(pageSize));
            params.set("page", String(targetPage));
            params.set("sort", sort);

            const response = await apiRequest<ArchiveResponse>(`/api/archive?${params.toString()}`);
            setArchiveEntries(response.entries);
            setArchivePagination(response.pagination);
            setAvailableGenres(response.filters.genres);
            setAvailableYears(response.filters.years);

            if (response.pagination.page !== targetPage) {
                setPage(response.pagination.page);
            }
        } catch (error) {
            setArchiveError(error instanceof ApiError ? error.message : "Failed to load archive");
        } finally {
            setArchiveLoading(false);
        }
    };

    useEffect(() => {
        void loadArchive(page);
    }, [archiveQuery, genreFilter, page, ratingFilter, sort, yearFilter]);

    const yearOptions = useMemo(() => {
        const years = buildUniqueValues(availableYears.map((value) => String(value)));
        return [{ label: "All years", value: "all" }, ...years.map((year) => ({ label: year, value: year }))];
    }, [availableYears]);

    const genreOptions = useMemo(() => {
        return [{ label: "All genres", value: "all" }, ...availableGenres.map((genre) => ({ label: genre, value: genre }))];
    }, [availableGenres]);

    useEffect(() => {
        if (!addMovieOpen) {
            movieSearchAbortRef.current?.abort();
            return;
        }

        const query = deferredMovieQuery.trim();

        if (query.length < 2) {
            movieSearchAbortRef.current?.abort();
            setMovieResults([]);
            setMovieSearchError(null);
            return;
        }

        const timeoutId = window.setTimeout(async () => {
            movieSearchAbortRef.current?.abort();
            const abortController = new AbortController();
            movieSearchAbortRef.current = abortController;
            setMovieSearchLoading(true);
            setMovieSearchError(null);

            try {
                const response = await apiRequest<MovieSearchResponse>(`/api/movies/search?q=${encodeURIComponent(query)}`, {
                    signal: abortController.signal,
                });
                setMovieResults(response.results);
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") {
                    return;
                }

                setMovieSearchError(error instanceof ApiError ? error.message : "Movie search failed");
            } finally {
                if (movieSearchAbortRef.current === abortController) {
                    movieSearchAbortRef.current = null;
                }

                setMovieSearchLoading(false);
            }
        }, 750);

        return () => {
            window.clearTimeout(timeoutId);
            movieSearchAbortRef.current?.abort();
        };
    }, [addMovieOpen, deferredMovieQuery]);

    const resetAddMovieState = () => {
        movieSearchAbortRef.current?.abort();
        setAddMovieOpen(false);
        setMovieQuery("");
        setMovieResults([]);
        setMovieSearchError(null);
        setMovieSearchLoading(false);
        setSelectedMovie(null);
        setMovieDetailError(null);
        setCreateFieldErrors({});
        setCreateForm(initialFormState);
    };

    const handleSelectMovie = async (tmdbId: number) => {
        const cachedMovie = movieDetailCacheRef.current.get(tmdbId);

        if (cachedMovie) {
            setSelectedMovie(cachedMovie);
            setMovieDetailError(null);
            return;
        }

        setMovieDetailLoading(true);
        setMovieDetailError(null);

        try {
            const response = await apiRequest<MovieDetailResponse>(`/api/movies/tmdb/${tmdbId}`);
            movieDetailCacheRef.current.set(tmdbId, response.movie);
            setSelectedMovie(response.movie);
        } catch (error) {
            setMovieDetailError(error instanceof ApiError ? error.message : "Failed to load movie details");
        } finally {
            setMovieDetailLoading(false);
        }
    };

    const handleCreateEntry = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selectedMovie) {
            return;
        }

        setSaveLoading(true);
        setMovieDetailError(null);
        setCreateFieldErrors({});

        try {
            const values = archiveFormSchema.parse(createForm);
            await apiRequest<ArchiveMutationResponse>("/api/archive", {
                body: {
                    notes: values.notes || null,
                    personalRating: values.personalRating,
                    tmdbId: selectedMovie.tmdbId,
                    watchedAt: values.watchedAt,
                },
                method: "POST",
            });

            resetAddMovieState();
            if (page !== 1) {
                setPage(1);
            } else {
                await loadArchive(1);
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                const nextErrors: Partial<Record<"personalRating" | "watchedAt", string>> = {};

                for (const issue of error.issues) {
                    const field = issue.path[0];

                    if (field === "personalRating" || field === "watchedAt") {
                        nextErrors[field] = issue.message;
                    }
                }

                setCreateFieldErrors(nextErrors);
                return;
            }

            setMovieDetailError(error instanceof ApiError ? error.message : "Failed to add the movie to the archive");
        } finally {
            setSaveLoading(false);
        }
    };

    const handleOpenEdit = (entry: ArchiveEntry) => {
        setEditEntry(entry);
        setEditError(null);
        setEditFieldErrors({});
        setEditForm({
            isWatchedDateUnknown: !entry.watchedAt,
            notes: entry.notes ?? "",
            personalRating: entry.personalRating ? String(entry.personalRating) : "",
            watchedAt: toDatePickerValue(entry.watchedAt),
        });
    };

    const handleUpdateEntry = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!editEntry) {
            return;
        }

        setEditLoading(true);
        setEditError(null);
        setEditFieldErrors({});

        try {
            const values = archiveFormSchema.parse(editForm);
            await apiRequest<ArchiveMutationResponse>(`/api/archive/${editEntry.id}`, {
                body: {
                    notes: values.notes || null,
                    personalRating: values.personalRating,
                    watchedAt: values.watchedAt,
                },
                method: "PATCH",
            });

            setEditEntry(null);
            await loadArchive(page);
        } catch (error) {
            if (error instanceof z.ZodError) {
                const nextErrors: Partial<Record<"personalRating" | "watchedAt", string>> = {};

                for (const issue of error.issues) {
                    const field = issue.path[0];

                    if (field === "personalRating" || field === "watchedAt") {
                        nextErrors[field] = issue.message;
                    }
                }

                setEditFieldErrors(nextErrors);
                return;
            }

            setEditError(error instanceof ApiError ? error.message : "Failed to update the entry");
        } finally {
            setEditLoading(false);
        }
    };

    const handleDeleteEntry = async (entryId: number) => {
        const entry = archiveEntries.find((item) => item.id === entryId) ?? null;
        setPendingDeleteEntry(entry);
    };

    const confirmDeleteEntry = async () => {
        if (!pendingDeleteEntry) {
            return;
        }

        setDeleteLoading(true);
        try {
            await apiRequest(`/api/archive/${pendingDeleteEntry.id}`, {
                method: "DELETE",
            });

            setPendingDeleteEntry(null);
            await loadArchive(page);
        } catch (error) {
            setArchiveError(error instanceof ApiError ? error.message : "Failed to delete the entry");
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleOpenDetail = async (entry: ArchiveEntry) => {
        setSelectedDetailEntry(entry);
        setDetailMovie(null);
        setDetailError(null);

        const cachedMovie = movieDetailCacheRef.current.get(entry.tmdbId);

        if (cachedMovie) {
            setDetailMovie(cachedMovie);
            setDetailLoading(false);
            return;
        }

        setDetailLoading(true);

        try {
            const response = await apiRequest<MovieDetailResponse>(`/api/movies/tmdb/${entry.tmdbId}`);
            movieDetailCacheRef.current.set(entry.tmdbId, response.movie);
            setDetailMovie(response.movie);
        } catch (error) {
            setDetailError(error instanceof ApiError ? error.message : "Failed to load movie details");
        } finally {
            setDetailLoading(false);
        }
    };

    const handleOpenImagePreview = (entry: ArchiveEntry, imageKind: ArchivePreviewImageKind) => {
        const imageUrl = imageKind === "backdrop" ? entry.backdropUrl : entry.posterUrl;

        if (!imageUrl) {
            return;
        }

        setImagePreview({
            entry,
            imageKind,
            imageUrl,
        });
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            setArchiveError(error instanceof ApiError ? error.message : "Failed to log out");
        }
    };

    return (
        <div className="min-h-screen bg-secondary">
            <ArchiveHeader
                archiveQuery={archiveQuery}
                authPending={authPending}
                genreFilter={genreFilter}
                genreOptions={genreOptions}
                onArchiveQueryChange={(value) => {
                    setArchiveQuery(value);
                    setPage(1);
                }}
                onGenreFilterChange={(value) => {
                    setGenreFilter(value);
                    setPage(1);
                }}
                onLogout={() => void handleLogout()}
                onOpenAddMovie={() => setAddMovieOpen(true)}
                onRatingFilterChange={(value) => {
                    setRatingFilter(value);
                    setPage(1);
                }}
                onSortChange={(value) => {
                    setSort(value as SortOption);
                    setPage(1);
                }}
                onYearFilterChange={(value) => {
                    setYearFilter(value);
                    setPage(1);
                }}
                ratingFilter={ratingFilter}
                ratingOptions={ratingFilterOptions}
                sort={sort}
                sortOptions={sortOptions}
                user={user}
                yearFilter={yearFilter}
                yearOptions={yearOptions}
            />

            <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
                {archiveError && <div className="mb-6 rounded-2xl border border-error_subtle bg-error-primary px-4 py-3 text-sm text-error-primary">{archiveError}</div>}

                {archiveLoading ? (
                    <div className="rounded-[28px] border border-secondary bg-primary px-6 py-10 text-center text-md text-tertiary shadow-xs">Loading archive...</div>
                ) : archiveEntries.length === 0 ? (
                    <div className="rounded-[28px] border border-dashed border-secondary bg-primary px-6 py-14 text-center shadow-xs">
                        <h2 className="text-xl font-semibold text-primary">Nothing here yet</h2>
                        <p className="mt-3 text-md text-tertiary">Add your first movie to start building your personal archive.</p>
                        <div className="mt-6">
                            <Button size="lg" onClick={() => setAddMovieOpen(true)}>
                                Add your first movie
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
                            {archiveEntries.map((entry) => (
                                <ArchiveCard
                                    key={entry.id}
                                    entry={entry}
                                    onDelete={() => void handleDeleteEntry(entry.id)}
                                    onEdit={handleOpenEdit}
                                    onOpenDetail={(value) => void handleOpenDetail(value)}
                                    onOpenImagePreview={handleOpenImagePreview}
                                />
                            ))}
                        </div>

                        {archivePagination.totalPages > 1 ? (
                            <PaginationPageDefault
                                page={archivePagination.page}
                                total={archivePagination.totalPages}
                                onPageChange={(nextPage) => setPage(nextPage)}
                            />
                        ) : null}
                    </div>
                )}
            </main>

            {addMovieOpen && (
                <Suspense fallback={modalFallback}>
                    <LazyAddMovieModal
                        form={createForm}
                        isLoading={saveLoading}
                        isMovieDetailLoading={movieDetailLoading}
                        isMovieSearchLoading={movieSearchLoading}
                        movieDetailError={movieDetailError}
                        movieQuery={movieQuery}
                        movieResults={movieResults}
                        movieSearchError={movieSearchError}
                        onClose={resetAddMovieState}
                        onFormChange={(field, value) => setCreateForm((current) => ({ ...current, [field]: value as never }))}
                        onWatchedDateUnknownChange={(isSelected) =>
                            setCreateForm((current) => ({
                                ...current,
                                isWatchedDateUnknown: isSelected,
                                watchedAt: isSelected ? null : current.watchedAt,
                            }))
                        }
                        onMovieQueryChange={setMovieQuery}
                        onSelectMovie={(tmdbId) => void handleSelectMovie(tmdbId)}
                        onSubmit={(event) => void handleCreateEntry(event)}
                        selectedMovie={selectedMovie}
                        fieldErrors={createFieldErrors}
                    />
                </Suspense>
            )}

            {editEntry && (
                <Suspense fallback={modalFallback}>
                    <LazyEditEntryModal
                        entry={editEntry}
                        error={editError}
                        fieldErrors={editFieldErrors}
                        form={editForm}
                        isLoading={editLoading}
                        onClose={() => setEditEntry(null)}
                        onFormChange={(field, value) => setEditForm((current) => ({ ...current, [field]: value as never }))}
                        onWatchedDateUnknownChange={(isSelected) =>
                            setEditForm((current) => ({
                                ...current,
                                isWatchedDateUnknown: isSelected,
                                watchedAt: isSelected ? null : current.watchedAt,
                            }))
                        }
                        onSubmit={(event) => void handleUpdateEntry(event)}
                    />
                </Suspense>
            )}

            {pendingDeleteEntry && (
                <Suspense fallback={modalFallback}>
                    <LazyConfirmDeleteModal
                        entry={pendingDeleteEntry}
                        isLoading={deleteLoading}
                        onClose={() => setPendingDeleteEntry(null)}
                        onConfirm={() => void confirmDeleteEntry()}
                    />
                </Suspense>
            )}

            {selectedDetailEntry && (
                <Suspense fallback={modalFallback}>
                    <LazyMovieDetailModal
                        archiveEntry={selectedDetailEntry}
                        detail={detailMovie}
                        error={detailError}
                        isLoading={detailLoading}
                        onClose={() => {
                            setSelectedDetailEntry(null);
                            setDetailMovie(null);
                            setDetailError(null);
                        }}
                    />
                </Suspense>
            )}

            {imagePreview && (
                <Suspense fallback={modalFallback}>
                    <LazyImagePreviewModal
                        entry={imagePreview.entry}
                        imageKind={imagePreview.imageKind}
                        imageUrl={imagePreview.imageUrl}
                        onClose={() => setImagePreview(null)}
                    />
                </Suspense>
            )}
        </div>
    );
};

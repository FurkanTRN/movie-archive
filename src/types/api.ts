export interface AuthUser {
    email: string;
    id: number;
}

export interface LeadCastMember {
    id: number;
    name: string;
    profileUrl: string | null;
}

export interface MovieSearchResult {
    backdropUrl: string | null;
    imdbId: string | null;
    imdbUrl: string | null;
    overview: string;
    originalTitle: string;
    posterUrl: string | null;
    releaseYear: number | null;
    runtimeMinutes: number | null;
    title: string;
    tmdbId: number;
    tmdbUrl: string;
    voteAverage: number | null;
}

export interface MovieDetail extends MovieSearchResult {
    genres: string[];
    leadCast: LeadCastMember[];
    releaseDate: string | null;
}

export interface ArchiveEntry {
    backdropUrl: string | null;
    createdAt: string;
    genres: string[];
    id: number;
    imdbId: string | null;
    imdbUrl: string | null;
    movieId: number;
    notes: string | null;
    originalTitle: string;
    overview: string;
    personalRating: number | null;
    posterUrl: string | null;
    releaseYear: number | null;
    runtimeMinutes: number | null;
    title: string;
    tmdbId: number;
    tmdbUrl: string;
    updatedAt: string;
    watchedAt: string | null;
}

export interface ArchivePagination {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
    page: number;
    totalItems: number;
    totalPages: number;
}

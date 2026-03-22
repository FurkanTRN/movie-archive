export interface TmdbMovieSearchResult {
    backdrop_path: string | null;
    id: number;
    original_title: string;
    overview: string;
    poster_path: string | null;
    release_date: string;
    title: string;
    vote_average: number;
}

export interface TmdbMovieDetail {
    backdrop_path: string | null;
    credits?: {
        cast: Array<{
            id: number;
            name: string;
            order: number;
            profile_path: string | null;
        }>;
    };
    genres: Array<{
        id: number;
        name: string;
    }>;
    id: number;
    imdb_id: string | null;
    original_title: string;
    overview: string;
    poster_path: string | null;
    release_date: string;
    runtime: number | null;
    title: string;
    vote_average: number;
}

export interface TmdbSearchResponse {
    page: number;
    results: TmdbMovieSearchResult[];
    total_pages: number;
    total_results: number;
}

export interface NormalizedMovieSearchResult {
    backdropUrl: string | null;
    imdbId: null;
    imdbUrl: null;
    overview: string;
    originalTitle: string;
    posterUrl: string | null;
    releaseYear: number | null;
    runtimeMinutes: null;
    title: string;
    tmdbId: number;
    tmdbUrl: string;
    voteAverage: number | null;
}

export interface NormalizedMovieDetail {
    backdropUrl: string | null;
    genres: string[];
    imdbId: string | null;
    imdbUrl: string | null;
    leadCast: Array<{
        id: number;
        name: string;
        profileUrl: string | null;
    }>;
    overview: string;
    originalTitle: string;
    posterUrl: string | null;
    releaseDate: string | null;
    releaseYear: number | null;
    runtimeMinutes: number | null;
    title: string;
    tmdbId: number;
    tmdbUrl: string;
    voteAverage: number | null;
}

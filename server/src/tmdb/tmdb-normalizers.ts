import type {
    NormalizedMovieDetail,
    NormalizedMovieSearchResult,
    TmdbMovieDetail,
    TmdbMovieSearchResult,
} from "./tmdb-types.js";

const imageBaseUrl = "https://image.tmdb.org/t/p/w500";

const getImageUrl = (path: string | null) => {
    return path ? `${imageBaseUrl}${path}` : null;
};

const getReleaseYear = (releaseDate: string | null | undefined) => {
    if (!releaseDate) {
        return null;
    }

    const year = Number(releaseDate.slice(0, 4));

    return Number.isFinite(year) ? year : null;
};

const getVoteAverage = (voteAverage: number | null | undefined) => {
    return typeof voteAverage === "number" ? Number(voteAverage.toFixed(1)) : null;
};

export const normalizeTmdbSearchResult = (movie: TmdbMovieSearchResult): NormalizedMovieSearchResult => {
    return {
        backdropUrl: getImageUrl(movie.backdrop_path),
        imdbId: null,
        imdbUrl: null,
        overview: movie.overview,
        originalTitle: movie.original_title,
        posterUrl: getImageUrl(movie.poster_path),
        releaseYear: getReleaseYear(movie.release_date),
        runtimeMinutes: null,
        title: movie.title,
        tmdbId: movie.id,
        tmdbUrl: `https://www.themoviedb.org/movie/${movie.id}`,
        voteAverage: getVoteAverage(movie.vote_average),
    };
};

export const normalizeTmdbMovieDetail = (movie: TmdbMovieDetail): NormalizedMovieDetail => {
    return {
        backdropUrl: getImageUrl(movie.backdrop_path),
        genres: movie.genres.map((genre) => genre.name),
        imdbId: movie.imdb_id,
        imdbUrl: movie.imdb_id ? `https://www.imdb.com/title/${movie.imdb_id}/` : null,
        leadCast: (movie.credits?.cast ?? [])
            .sort((left, right) => left.order - right.order)
            .slice(0, 5)
            .map((castMember) => ({
                id: castMember.id,
                name: castMember.name,
                profileUrl: getImageUrl(castMember.profile_path),
            })),
        overview: movie.overview,
        originalTitle: movie.original_title,
        posterUrl: getImageUrl(movie.poster_path),
        releaseDate: movie.release_date || null,
        releaseYear: getReleaseYear(movie.release_date),
        runtimeMinutes: movie.runtime,
        title: movie.title,
        tmdbId: movie.id,
        tmdbUrl: `https://www.themoviedb.org/movie/${movie.id}`,
        voteAverage: getVoteAverage(movie.vote_average),
    };
};

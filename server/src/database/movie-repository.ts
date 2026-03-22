import { db } from "./db.js";
import type { NormalizedMovieDetail } from "../tmdb/tmdb-types.js";

interface MovieRow {
    backdrop_url: string | null;
    created_at: string;
    id: number;
    imdb_id: string | null;
    imdb_url: string | null;
    original_title: string;
    overview: string;
    poster_url: string | null;
    release_year: number | null;
    runtime_minutes: number | null;
    title: string;
    tmdb_id: number;
    tmdb_url: string;
    updated_at: string;
}

const selectMovieByTmdbId = db.prepare(`
    SELECT
        id,
        tmdb_id,
        imdb_id,
        title,
        original_title,
        release_year,
        poster_url,
        backdrop_url,
        overview,
        runtime_minutes,
        imdb_url,
        tmdb_url,
        created_at,
        updated_at
    FROM movies
    WHERE tmdb_id = ?
`);

const insertMovie = db.prepare(`
    INSERT INTO movies (
        tmdb_id,
        imdb_id,
        title,
        original_title,
        release_year,
        poster_url,
        backdrop_url,
        overview,
        runtime_minutes,
        imdb_url,
        tmdb_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const updateMovie = db.prepare(`
    UPDATE movies
    SET
        imdb_id = ?,
        title = ?,
        original_title = ?,
        release_year = ?,
        poster_url = ?,
        backdrop_url = ?,
        overview = ?,
        runtime_minutes = ?,
        imdb_url = ?,
        tmdb_url = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
`);

const deleteMovieGenres = db.prepare(`
    DELETE FROM movie_genres
    WHERE movie_id = ?
`);

const insertMovieGenre = db.prepare(`
    INSERT INTO movie_genres (movie_id, genre_name)
    VALUES (?, ?)
`);

const selectMovieGenres = db.prepare(`
    SELECT genre_name
    FROM movie_genres
    WHERE movie_id = ?
    ORDER BY genre_name ASC
`);

const syncMovieGenres = db.transaction((movieId: number, genres: string[]) => {
    deleteMovieGenres.run(movieId);

    for (const genre of genres) {
        insertMovieGenre.run(movieId, genre);
    }
});

const upsertMovieRecord = db.transaction((movie: NormalizedMovieDetail) => {
    const existingMovie = selectMovieByTmdbId.get(movie.tmdbId) as MovieRow | undefined;

    if (!existingMovie) {
        const result = insertMovie.run(
            movie.tmdbId,
            movie.imdbId,
            movie.title,
            movie.originalTitle,
            movie.releaseYear,
            movie.posterUrl,
            movie.backdropUrl,
            movie.overview,
            movie.runtimeMinutes,
            movie.imdbUrl,
            movie.tmdbUrl,
        );

        const movieId = Number(result.lastInsertRowid);
        syncMovieGenres(movieId, movie.genres);

        return movieId;
    }

    updateMovie.run(
        movie.imdbId,
        movie.title,
        movie.originalTitle,
        movie.releaseYear,
        movie.posterUrl,
        movie.backdropUrl,
        movie.overview,
        movie.runtimeMinutes,
        movie.imdbUrl,
        movie.tmdbUrl,
        existingMovie.id,
    );

    syncMovieGenres(existingMovie.id, movie.genres);

    return existingMovie.id;
});

export const movieRepository = {
    getMovieGenres: (movieId: number) => {
        const rows = selectMovieGenres.all(movieId) as Array<{ genre_name: string }>;
        return rows.map((row) => row.genre_name);
    },
    getMovieIdByTmdbId: (tmdbId: number) => {
        const row = selectMovieByTmdbId.get(tmdbId) as Pick<MovieRow, "id"> | undefined;
        return row ? row.id : null;
    },
    upsertMovieFromTmdbDetail: (movie: NormalizedMovieDetail) => {
        return upsertMovieRecord(movie);
    },
};

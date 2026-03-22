import { db } from "./db.js";

interface ArchiveRecordRow {
    backdrop_url: string | null;
    created_at: string;
    id: number;
    imdb_id: string | null;
    imdb_url: string | null;
    movie_id: number;
    notes: string | null;
    original_title: string;
    overview: string;
    personal_rating: number | null;
    poster_url: string | null;
    release_year: number | null;
    runtime_minutes: number | null;
    title: string;
    tmdb_id: number;
    tmdb_url: string;
    updated_at: string;
    user_id: number;
    watched_at: string | null;
}

interface ArchiveEntryInput {
    movieId: number;
    notes: string | null;
    personalRating: number | null;
    userId: number;
    watchedAt: string | null;
}

interface ArchiveQueryOptions {
    genre?: string;
    limit?: number;
    minRating?: number;
    page?: number;
    query?: string;
    sort?: string;
    year?: number;
}

interface ArchiveListResult {
    entries: ReturnType<typeof mapArchiveRow>[];
    filters: {
        genres: string[];
        years: number[];
    };
    pagination: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        limit: number;
        page: number;
        totalItems: number;
        totalPages: number;
    };
}

const selectArchiveEntryByUserAndMovie = db.prepare(`
    SELECT id
    FROM archive_entries
    WHERE user_id = ? AND movie_id = ?
`);

const insertArchiveEntry = db.prepare(`
    INSERT INTO archive_entries (user_id, movie_id, watched_at, personal_rating, notes)
    VALUES (?, ?, ?, ?, ?)
`);

const updateArchiveEntry = db.prepare(`
    UPDATE archive_entries
    SET
        watched_at = ?,
        personal_rating = ?,
        notes = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
`);

const deleteArchiveEntry = db.prepare(`
    DELETE FROM archive_entries
    WHERE id = ? AND user_id = ?
`);

const selectArchiveEntryById = db.prepare(`
    SELECT
        ae.id,
        ae.user_id,
        ae.movie_id,
        ae.watched_at,
        ae.personal_rating,
        ae.notes,
        ae.created_at,
        ae.updated_at,
        m.tmdb_id,
        m.imdb_id,
        m.title,
        m.original_title,
        m.release_year,
        m.poster_url,
        m.backdrop_url,
        m.overview,
        m.runtime_minutes,
        m.imdb_url,
        m.tmdb_url
    FROM archive_entries ae
    INNER JOIN movies m ON m.id = ae.movie_id
    WHERE ae.id = ? AND ae.user_id = ?
`);

const selectArchiveEntriesBase = `
    SELECT
        ae.id,
        ae.user_id,
        ae.movie_id,
        ae.watched_at,
        ae.personal_rating,
        ae.notes,
        ae.created_at,
        ae.updated_at,
        m.tmdb_id,
        m.imdb_id,
        m.title,
        m.original_title,
        m.release_year,
        m.poster_url,
        m.backdrop_url,
        m.overview,
        m.runtime_minutes,
        m.imdb_url,
        m.tmdb_url
    FROM archive_entries ae
    INNER JOIN movies m ON m.id = ae.movie_id
`;

const selectMovieGenres = db.prepare(`
    SELECT genre_name
    FROM movie_genres
    WHERE movie_id = ?
    ORDER BY genre_name ASC
`);

const selectAvailableGenres = db.prepare(`
    SELECT DISTINCT mg.genre_name
    FROM archive_entries ae
    INNER JOIN movie_genres mg ON mg.movie_id = ae.movie_id
    WHERE ae.user_id = ?
    ORDER BY mg.genre_name ASC
`);

const selectAvailableYears = db.prepare(`
    SELECT DISTINCT m.release_year
    FROM archive_entries ae
    INNER JOIN movies m ON m.id = ae.movie_id
    WHERE ae.user_id = ? AND m.release_year IS NOT NULL
    ORDER BY m.release_year DESC
`);

const countArchiveEntriesBase = `
    SELECT COUNT(*) as total
    FROM archive_entries ae
    INNER JOIN movies m ON m.id = ae.movie_id
`;

const resolveSortClause = (sort?: string) => {
    switch (sort) {
        case "releaseYearDesc":
            return "m.release_year DESC, m.title COLLATE NOCASE ASC";
        case "title":
            return "m.title COLLATE NOCASE ASC";
        case "rating":
            return "ae.personal_rating DESC, ae.updated_at DESC";
        case "watchedAt":
            return "ae.watched_at DESC, ae.updated_at DESC";
        case "recent":
        default:
            return "ae.updated_at DESC";
    }
};

const mapArchiveRow = (row: ArchiveRecordRow) => {
    const genres = (selectMovieGenres.all(row.movie_id) as Array<{ genre_name: string }>).map((genre) => genre.genre_name);

    return {
        backdropUrl: row.backdrop_url,
        createdAt: row.created_at,
        genres,
        id: row.id,
        imdbId: row.imdb_id,
        imdbUrl: row.imdb_url,
        movieId: row.movie_id,
        notes: row.notes,
        originalTitle: row.original_title,
        overview: row.overview,
        personalRating: row.personal_rating,
        posterUrl: row.poster_url,
        releaseYear: row.release_year,
        runtimeMinutes: row.runtime_minutes,
        title: row.title,
        tmdbId: row.tmdb_id,
        tmdbUrl: row.tmdb_url,
        updatedAt: row.updated_at,
        watchedAt: row.watched_at,
    };
};

export const archiveRepository = {
    createArchiveEntry: ({ movieId, notes, personalRating, userId, watchedAt }: ArchiveEntryInput) => {
        const result = insertArchiveEntry.run(userId, movieId, watchedAt, personalRating, notes);
        return Number(result.lastInsertRowid);
    },
    deleteArchiveEntry: (id: number, userId: number) => {
        return deleteArchiveEntry.run(id, userId).changes > 0;
    },
    findArchiveEntryById: (id: number, userId: number) => {
        const row = selectArchiveEntryById.get(id, userId) as ArchiveRecordRow | undefined;
        return row ? mapArchiveRow(row) : null;
    },
    findArchiveEntryIdByUserAndMovie: (userId: number, movieId: number) => {
        const row = selectArchiveEntryByUserAndMovie.get(userId, movieId) as { id: number } | undefined;
        return row ? row.id : null;
    },
    listArchiveEntries: (userId: number, options: ArchiveQueryOptions) => {
        const sortClause = resolveSortClause(options.sort);
        const query = options.query?.trim();
        const genre = options.genre?.trim();
        const limit = Number.isInteger(options.limit) && options.limit && options.limit > 0 && options.limit <= 12 ? options.limit : 12;
        const page = Number.isInteger(options.page) && options.page && options.page > 0 ? options.page : 1;
        const minRating = typeof options.minRating === "number" && Number.isFinite(options.minRating) ? options.minRating : undefined;
        const year = typeof options.year === "number" && Number.isFinite(options.year) ? options.year : undefined;
        const baseParams: Array<number | string> = [userId];
        let whereClause = " WHERE ae.user_id = ?";

        if (query) {
            whereClause += " AND (m.title LIKE ? OR m.original_title LIKE ?)";
            const likeValue = `%${query}%`;
            baseParams.push(likeValue, likeValue);
        }

        if (genre) {
            whereClause += " AND EXISTS (SELECT 1 FROM movie_genres mg WHERE mg.movie_id = ae.movie_id AND mg.genre_name = ?)";
            baseParams.push(genre);
        }

        if (year) {
            whereClause += " AND m.release_year = ?";
            baseParams.push(year);
        }

        if (minRating) {
            whereClause += " AND ae.personal_rating >= ?";
            baseParams.push(minRating);
        }

        const countStatement = db.prepare(`${countArchiveEntriesBase}${whereClause}`);
        const countRow = countStatement.get(...baseParams) as { total: number } | undefined;
        const totalItems = countRow?.total ?? 0;
        const totalPages = totalItems > 0 ? Math.ceil(totalItems / limit) : 0;
        const safePage = totalPages > 0 ? Math.min(page, totalPages) : 1;
        const offset = (safePage - 1) * limit;
        const params: Array<number | string> = [...baseParams];
        let sql = `${selectArchiveEntriesBase}${whereClause}`;
        sql += ` ORDER BY ${sortClause}`;
        sql += " LIMIT ? OFFSET ?";
        params.push(limit, offset);

        const statement = db.prepare(sql);
        const rows = statement.all(...params) as ArchiveRecordRow[];
        const genres = (selectAvailableGenres.all(userId) as Array<{ genre_name: string }>).map((row) => row.genre_name);
        const years = (selectAvailableYears.all(userId) as Array<{ release_year: number }>).map((row) => row.release_year);

        return {
            entries: rows.map(mapArchiveRow),
            filters: {
                genres,
                years,
            },
            pagination: {
                hasNextPage: totalPages > 0 && safePage < totalPages,
                hasPreviousPage: safePage > 1,
                limit,
                page: safePage,
                totalItems,
                totalPages,
            },
        } satisfies ArchiveListResult;
    },
    updateArchiveEntry: (id: number, userId: number, watchedAt: string | null, personalRating: number | null, notes: string | null) => {
        return updateArchiveEntry.run(watchedAt, personalRating, notes, id, userId).changes > 0;
    },
};

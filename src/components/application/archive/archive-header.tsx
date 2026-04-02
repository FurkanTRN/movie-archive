import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { NativeSelect } from "@/components/base/select/select-native";
import type { AuthUser } from "@/types/api";
import { ThemeToggle } from "./theme-toggle";

interface SelectOption {
    label: string;
    value: string;
}

interface ArchiveHeaderProps {
    archiveQuery: string;
    authPending: boolean;
    genreFilter: string;
    genreOptions: SelectOption[];
    onArchiveQueryChange: (value: string) => void;
    onGenreFilterChange: (value: string) => void;
    onLogout: () => void;
    onOpenAddMovie: () => void;
    onRatingFilterChange: (value: string) => void;
    onSortChange: (value: string) => void;
    onYearFilterChange: (value: string) => void;
    ratingFilter: string;
    ratingOptions: SelectOption[];
    sort: string;
    sortOptions: SelectOption[];
    user: AuthUser | null;
    yearFilter: string;
    yearOptions: SelectOption[];
}

export const ArchiveHeader = ({
    archiveQuery,
    authPending,
    genreFilter,
    genreOptions,
    onArchiveQueryChange,
    onGenreFilterChange,
    onLogout,
    onOpenAddMovie,
    onRatingFilterChange,
    onSortChange,
    onYearFilterChange,
    ratingFilter,
    ratingOptions,
    sort,
    sortOptions,
    yearFilter,
    yearOptions,
}: ArchiveHeaderProps) => {
    return (
        <div className="border-b border-secondary bg-primary/90 backdrop-blur">
            <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 lg:px-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-display-sm font-semibold text-primary">Movie Archive</h1>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                        <ThemeToggle />
                        <Button color="secondary" size="lg" onClick={onOpenAddMovie}>
                            Add movie
                        </Button>
                        <Button color="secondary-destructive" size="lg" isLoading={authPending} onClick={onLogout}>
                            Log out
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 rounded-3xl border border-secondary bg-secondary px-4 py-4 md:grid-cols-2 xl:grid-cols-[3fr_2fr_2fr_2fr_2fr]">
                    <div className="md:col-span-2 xl:col-auto">
                        <Input label="Search archive" placeholder="Search by movie title only" value={archiveQuery} onChange={onArchiveQueryChange} />
                    </div>
                    <div className="md:col-span-1 xl:col-auto">
                        <NativeSelect label="Sort" options={sortOptions} value={sort} onChange={(event) => onSortChange(event.target.value)} />
                    </div>
                    <div className="md:col-span-1 xl:col-auto">
                        <NativeSelect label="Genre" options={genreOptions} value={genreFilter} onChange={(event) => onGenreFilterChange(event.target.value)} />
                    </div>
                    <div className="md:col-span-1 xl:col-auto">
                        <NativeSelect label="Year" options={yearOptions} value={yearFilter} onChange={(event) => onYearFilterChange(event.target.value)} />
                    </div>
                    <div className="md:col-span-1 xl:col-auto">
                        <NativeSelect
                            label="Personal rating"
                            options={ratingOptions}
                            value={ratingFilter}
                            onChange={(event) => onRatingFilterChange(event.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

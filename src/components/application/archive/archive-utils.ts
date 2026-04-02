import { getLocalTimeZone, parseDate } from "@internationalized/date";
import type { DateValue } from "react-aria-components";

export const formatDate = (value: string | null) => {
    if (!value) {
        return "No date provided";
    }

    return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
    }).format(new Date(value));
};

export const formatRuntime = (runtimeMinutes: number | null) => {
    if (!runtimeMinutes) {
        return "No runtime";
    }

    const hours = Math.floor(runtimeMinutes / 60);
    const minutes = runtimeMinutes % 60;

    if (!hours) {
        return `${minutes} min`;
    }

    return `${hours}h ${minutes}m`;
};

export const toDateInputValue = (value: string | null) => {
    if (!value) {
        return "";
    }

    return new Date(value).toISOString().slice(0, 10);
};

export const buildUniqueValues = (values: string[]) => {
    return Array.from(new Set(values)).sort((left, right) => left.localeCompare(right, "en"));
};

export const toDatePickerValue = (value: string | null): DateValue | null => {
    if (!value) {
        return null;
    }

    return parseDate(new Date(value).toISOString().slice(0, 10));
};

export const toIsoDateString = (value: DateValue | null) => {
    if (!value) {
        return null;
    }

    return value.toDate(getLocalTimeZone()).toISOString();
};

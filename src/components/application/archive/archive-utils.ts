import { getLocalTimeZone, parseDate } from "@internationalized/date";
import type { DateValue } from "react-aria-components";

export const formatDate = (value: string | null) => {
    if (!value) {
        return "Tarih girilmedi";
    }

    return new Intl.DateTimeFormat("tr-TR", {
        dateStyle: "medium",
    }).format(new Date(value));
};

export const formatRuntime = (runtimeMinutes: number | null) => {
    if (!runtimeMinutes) {
        return "Süre yok";
    }

    const hours = Math.floor(runtimeMinutes / 60);
    const minutes = runtimeMinutes % 60;

    if (!hours) {
        return `${minutes} dk`;
    }

    return `${hours}s ${minutes}dk`;
};

export const toDateInputValue = (value: string | null) => {
    if (!value) {
        return "";
    }

    return new Date(value).toISOString().slice(0, 10);
};

export const buildUniqueValues = (values: string[]) => {
    return Array.from(new Set(values)).sort((left, right) => left.localeCompare(right, "tr"));
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

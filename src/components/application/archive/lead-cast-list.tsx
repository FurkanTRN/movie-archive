import { Avatar } from "@/components/base/avatar/avatar";
import type { LeadCastMember } from "@/types/api";

interface LeadCastListProps {
    cast: LeadCastMember[];
}

export const LeadCastList = ({ cast }: LeadCastListProps) => {
    if (cast.length === 0) {
        return <p className="text-sm text-tertiary">Oyuncu bilgisi bulunamadı.</p>;
    }

    return (
        <div className="grid gap-3 sm:grid-cols-2">
            {cast.map((castMember) => (
                <div key={castMember.id} className="flex items-center gap-3 rounded-2xl border border-secondary bg-primary px-3 py-3">
                    <Avatar size="sm" src={castMember.profileUrl} alt={castMember.name} initials={castMember.name.slice(0, 1).toUpperCase()} />
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-primary">{castMember.name}</p>
                        <p className="text-xs text-tertiary">Başrol</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

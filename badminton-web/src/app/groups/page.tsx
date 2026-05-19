import Link from "next/link";
import { MapPin, Pencil, Plus, ShieldCheck, Trash2, Trophy, UsersRound } from "lucide-react";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/auth/session";
import { EmptyState, SectionHeader } from "@/components/ui/surfaces";
import { canCreateGroups, getGroupAgeLabel, getGroupsPageForUser, type UserGroupCardData } from "@/lib/group-data";

function GroupCard({ group }: { group: UserGroupCardData }) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-white/80 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-zinc-950/5 transition hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(16,185,129,0.18)]">
      <div className="h-2 bg-gradient-to-r from-emerald-400 via-lime-300 to-sky-400" />
      <div className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-900 ring-1 ring-emerald-200">
                {group.level}
              </span>
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-900 ring-1 ring-violet-200">
                ages {getGroupAgeLabel(group)}
              </span>
            </div>
            <Link
              href={`/groups/${group.id}`}
              className="mt-4 block text-2xl font-black tracking-normal text-zinc-950 transition hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {group.title}
            </Link>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600">
              {group.description ?? "Club group with shared sessions, players, and coaches."}
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-2xl bg-lime-100 px-3 py-2 text-xs font-black text-lime-950">
            <ShieldCheck aria-hidden="true" className="h-4 w-4" />
            {group.roles.join(", ") || "member"}
          </span>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <span className="rounded-2xl bg-sky-50 px-4 py-3 text-sm font-bold text-sky-900">
            {group.sessionCount} sessions
          </span>
          <span className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900">
            {group.playerCount} players
          </span>
          <span className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-950">
            {group.memberCount} members
          </span>
        </div>

        <p className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-zinc-600">
          <MapPin aria-hidden="true" className="h-4 w-4 text-emerald-700" />
          {group.venueName}, {group.venueCity}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={`/groups/${group.id}`}
            className="inline-flex min-h-10 items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-black text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100"
          >
            View
          </Link>
          {group.canManage ? (
            <>
              <Link
                href={`/groups/${group.id}/edit`}
                className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-black text-sky-700 transition hover:bg-sky-100 focus:outline-none focus:ring-4 focus:ring-sky-100"
              >
                <Pencil aria-hidden="true" className="h-4 w-4" />
                Edit
              </Link>
              <Link
                href={`/groups/${group.id}/delete`}
                className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-black text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-4 focus:ring-rose-100"
              >
                <Trash2 aria-hidden="true" className="h-4 w-4" />
                Delete
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </article>
  );
}

type GroupsSearchParams = {
  page?: string | string[];
};

function parsePositivePage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return Math.max(Number(raw ?? "1") || 1, 1);
}

function PaginationControls({ page, totalPages, total }: { page: number; totalPages: number; total: number }) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="mt-6 flex flex-col gap-3 rounded-3xl bg-white p-4 text-sm font-bold text-zinc-700 shadow-sm ring-1 ring-zinc-950/5 sm:flex-row sm:items-center sm:justify-between">
      <p>
        Page {page} of {totalPages}
        <span className="font-semibold text-zinc-500"> · {total} total</span>
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={`/groups?page=${page - 1}`} className="rounded-full border border-zinc-200 px-4 py-2 text-zinc-800 transition hover:border-emerald-300 hover:bg-emerald-50">
            Previous
          </Link>
        ) : (
          <span className="rounded-full border border-zinc-100 px-4 py-2 text-zinc-300">Previous</span>
        )}
        {page < totalPages ? (
          <Link href={`/groups?page=${page + 1}`} className="rounded-full bg-emerald-700 px-4 py-2 text-white transition hover:bg-emerald-800">
            Next
          </Link>
        ) : (
          <span className="rounded-full bg-zinc-100 px-4 py-2 text-zinc-300">Next</span>
        )}
      </div>
    </nav>
  );
}

export default async function GroupsPage({
  searchParams,
}: {
  searchParams: Promise<GroupsSearchParams>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/groups");
  }

  const resolvedSearchParams = await searchParams;
  const page = parsePositivePage(resolvedSearchParams.page);
  const { groups, paging } = await getGroupsPageForUser(user, { page, pageSize: 12 });
  const canCreate = canCreateGroups(user);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-600 via-sky-500 to-violet-500 p-6 text-white shadow-[0_24px_70px_rgba(59,130,246,0.24)] sm:p-8">
        <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(135deg,rgba(255,255,255,0.18)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.18)_50%,rgba(255,255,255,0.18)_75%,transparent_75%)] bg-[length:34px_34px] opacity-25" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="inline-flex rounded-full bg-white/20 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-lime-100 ring-1 ring-white/30">
              My club groups
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-normal sm:text-5xl">
              Groups for {user.name.split(" ")[0]}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-50">
              See your training groups, coaches, players, venues, and upcoming session rhythm.
            </p>
          </div>
          <div className="rounded-3xl bg-white/15 p-5 ring-1 ring-white/30 backdrop-blur">
            <UsersRound aria-hidden="true" className="h-16 w-16 text-lime-100" />
            <p className="mt-3 text-sm font-black uppercase tracking-[0.16em] text-white/90">
              {paging.total} groups
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            eyebrow="Membership"
            title="Your Groups"
            description="Only groups connected to your account or linked players are shown here."
          />
          {canCreate ? (
            <Link
              href="/groups/new"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100"
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
              New
            </Link>
          ) : null}
        </div>
        {groups.length ? (
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <EmptyState
              title="No groups yet"
              description="Your account is not connected to a group or linked player membership yet."
            />
          </div>
        )}
        <PaginationControls page={paging.page} totalPages={paging.totalPages} total={paging.total} />
      </section>

      <section className="mt-10 rounded-3xl bg-white/80 p-5 text-sm font-bold text-zinc-700 shadow-sm ring-1 ring-zinc-950/5">
        <Trophy aria-hidden="true" className="mr-2 inline h-4 w-4 text-emerald-700" />
        Group access is based on club membership, so private group details stay visible only to connected users.
      </section>
    </div>
  );
}

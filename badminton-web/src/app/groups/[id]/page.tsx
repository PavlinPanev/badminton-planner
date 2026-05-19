import Link from "next/link";
import {
  CalendarPlus,
  GraduationCap,
  Mail,
  MapPin,
  Megaphone,
  Pencil,
  ShieldCheck,
  Trash2,
  Trophy,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/auth/session";
import { StateBadge } from "@/components/session-badges";
import { Card, EmptyState, SectionHeader } from "@/components/ui/surfaces";
import { getGroupAgeLabel, getGroupDetailForUser, type GroupDetailData } from "@/lib/group-data";
import { formatSessionDate, formatSessionTime } from "@/lib/session-status";
import { InviteLinkPanel } from "../invite-link-panel";
import { LeaveGroupPanel } from "../leave-group-panel";

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white/15 p-4 ring-1 ring-white/20">
      <dt className="text-xs font-black uppercase tracking-wide text-lime-100">{label}</dt>
      <dd className="mt-1 text-sm font-bold text-white">{value}</dd>
    </div>
  );
}

function PersonRow({
  name,
  detail,
  role,
  icon: Icon,
}: {
  name: string;
  detail: string;
  role: string;
  icon: typeof UsersRound;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-zinc-50 p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-lime-200 to-emerald-300 text-emerald-950">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-black text-zinc-950">{name}</p>
        <p className="mt-1 truncate text-xs font-semibold text-zinc-600">{detail}</p>
      </div>
      <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-900 ring-1 ring-violet-200">
        {role}
      </span>
    </div>
  );
}

function SessionList({ group }: { group: GroupDetailData }) {
  if (!group.sessions.length) {
    return <EmptyState title="No sessions yet" description="This group does not have scheduled sessions yet." />;
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/80 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-zinc-200 bg-gradient-to-r from-lime-50 to-sky-50 px-5 py-4 text-xs font-black uppercase tracking-wide text-zinc-600 md:grid-cols-[1fr_120px_160px_120px_170px]">
        <span>Session</span>
        <span>Status</span>
        <span className="hidden md:block">Venue</span>
        <span className="hidden md:block">Capacity</span>
        <span className="hidden md:block">Actions</span>
      </div>
      {group.sessions.map((session) => (
        <div
          key={session.id}
          className="grid grid-cols-[1fr_auto] gap-3 border-b border-zinc-100 px-5 py-4 text-sm transition last:border-b-0 hover:bg-emerald-50/60 md:grid-cols-[1fr_120px_160px_120px_170px]"
        >
          <div>
            <p className="font-black text-zinc-950">
              {formatSessionDate(session.sessionDate)} at {formatSessionTime(session.startTime)}
            </p>
            <p className="mt-1 text-xs font-semibold text-zinc-600">Coach: {session.coachName ?? "Not assigned"}</p>
            <div className="mt-3 flex flex-wrap gap-2 md:hidden">
              <Link
                href={`/sessions/${session.id}`}
                className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-black text-white"
              >
                View
              </Link>
              {group.canManageSessions ? (
                <>
                  <Link
                    href={`/groups/${group.id}/sessions/${session.id}/edit`}
                    className="rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-800"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/groups/${group.id}/sessions/${session.id}/delete`}
                    className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-800"
                  >
                    Delete
                  </Link>
                </>
              ) : null}
            </div>
          </div>
          <div className="flex items-start">
            {session.canceled ? (
              <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-900 ring-1 ring-rose-200">
                canceled
              </span>
            ) : (
              <StateBadge state={session.state} />
            )}
          </div>
          <span className="hidden font-semibold text-zinc-700 md:block">{session.venueName}</span>
          <span className="hidden font-semibold text-zinc-700 md:block">{session.capacity ?? "Open"}</span>
          <div className="hidden flex-wrap gap-2 md:flex">
            <Link
              href={`/sessions/${session.id}`}
              className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-black text-white transition hover:bg-emerald-700"
            >
              View
            </Link>
            {group.canManageSessions ? (
              <>
                <Link
                  href={`/groups/${group.id}/sessions/${session.id}/edit`}
                  className="rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-800 transition hover:bg-sky-200"
                >
                  Edit
                </Link>
                <Link
                  href={`/groups/${group.id}/sessions/${session.id}/delete`}
                  className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-800 transition hover:bg-rose-200"
                >
                  Delete
                </Link>
              </>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function formatAnnouncementDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function AnnouncementList({ group }: { group: GroupDetailData }) {
  if (!group.announcements.length) {
    return <EmptyState title="No announcements yet" description="Group announcements will appear here." />;
  }

  return (
    <div className="space-y-4">
      {group.announcements.map((announcement) => (
        <div
          key={announcement.id}
          className="rounded-3xl border border-white/80 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-zinc-950/5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Announcement</p>
              <h3 className="mt-2 text-xl font-black text-zinc-950">{announcement.title}</h3>
            </div>
            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-700 ring-1 ring-sky-200">
              {announcement.authorRole}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-zinc-700">{announcement.content}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-zinc-500">
            <span>◷ {formatAnnouncementDate(announcement.createdAt)}</span>
            <span>By {announcement.authorName}</span>
          </div>
          {group.canManageAnnouncements ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/groups/${group.id}/announcements/${announcement.id}/edit`}
                className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-800 transition hover:bg-sky-200"
              >
                Edit
              </Link>
              <Link
                href={`/groups/${group.id}/announcements/${announcement.id}/delete`}
                className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-800 transition hover:bg-rose-200"
              >
                Delete
              </Link>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/groups");
  }

  const { id } = await params;
  const groupId = Number(id);

  if (!Number.isInteger(groupId)) {
    notFound();
  }

  const result = await getGroupDetailForUser(groupId, user);

  if (result.status === "not-found") {
    notFound();
  }

  if (result.status === "forbidden") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/groups" className="text-sm font-black text-emerald-700 hover:text-emerald-900">
          Back to groups
        </Link>
        <section className="mt-6 rounded-3xl border border-rose-200 bg-white p-6 shadow-lg">
          <h1 className="text-2xl font-black text-zinc-950">Group unavailable</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-700">
            You can only view groups connected to your account or linked players.
          </p>
        </section>
      </div>
    );
  }

  const group = result.group;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/groups" className="text-sm font-black text-emerald-700 hover:text-emerald-900">
        Back to groups
      </Link>

      <section className="relative mt-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-600 via-sky-500 to-emerald-500 p-6 text-white shadow-[0_24px_70px_rgba(59,130,246,0.25)] sm:p-8">
        <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(135deg,rgba(255,255,255,0.18)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.18)_50%,rgba(255,255,255,0.18)_75%,transparent_75%)] bg-[length:34px_34px] opacity-25" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="inline-flex rounded-full bg-white/20 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-lime-100 ring-1 ring-white/30">
              Group details
            </p>
            <h1 className="mt-4 text-3xl font-black tracking-normal sm:text-5xl">{group.title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-white/90">
              {group.description ?? "Training group for club sessions, attendance, and member coordination."}
            </p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold text-white/90">
              <span className="inline-flex items-center gap-2">
                <Trophy aria-hidden="true" className="h-4 w-4" />
                {group.level}
              </span>
              <span className="inline-flex items-center gap-2">
                <UsersRound aria-hidden="true" className="h-4 w-4" />
                ages {getGroupAgeLabel(group)}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin aria-hidden="true" className="h-4 w-4" />
                {group.venueName}, {group.venueCity}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            {group.roles.map((role) => (
              <span
                key={role}
                className="inline-flex items-center gap-2 rounded-full bg-lime-100 px-3 py-1 text-xs font-black text-lime-950 ring-1 ring-lime-200"
              >
                <ShieldCheck aria-hidden="true" className="h-4 w-4" />
                {role}
              </span>
            ))}
            {group.canManage ? (
              <>
                <Link
                  href={`/groups/${group.id}/edit`}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black text-sky-700 ring-1 ring-sky-200 transition hover:bg-sky-50"
                >
                  <Pencil aria-hidden="true" className="h-4 w-4" />
                  Edit
                </Link>
                <Link
                  href={`/groups/${group.id}/delete`}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-50"
                >
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                  Delete
                </Link>
                <Link
                  href={`/groups/${group.id}/members`}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black text-emerald-700 ring-1 ring-emerald-200 transition hover:bg-emerald-50"
                >
                  <UsersRound aria-hidden="true" className="h-4 w-4" />
                  Members
                </Link>
              </>
            ) : null}
          </div>
        </div>

        <dl className="relative mt-8 grid gap-4 rounded-3xl bg-white/15 p-4 ring-1 ring-white/25 backdrop-blur sm:grid-cols-2 lg:grid-cols-4">
          <StatPill label="Players" value={group.playerCount} />
          <StatPill label="Members" value={group.memberCount} />
          <StatPill label="Sessions" value={group.sessionCount} />
          <StatPill label="Venue" value={group.venueCity} />
        </dl>
      </section>

      <section className="mt-10 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-6">
          <SectionHeader
            eyebrow="Home court"
            title="Venue"
            description="The regular location used by this group for training and coordination."
          />
          <div className="mt-5 rounded-3xl bg-gradient-to-br from-emerald-50 to-sky-50 p-5">
            <p className="inline-flex items-center gap-2 text-lg font-black text-zinc-950">
              <MapPin aria-hidden="true" className="h-5 w-5 text-emerald-700" />
              {group.venueName}
            </p>
            <p className="mt-2 text-sm font-semibold text-zinc-700">{group.venueAddress}</p>
            {group.venueDescription ? (
              <p className="mt-3 text-sm leading-6 text-zinc-600">{group.venueDescription}</p>
            ) : null}
          </div>
        </Card>

        <Card className="p-6">
          <SectionHeader
            eyebrow="Coaching"
            title="Coaches"
            description="Coaches and managers connected to this group."
          />
          <div className="mt-5 space-y-3">
            {group.coaches.length ? (
              group.coaches.map((coach) => (
                <PersonRow
                  key={`${coach.role}-${coach.id}`}
                  name={coach.name}
                  detail={coach.email}
                  role={coach.role}
                  icon={UserRoundCheck}
                />
              ))
            ) : (
              <EmptyState title="No coaches listed" description="No coach membership is connected to this group yet." />
            )}
          </div>
        </Card>
      </section>

      {group.canManage ? (
        <section className="mt-10">
          <SectionHeader
            eyebrow="Manager tools"
            title="Invite Members"
            description="Create a one-person invite link for this training group."
          />
          <InviteLinkPanel groupId={group.id} />
        </section>
      ) : null}

      {group.canLeave ? (
        <section className="mt-10">
          <SectionHeader
            eyebrow="Membership"
            title="Leave Group"
            description="Remove your user account from this group when you no longer need access."
          />
          <LeaveGroupPanel groupId={group.id} currentUserRole={group.currentUserRole} />
        </section>
      ) : null}

      <section className="mt-10 grid gap-5 lg:grid-cols-2">
        <div>
          <SectionHeader eyebrow="Roster" title="Players" description="Players currently connected to this group." />
          <div className="mt-5 space-y-3">
            {group.players.length ? (
              group.players.map((player) => (
                <PersonRow
                  key={player.id}
                  name={player.name}
                  detail={`Born ${player.birthYear} · Parent: ${player.parentName}`}
                  role={player.skillLevel}
                  icon={GraduationCap}
                />
              ))
            ) : (
              <EmptyState title="No players listed" description="No player memberships are connected to this group yet." />
            )}
          </div>
        </div>

        <div>
          <SectionHeader
            eyebrow="Club people"
            title="Members"
            description="Direct user memberships for coaches, parents, and managers."
          />
          <div className="mt-5 space-y-3">
            {group.members.length ? (
              group.members.map((member) => (
                <PersonRow
                  key={`${member.role}-${member.id}`}
                  name={member.name}
                  detail={member.email || "No email available"}
                  role={member.role}
                  icon={Mail}
                />
              ))
            ) : (
              <EmptyState title="No members listed" description="No direct user memberships are connected to this group yet." />
            )}
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            eyebrow="Group updates"
            title="Announcements"
            description="News, reminders, and updates shared with this group."
          />
          {group.canManageAnnouncements ? (
            <Link
              href={`/groups/${group.id}/announcements/new`}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100"
            >
              <Megaphone aria-hidden="true" className="h-4 w-4" />
              Create
            </Link>
          ) : null}
        </div>
        <div className="mt-5">
          <AnnouncementList group={group} />
        </div>
      </section>

      <section className="mt-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            eyebrow="Schedule"
            title="Group Sessions"
            description="Recent and upcoming sessions connected to this group."
          />
          {group.canManageSessions ? (
            <Link
              href={`/groups/${group.id}/sessions/new`}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100"
            >
              <CalendarPlus aria-hidden="true" className="h-4 w-4" />
              Create
            </Link>
          ) : null}
        </div>
        <div className="mt-5">
          <SessionList group={group} />
        </div>
      </section>
    </div>
  );
}

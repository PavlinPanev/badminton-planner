import Link from "next/link";
import type { ReactNode } from "react";
import { GraduationCap, ShieldCheck, Trash2, UserPlus, UsersRound } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/auth/session";
import { Card, EmptyState, SectionHeader } from "@/components/ui/surfaces";
import { getGroupMembersManagementForUser } from "@/lib/group-data";
import {
  addPlayerToGroupAction,
  assignCoachAction,
  demoteManagerAction,
  promoteManagerAction,
  removePlayerFromGroupAction,
  removeUserMemberAction,
} from "../../member-actions";

function ActionButton({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "danger" | "success";
}) {
  const styles = {
    neutral: "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 focus:ring-zinc-100",
    danger: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 focus:ring-rose-100",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 focus:ring-emerald-100",
  };

  return (
    <button
      type="submit"
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border px-4 py-2 text-xs font-black transition focus:outline-none focus:ring-4 ${styles[tone]}`}
    >
      {children}
    </button>
  );
}

export default async function ManageGroupMembersPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
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

  const result = await getGroupMembersManagementForUser(groupId, user);

  if (result.status === "not-found") {
    notFound();
  }

  if (result.status === "forbidden") {
    redirect(`/groups/${groupId}`);
  }

  const data = result.data;
  const resolvedSearchParams = await searchParams;
  const error = resolvedSearchParams?.error;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href={`/groups/${groupId}`} className="text-sm font-black text-emerald-700 hover:text-emerald-900">
        Back to group
      </Link>

      <section className="mt-6 rounded-[2rem] bg-gradient-to-br from-emerald-600 via-sky-500 to-violet-500 p-6 text-white shadow-[0_24px_70px_rgba(59,130,246,0.24)] sm:p-8">
        <p className="inline-flex rounded-full bg-white/20 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-lime-100 ring-1 ring-white/30">
          Manager tools
        </p>
        <h1 className="mt-5 text-4xl font-black tracking-normal sm:text-5xl">Manage Members</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-50">
          Update user roles, coaches, and players for {data.group.title}.
        </p>
      </section>

      {error === "last-manager" ? (
        <p className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 ring-1 ring-rose-200">
          This group must keep at least one manager.
        </p>
      ) : null}

      <section className="mt-10 grid gap-5 lg:grid-cols-[1fr_360px]">
        <div>
          <SectionHeader
            eyebrow="People"
            title="User Members"
            description="View members, remove users, and promote or demote group managers."
          />
          <div className="mt-5 space-y-3">
            {data.members.length ? (
              data.members.map((member) => (
                <Card key={member.membershipId} className="p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-lime-100 text-emerald-800">
                        <UsersRound aria-hidden="true" className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-black text-zinc-950">{member.name}</p>
                        <p className="mt-1 text-xs font-semibold text-zinc-600">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-2 text-xs font-black text-violet-900 ring-1 ring-violet-200">
                        <ShieldCheck aria-hidden="true" className="h-4 w-4" />
                        {member.role}
                      </span>
                      {member.role === "manager" ? (
                        <form action={demoteManagerAction}>
                          <input type="hidden" name="groupId" value={groupId} />
                          <input type="hidden" name="membershipId" value={member.membershipId} />
                          <ActionButton>Demote manager</ActionButton>
                        </form>
                      ) : (
                        <form action={promoteManagerAction}>
                          <input type="hidden" name="groupId" value={groupId} />
                          <input type="hidden" name="membershipId" value={member.membershipId} />
                          <ActionButton tone="success">Promote manager</ActionButton>
                        </form>
                      )}
                      <form action={removeUserMemberAction}>
                        <input type="hidden" name="groupId" value={groupId} />
                        <input type="hidden" name="membershipId" value={member.membershipId} />
                        <ActionButton tone="danger">
                          <Trash2 aria-hidden="true" className="h-4 w-4" />
                          Remove
                        </ActionButton>
                      </form>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <EmptyState title="No user members" description="This group does not have direct user memberships yet." />
            )}
          </div>
        </div>

        <div>
          <SectionHeader
            eyebrow="Coaching"
            title="Assign Coach"
            description="Assign an existing club coach, manager, or admin as a coach for this group."
          />
          <Card className="mt-5 p-5">
            {data.availableCoaches.length ? (
              <form action={assignCoachAction} className="space-y-4">
                <input type="hidden" name="groupId" value={groupId} />
                <select
                  name="userId"
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                >
                  {data.availableCoaches.map((coach) => (
                    <option key={coach.id} value={coach.id}>
                      {coach.name} ({coach.role})
                    </option>
                  ))}
                </select>
                <ActionButton tone="success">
                  <UserPlus aria-hidden="true" className="h-4 w-4" />
                  Assign coach
                </ActionButton>
              </form>
            ) : (
              <p className="text-sm font-semibold text-zinc-600">No available coach users to assign.</p>
            )}
          </Card>
        </div>
      </section>

      <section className="mt-10 grid gap-5 lg:grid-cols-[1fr_360px]">
        <div>
          <SectionHeader
            eyebrow="Roster"
            title="Players"
            description="View and remove player memberships connected to this group."
          />
          <div className="mt-5 space-y-3">
            {data.playerMembers.length ? (
              data.playerMembers.map((player) => (
                <Card key={player.membershipId} className="p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-100 text-sky-800">
                        <GraduationCap aria-hidden="true" className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-black text-zinc-950">{player.name}</p>
                        <p className="mt-1 text-xs font-semibold text-zinc-600">
                          Born {player.birthYear} · {player.skillLevel} · Parent: {player.parentName}
                        </p>
                      </div>
                    </div>
                    <form action={removePlayerFromGroupAction}>
                      <input type="hidden" name="groupId" value={groupId} />
                      <input type="hidden" name="membershipId" value={player.membershipId} />
                      <ActionButton tone="danger">
                        <Trash2 aria-hidden="true" className="h-4 w-4" />
                        Remove player
                      </ActionButton>
                    </form>
                  </div>
                </Card>
              ))
            ) : (
              <EmptyState title="No players" description="This group does not have player memberships yet." />
            )}
          </div>
        </div>

        <div>
          <SectionHeader
            eyebrow="Roster"
            title="Add Player"
            description="Add an existing player profile to this group."
          />
          <Card className="mt-5 p-5">
            {data.availablePlayers.length ? (
              <form action={addPlayerToGroupAction} className="space-y-4">
                <input type="hidden" name="groupId" value={groupId} />
                <select
                  name="playerId"
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                >
                  {data.availablePlayers.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.name} · {player.parentName}
                    </option>
                  ))}
                </select>
                <ActionButton tone="success">
                  <UserPlus aria-hidden="true" className="h-4 w-4" />
                  Add player
                </ActionButton>
              </form>
            ) : (
              <p className="text-sm font-semibold text-zinc-600">No available players to add.</p>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}

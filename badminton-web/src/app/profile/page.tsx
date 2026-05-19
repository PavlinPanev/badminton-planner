import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, ShieldCheck, UserRoundCog } from "lucide-react";

import { getCurrentUser } from "@/auth/session";
import { Card, SectionHeader } from "@/components/ui/surfaces";
import { getProfileData } from "@/lib/profile-data";
import { updateProfileAction } from "./actions";

export const dynamic = "force-dynamic";

type ProfileSearchParams = {
  error?: string | string[];
  updated?: string | string[];
};

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});

function readSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatRole(role: string) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function StatusBanner({ error, updated }: { error?: string; updated?: string }) {
  if (error) {
    return (
      <Card className="mt-6 border-rose-100 bg-rose-50 p-5 text-sm font-bold text-rose-800">
        Enter a display name with at least two characters.
      </Card>
    );
  }

  if (updated) {
    return (
      <Card className="mt-6 border-emerald-100 bg-emerald-50 p-5 text-sm font-bold text-emerald-900">
        Profile settings saved.
      </Card>
    );
  }

  return null;
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-5">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">{label}</p>
      <p className="mt-3 text-3xl font-black text-zinc-950">{value}</p>
    </Card>
  );
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<ProfileSearchParams>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/profile");
  }

  const profile = await getProfileData(user);

  if (!profile) {
    redirect("/login?next=/profile");
  }

  const resolvedSearchParams = await searchParams;
  const error = readSearchValue(resolvedSearchParams.error);
  const updated = readSearchValue(resolvedSearchParams.updated);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-600 via-sky-500 to-violet-500 p-6 text-white shadow-[0_24px_70px_rgba(59,130,246,0.24)] sm:p-8">
        <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(135deg,rgba(255,255,255,0.18)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.18)_50%,rgba(255,255,255,0.18)_75%,transparent_75%)] bg-[length:34px_34px] opacity-25" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="inline-flex rounded-full bg-white/20 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-lime-100 ring-1 ring-white/30">
              Account
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-normal sm:text-5xl">
              Profile Settings
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-50">
              Manage your club identity and review the access connected to your account.
            </p>
          </div>
          <div className="rounded-3xl bg-white/15 p-5 ring-1 ring-white/30 backdrop-blur">
            <UserRoundCog aria-hidden="true" className="h-16 w-16 text-lime-100" />
            <p className="mt-3 text-sm font-black uppercase tracking-[0.16em] text-white/90">
              {formatRole(profile.role)}
            </p>
          </div>
        </div>
      </section>

      <StatusBanner error={error} updated={updated} />

      <section className="mt-10 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-6">
          <SectionHeader
            eyebrow="Identity"
            title="Account Details"
            description="Your email is used for login. Display name appears on comments, roles, and member lists."
          />
          <dl className="mt-6 space-y-4 text-sm">
            <div className="rounded-2xl bg-zinc-50 p-4">
              <dt className="font-black text-zinc-500">Email</dt>
              <dd className="mt-1 break-all font-bold text-zinc-950">{profile.email}</dd>
            </div>
            <div className="rounded-2xl bg-zinc-50 p-4">
              <dt className="font-black text-zinc-500">Global role</dt>
              <dd className="mt-1 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 font-black text-emerald-900 ring-1 ring-emerald-200">
                <ShieldCheck aria-hidden="true" className="h-4 w-4" />
                {formatRole(profile.role)}
              </dd>
            </div>
            <div className="rounded-2xl bg-zinc-50 p-4">
              <dt className="font-black text-zinc-500">Created</dt>
              <dd className="mt-1 font-bold text-zinc-950">{dateFormatter.format(new Date(profile.createdAt))}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6">
          <SectionHeader
            eyebrow="Settings"
            title="Display Name"
            description="Keep this name recognizable for coaches, managers, parents, and players."
          />
          <form action={updateProfileAction} className="mt-6 space-y-4">
            <div>
              <label htmlFor="name" className="text-sm font-black text-zinc-700">
                Name
              </label>
              <input
                id="name"
                name="name"
                defaultValue={profile.name}
                minLength={2}
                maxLength={160}
                className="mt-2 min-h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-950 shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-100"
              />
            </div>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100"
            >
              Save Settings
            </button>
          </form>
        </Card>
      </section>

      <section className="mt-10">
        <SectionHeader
          eyebrow="Access"
          title="Connected Club Data"
          description="These counts summarize the account links used to show groups, attendance, comments, and sessions."
        />
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatCard label="Linked players" value={profile.linkedPlayersCount} />
          <StatCard label="Direct memberships" value={profile.directMembershipsCount} />
          <StatCard label="Player memberships" value={profile.playerMembershipsCount} />
        </div>
      </section>

      <section className="mt-10 rounded-3xl bg-white/80 p-5 text-sm font-bold text-zinc-700 shadow-sm ring-1 ring-zinc-950/5">
        <CalendarDays aria-hidden="true" className="mr-2 inline h-4 w-4 text-emerald-700" />
        Session attendance and comments remain managed from the relevant session pages.
        <Link href="/dashboard" className="ml-2 text-emerald-700 hover:text-emerald-900">
          Return to dashboard
        </Link>
      </section>
    </div>
  );
}

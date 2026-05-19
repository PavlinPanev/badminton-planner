import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck, UserCog, UsersRound } from "lucide-react";

import { getCurrentUser } from "@/auth/session";
import { Card, EmptyState, SectionHeader } from "@/components/ui/surfaces";
import { canManageUsers, getAdminUsersPage, userRoles, type AdminUserListItem } from "@/lib/admin-user-data";
import { updateUserRoleAction } from "./actions";

export const dynamic = "force-dynamic";

type AdminUsersSearchParams = {
  page?: string | string[];
  error?: string | string[];
  updated?: string | string[];
};

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

function parsePositivePage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return Math.max(Number(raw ?? "1") || 1, 1);
}

function readSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatRole(role: string) {
  return role
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function StatusBanner({ error, updated }: { error?: string; updated?: string }) {
  if (error) {
    const message =
      error === "last-admin"
        ? "The last admin cannot be demoted. Add another admin before changing this role."
        : error === "not-found"
          ? "That user no longer exists."
          : "The role update could not be applied. Check the selected user and role.";

    return (
      <Card className="mt-6 border-rose-100 bg-rose-50 p-5 text-sm font-bold text-rose-800">
        {message}
      </Card>
    );
  }

  if (updated) {
    return (
      <Card className="mt-6 border-emerald-100 bg-emerald-50 p-5 text-sm font-bold text-emerald-900">
        User role updated.
      </Card>
    );
  }

  return null;
}

function RoleBadge({ role }: { role: string }) {
  const tone =
    role === "admin"
      ? "bg-violet-100 text-violet-900 ring-violet-200"
      : role === "manager"
        ? "bg-emerald-100 text-emerald-900 ring-emerald-200"
        : role === "coach"
          ? "bg-sky-100 text-sky-900 ring-sky-200"
          : "bg-lime-100 text-lime-950 ring-lime-200";

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${tone}`}>
      {formatRole(role)}
    </span>
  );
}

function UserRow({ user, page }: { user: AdminUserListItem; page: number }) {
  return (
    <tr className="border-t border-zinc-100 align-top">
      <td className="px-4 py-4">
        <div>
          <p className="font-black text-zinc-950">{user.name}</p>
          <p className="mt-1 text-sm font-semibold text-zinc-600">{user.email}</p>
        </div>
      </td>
      <td className="px-4 py-4">
        <RoleBadge role={user.role} />
      </td>
      <td className="px-4 py-4 text-sm font-semibold text-zinc-600">
        {dateFormatter.format(new Date(user.createdAt))}
      </td>
      <td className="px-4 py-4">
        <form action={updateUserRoleAction} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <input type="hidden" name="userId" value={user.id} />
          <input type="hidden" name="page" value={page} />
          <label className="sr-only" htmlFor={`role-${user.id}`}>
            Role for {user.name}
          </label>
          <select
            id={`role-${user.id}`}
            name="role"
            defaultValue={user.role}
            className="min-h-10 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm font-bold text-zinc-800 shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-100"
          >
            {userRoles.map((role) => (
              <option key={role} value={role}>
                {formatRole(role)}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="inline-flex min-h-10 items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-black text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100"
          >
            Save
          </button>
        </form>
      </td>
    </tr>
  );
}

function PaginationControls({ page, totalPages, total }: { page: number; totalPages: number; total: number }) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="mt-6 flex flex-col gap-3 rounded-3xl bg-white p-4 text-sm font-bold text-zinc-700 shadow-sm ring-1 ring-zinc-950/5 sm:flex-row sm:items-center sm:justify-between">
      <p>
        Page {page} of {totalPages}
        <span className="font-semibold text-zinc-500"> · {total} total users</span>
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link
            href={`/admin/users?page=${page - 1}`}
            className="rounded-full border border-zinc-200 px-4 py-2 text-zinc-800 transition hover:border-emerald-300 hover:bg-emerald-50"
          >
            Previous
          </Link>
        ) : (
          <span className="rounded-full border border-zinc-100 px-4 py-2 text-zinc-300">Previous</span>
        )}
        {page < totalPages ? (
          <Link
            href={`/admin/users?page=${page + 1}`}
            className="rounded-full bg-emerald-700 px-4 py-2 text-white transition hover:bg-emerald-800"
          >
            Next
          </Link>
        ) : (
          <span className="rounded-full bg-zinc-100 px-4 py-2 text-zinc-300">Next</span>
        )}
      </div>
    </nav>
  );
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<AdminUsersSearchParams>;
}) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?next=/admin/users");
  }

  if (!canManageUsers(currentUser)) {
    redirect("/dashboard");
  }

  const resolvedSearchParams = await searchParams;
  const page = parsePositivePage(resolvedSearchParams.page);
  const error = readSearchValue(resolvedSearchParams.error);
  const updated = readSearchValue(resolvedSearchParams.updated);
  const { users, paging } = await getAdminUsersPage({ page, pageSize: 20 });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-600 via-sky-500 to-emerald-500 p-6 text-white shadow-[0_24px_70px_rgba(59,130,246,0.24)] sm:p-8">
        <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(135deg,rgba(255,255,255,0.18)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.18)_50%,rgba(255,255,255,0.18)_75%,transparent_75%)] bg-[length:34px_34px] opacity-25" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="inline-flex rounded-full bg-white/20 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-lime-100 ring-1 ring-white/30">
              Admin panel
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-normal sm:text-5xl">
              User Management
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-50">
              Review club accounts and update global platform roles.
            </p>
          </div>
          <div className="rounded-3xl bg-white/15 p-5 ring-1 ring-white/30 backdrop-blur">
            <UsersRound aria-hidden="true" className="h-16 w-16 text-lime-100" />
            <p className="mt-3 text-sm font-black uppercase tracking-[0.16em] text-white/90">
              {paging.total} users
            </p>
          </div>
        </div>
      </section>

      <StatusBanner error={error} updated={updated} />

      <section className="mt-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            eyebrow="Protected"
            title="Global Users"
            description="Only admins can see this page or change global user roles."
          />
          <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-zinc-700 shadow-sm ring-1 ring-zinc-950/5">
            <ShieldCheck aria-hidden="true" className="h-4 w-4 text-emerald-700" />
            Signed in as {currentUser.role}
          </div>
        </div>

        {users.length ? (
          <Card className="mt-6 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-100 text-left">
                <thead className="bg-zinc-50 text-xs font-black uppercase tracking-[0.14em] text-zinc-500">
                  <tr>
                    <th scope="col" className="px-4 py-3">
                      User
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Current Role
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Created
                    </th>
                    <th scope="col" className="px-4 py-3 text-right">
                      Change Role
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 bg-white">
                  {users.map((user) => (
                    <UserRow key={user.id} user={user} page={paging.page} />
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <div className="mt-6">
            <EmptyState
              title="No users found"
              description="There are no user accounts to manage yet. New registered accounts will appear here."
            />
          </div>
        )}

        <PaginationControls page={paging.page} totalPages={paging.totalPages} total={paging.total} />
      </section>

      <section className="mt-10 rounded-3xl bg-white/80 p-5 text-sm font-bold text-zinc-700 shadow-sm ring-1 ring-zinc-950/5">
        <UserCog aria-hidden="true" className="mr-2 inline h-4 w-4 text-emerald-700" />
        Group-level memberships remain managed from each group page; this panel only changes global account roles.
      </section>
    </div>
  );
}

import Link from "next/link";
import { AlertTriangle, PartyPopper } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/auth/session";
import { Card } from "@/components/ui/surfaces";
import { acceptGroupInvite } from "../../invite-actions";

export default async function JoinGroupPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ code?: string | string[] }>;
}) {
  const { id } = await params;
  const groupId = Number(id);

  if (!Number.isInteger(groupId)) {
    notFound();
  }

  const resolvedSearchParams = await searchParams;
  const code = Array.isArray(resolvedSearchParams.code) ? resolvedSearchParams.code[0] : resolvedSearchParams.code;
  const invitePath = `/groups/${groupId}/join?code=${encodeURIComponent(code ?? "")}`;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(invitePath)}`);
  }

  const result = await acceptGroupInvite(groupId, code ?? "", user.id);
  const success = result.status === "success";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Card className="overflow-hidden">
        <div className={success ? "h-2 bg-gradient-to-r from-emerald-400 via-lime-300 to-sky-400" : "h-2 bg-gradient-to-r from-rose-500 via-amber-400 to-violet-500"} />
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${
                success ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
              }`}
            >
              {success ? (
                <PartyPopper aria-hidden="true" className="h-6 w-6" />
              ) : (
                <AlertTriangle aria-hidden="true" className="h-6 w-6" />
              )}
            </span>
            <div>
              <p
                className={`text-xs font-black uppercase tracking-[0.18em] ${
                  success ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                Group invite
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-normal text-zinc-950">{result.title}</h1>
              <p className="mt-4 text-sm leading-6 text-zinc-700">{result.message}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {success ? (
              <Link
                href={`/groups/${result.groupId}`}
                className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100"
              >
                Open {result.groupTitle}
              </Link>
            ) : null}
            <Link
              href="/groups"
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-black text-zinc-800 transition hover:bg-zinc-50 focus:outline-none focus:ring-4 focus:ring-zinc-100"
            >
              My groups
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

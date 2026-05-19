import Link from "next/link";
import { AlertTriangle, Trash2 } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/auth/session";
import { Card } from "@/components/ui/surfaces";
import { getAnnouncementFormContextForUser, getEditableAnnouncementForUser } from "@/lib/group-data";
import { deleteAnnouncementAction } from "../../../../../announcement-actions";

export default async function DeleteGroupAnnouncementPage({
  params,
}: {
  params: Promise<{ id: string; announcementId: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/groups");
  }

  const { id, announcementId: rawAnnouncementId } = await params;
  const groupId = Number(id);
  const announcementId = Number(rawAnnouncementId);

  if (!Number.isInteger(groupId) || !Number.isInteger(announcementId)) {
    notFound();
  }

  const [contextResult, announcementResult] = await Promise.all([
    getAnnouncementFormContextForUser(groupId, user),
    getEditableAnnouncementForUser(groupId, announcementId, user),
  ]);

  if (contextResult.status === "not-found" || announcementResult.status === "not-found") {
    notFound();
  }

  if (contextResult.status === "forbidden" || announcementResult.status === "forbidden") {
    redirect(`/groups/${groupId}`);
  }

  const context = contextResult.context;
  const announcement = announcementResult.announcement;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href={`/groups/${groupId}`} className="text-sm font-black text-emerald-700 hover:text-emerald-900">
        Back to group
      </Link>

      <Card className="mt-6 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-rose-500 via-amber-400 to-violet-500" />
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rose-100 text-rose-700">
              <AlertTriangle aria-hidden="true" className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-700">Confirm delete</p>
              <h1 className="mt-3 text-3xl font-black tracking-normal text-zinc-950">Delete announcement?</h1>
              <p className="mt-4 text-sm leading-6 text-zinc-700">
                This will remove the announcement "{announcement.title}" from {context.group.title}.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 rounded-3xl bg-rose-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-bold text-rose-800">
              Consider editing the announcement if you only need to adjust the wording.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/groups/${groupId}`}
                className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-black text-zinc-800 transition hover:bg-zinc-50 focus:outline-none focus:ring-4 focus:ring-zinc-100"
              >
                Cancel
              </Link>
              <form action={deleteAnnouncementAction}>
                <input type="hidden" name="groupId" value={groupId} />
                <input type="hidden" name="announcementId" value={announcement.id} />
                <button
                  type="submit"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-100"
                >
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                  Delete announcement
                </button>
              </form>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

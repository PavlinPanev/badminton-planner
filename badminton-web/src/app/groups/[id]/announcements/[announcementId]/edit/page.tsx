import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/auth/session";
import { SectionHeader } from "@/components/ui/surfaces";
import { getAnnouncementFormContextForUser, getEditableAnnouncementForUser } from "@/lib/group-data";
import { updateAnnouncementAction } from "../../../../../announcement-actions";
import { AnnouncementForm } from "../../../../../announcement-form";

export default async function EditGroupAnnouncementPage({
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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href={`/groups/${groupId}`} className="text-sm font-black text-emerald-700 hover:text-emerald-900">
        Back to group
      </Link>

      <section className="mt-6 rounded-[2rem] bg-gradient-to-br from-sky-600 via-emerald-500 to-lime-400 p-6 text-white shadow-[0_24px_70px_rgba(16,185,129,0.24)] sm:p-8">
        <p className="inline-flex rounded-full bg-white/20 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-lime-100 ring-1 ring-white/30">
          Announcement board
        </p>
        <h1 className="mt-5 text-4xl font-black tracking-normal sm:text-5xl">Edit announcement</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-50">
          Update the announcement for {context.group.title}.
        </p>
      </section>

      <section className="mt-8">
        <SectionHeader
          eyebrow="Group updates"
          title="Edit Announcement"
          description="Only group coaches, managers, and admins can update announcements."
        />
        <div className="mt-5">
          <AnnouncementForm
            action={updateAnnouncementAction}
            groupId={context.group.id}
            announcement={announcement}
            submitLabel="Save changes"
          />
        </div>
      </section>
    </div>
  );
}

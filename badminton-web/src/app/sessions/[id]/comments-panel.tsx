"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { MessageCircle, Pencil, Send, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/ui/surfaces";
import {
  addSessionCommentAction,
  deleteSessionCommentAction,
  updateSessionCommentAction,
  type CommentActionState,
} from "./actions";

type SessionComment = {
  id: number;
  userId: number;
  text: string;
  commentedAt: string;
  authorName: string;
};

type CommentsPanelProps = {
  sessionId: number;
  comments: SessionComment[];
  currentUserId: number;
  canManageComments: boolean;
};

function ActionMessage({ state }: { state: CommentActionState }) {
  if (!state.error && !state.success) {
    return null;
  }

  return (
    <p
      className={`rounded-2xl px-4 py-3 text-sm font-bold ${
        state.error ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200" : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
      }`}
    >
      {state.error ?? state.success}
    </p>
  );
}

function SubmitButton({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={`${className} disabled:cursor-not-allowed disabled:opacity-60`}>
      {pending ? "Saving..." : children}
    </button>
  );
}

function formatCommentDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function CommentsPanel({ sessionId, comments, currentUserId, canManageComments }: CommentsPanelProps) {
  const [addState, addAction] = useActionState(addSessionCommentAction, {});
  const [editState, editAction] = useActionState(updateSessionCommentAction, {});
  const [deleteState, deleteAction] = useActionState(deleteSessionCommentAction, {});

  return (
    <div className="mt-5 space-y-4">
      <form
        action={addAction}
        className="rounded-3xl border border-white/80 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-zinc-950/5"
      >
        <input type="hidden" name="sessionId" value={sessionId} />
        <label className="text-sm font-black text-zinc-950" htmlFor="new-session-comment">
          Add a comment
        </label>
        <textarea
          id="new-session-comment"
          name="text"
          rows={3}
          maxLength={1000}
          placeholder="Share a coach note, pickup reminder, or attendance update."
          className="mt-3 w-full resize-y rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm leading-6 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
        />
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold text-zinc-500">Keep notes friendly and useful for the session group.</p>
          <SubmitButton className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200">
            <Send aria-hidden="true" className="h-4 w-4" />
            Post comment
          </SubmitButton>
        </div>
      </form>
      <ActionMessage state={addState} />
      <ActionMessage state={editState} />
      <ActionMessage state={deleteState} />

      {comments.length ? (
        <div className="space-y-3">
          {comments.map((comment) => {
            const canModify = comment.userId === currentUserId || canManageComments;

            return (
              <article key={comment.id} className="rounded-3xl border border-white/80 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="inline-flex items-center gap-2 text-sm font-black text-zinc-950">
                      <MessageCircle aria-hidden="true" className="h-4 w-4 text-sky-600" />
                      {comment.authorName}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">{formatCommentDate(comment.commentedAt)}</p>
                  </div>
                  {canModify ? (
                    <div className="flex gap-2">
                      <details className="group">
                        <summary className="inline-flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-black text-sky-700 transition hover:bg-sky-100">
                          <Pencil aria-hidden="true" className="h-4 w-4" />
                          Edit
                        </summary>
                        <form action={editAction} className="mt-3 w-full rounded-2xl bg-sky-50 p-3 sm:w-96">
                          <input type="hidden" name="sessionId" value={sessionId} />
                          <input type="hidden" name="commentId" value={comment.id} />
                          <textarea
                            name="text"
                            rows={4}
                            maxLength={1000}
                            defaultValue={comment.text}
                            className="w-full resize-y rounded-2xl border border-sky-200 bg-white px-4 py-3 text-sm leading-6 text-zinc-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                          />
                          <div className="mt-3 flex justify-end">
                            <SubmitButton className="inline-flex min-h-10 items-center justify-center rounded-2xl bg-sky-600 px-4 py-2 text-xs font-black text-white transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-200">
                              Save edit
                            </SubmitButton>
                          </div>
                        </form>
                      </details>
                      <form action={deleteAction}>
                        <input type="hidden" name="sessionId" value={sessionId} />
                        <input type="hidden" name="commentId" value={comment.id} />
                        <SubmitButton className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-black text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-4 focus:ring-rose-100">
                          <Trash2 aria-hidden="true" className="h-4 w-4" />
                          Delete
                        </SubmitButton>
                      </form>
                    </div>
                  ) : null}
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-700">{comment.text}</p>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No comments yet" description="No coach notes or parent comments have been added." />
      )}
    </div>
  );
}

CREATE INDEX "sessions_group_date_time_idx" ON "sessions" USING btree ("group_id","session_date","start_time");--> statement-breakpoint
CREATE INDEX "sessions_venue_date_idx" ON "sessions" USING btree ("venue_id","session_date");--> statement-breakpoint
CREATE INDEX "sessions_coach_date_idx" ON "sessions" USING btree ("coach_user_id","session_date");--> statement-breakpoint
CREATE INDEX "session_attendance_session_id_idx" ON "session_attendance" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "session_attendance_player_id_idx" ON "session_attendance" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX "session_comments_session_time_idx" ON "session_comments" USING btree ("session_id","commented_at");

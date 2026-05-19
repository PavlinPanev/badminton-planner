const html = String.raw;

export async function GET() {
  return new Response(
    html`<!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Badminton Planner API</title>
          <style>
            body {
              margin: 0;
              font-family: Arial, sans-serif;
              color: #18181b;
              background: #fafaf9;
            }
            main {
              max-width: 920px;
              margin: 0 auto;
              padding: 32px 20px;
            }
            section {
              margin-top: 24px;
              padding: 20px;
              border: 1px solid #e4e4e7;
              border-radius: 8px;
              background: white;
            }
            code,
            pre {
              font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
            }
            pre {
              overflow: auto;
              padding: 12px;
              border-radius: 6px;
              background: #f4f4f5;
            }
            .method {
              font-weight: 700;
              color: #047857;
            }
          </style>
        </head>
        <body>
          <main>
            <h1>Badminton Planner API</h1>
            <p>Use <code>Authorization: Bearer &lt;token&gt;</code> for authenticated endpoints.</p>

            <section>
              <h2><span class="method">POST</span> /api/auth/login</h2>
              <pre>{"email":"manager@badminton.test","password":"pass123"}</pre>
              <p>Returns a JWT token and user profile.</p>
            </section>

            <section>
              <h2><span class="method">GET</span> /api/sessions?page=1&pageSize=20</h2>
              <p>Lists active sessions for the authenticated user's groups.</p>
            </section>

            <section>
              <h2><span class="method">GET</span> /api/sessions/[id]</h2>
              <p>Returns session details, attendance summary, visible attendance records, and comments.</p>
            </section>

            <section>
              <h2><span class="method">POST</span> /api/sessions/[id]/attendance</h2>
              <pre>{"playerId":1,"status":"attending","note":"Optional short note"}</pre>
              <p>Status values: <code>attending</code>, <code>absent</code>, <code>maybe</code>.</p>
            </section>

            <section>
              <h2><span class="method">GET</span> /api/sessions/[id]/comments</h2>
              <p>Lists session comments visible to the authenticated user.</p>
            </section>

            <section>
              <h2><span class="method">POST</span> /api/sessions/[id]/comments</h2>
              <pre>{"text":"Bring spare rackets for warmup."}</pre>
              <p>Adds a new session comment for users who can view the session.</p>
            </section>

            <section>
              <h2><span class="method">PATCH</span> /api/sessions/[id]/comments/[commentId]</h2>
              <pre>{"text":"Updated comment text."}</pre>
              <p>Edits a comment owned by the user or manageable by the user's group role.</p>
            </section>

            <section>
              <h2><span class="method">GET</span> /api/events?page=1&pageSize=20</h2>
              <p>Lists upcoming public events.</p>
            </section>

            <section>
              <h2><span class="method">GET</span> /api/events/[id]</h2>
              <p>Returns event details and registrations.</p>
            </section>

            <section>
              <h2><span class="method">POST</span> /api/events/[id]/register</h2>
              <pre>{"playerId":1}</pre>
              <p><code>playerId</code> is optional for direct user registrations.</p>
            </section>

            <section>
              <h2><span class="method">POST</span> /api/events/[id]/cancel-registration</h2>
              <pre>{"playerId":1}</pre>
              <p>Marks the matching registration as canceled.</p>
            </section>
          </main>
        </body>
      </html>`,
    {
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    },
  );
}

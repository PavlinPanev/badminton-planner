# Badminton Club Planner
Badminton Planner is a full-stack club planning system for badminton clubs. It helps club managers create and organize groups, coaches manage sessions and attendance, and parents or players view upcoming sessions, mark attendance, and follow comments and events.
“Badminton Club Planner” app: a software product for a badminton club to organize training groups, sessions, venues, attendance and club events.
· The app holds training groups, where badminton sessions are organized.
· Groups have coaches, managers, players and parents / members.
· Sessions are announced in groups and members can mark attendance / absence / maybe, comment and view session details.
· Club events such as camps, tournaments and social badminton sessions can be announced and users can register for them.
· The app can use public information from a real badminton club website for demo venues, public training types and public event categories, but all personal user, parent and child data must be generated demo data.

The project is organized as an npm workspace with a Next.js web app, an Expo mobile app, and a shared package for cross-app types and utilities.

- `badminton-web/`: Next.js web application and backend/API layer using React, Tailwind CSS, Neon Postgres, and Drizzle ORM.
- `badminton-mobile/`: Expo React Native app using Expo Router and the RESTful backend API with Bearer token authentication.
- `badminton-shared/`: shared types, constants, validation helpers, and framework-neutral utilities.

The web app supports club management and coaching workflows. The mobile app focuses on logged-in users viewing groups and sessions, marking attendance, and reading comments and events.

# Roles in the App
· Visitor: can view home page, public venues, public events and register in the app.
· User: can manage own profile, view public events and join a training group by invitation.
· Parent / group member: can view child training sessions, mark attendance, comment on sessions, view announcements.
· Coach / group manager: can create and manage training sessions, view attendance and manage group communication.
· Club manager: can manage venues, groups, coaches, members, sessions and events.
· Admins (optional): can view / manage all users, groups, venues, sessions and events.

# Visitors
Visitors are anonymous actors who visit the app Web site.
· Visitors can see the app home page and public club information.
· Visitors can view public venues and public events.
· Visitors can register in the app by email + password.
· Visitors cannot view private training groups, child/player data, attendance or comments.

# Registered Users
Registered users in the app have a profile with name, email and photo (optional) and can login / logout.
· Registered users can manage their own profile.
· Registered users can view public events and club information.
· Registered users can join an existing training group by invitation.
· Once an invite link is accepted, a user joins the group and becomes a group member.
· A user can be connected to one or more players / children.
· For demo purposes, players and children should use generated sample names, not real personal data.

# Coaches and Club Managers
Coaches and club managers organize badminton training activity.
· Coaches manage the training sessions in their assigned groups.
· Club managers organize the club structure: venues, groups, coaches, players and events.
· Coaches / managers can create / edit / cancel / delete training sessions.
· Training sessions hold: date, time, venue, group, coach, capacity, canceled (yes/no).
· Club managers can invite users to join groups by sharing an invite link.
· Club managers can promote / remove other group members as coaches or managers.
· Club managers can remove users / players from their groups.
· Club managers can create club events: tournaments, camps, social badminton sessions and open trainings.

# Group Members and Training Sessions
Group members can browse training sessions in their groups: upcoming, current and past sessions.
· Always display the state of each session: upcoming | current | past, note if canceled, full capacity | under capacity | over capacity.
· A session is upcoming if its start time is not yet reached.
· At its start time the session becomes current until its end time.
· After the end time the session becomes past.
· A session can be canceled by a coach or club manager, so it will not happen.
· A session is open for attendance updates when it is upcoming or current and is not canceled.
· Display the list of expected players and attendance responses for the session.
Group members can mark attendance for a session:
· A parent / member can mark a player as attending.
· A parent / member can mark a player as not attending.
· A parent / member can mark a player as maybe.
· A parent / member can update the attendance response before the session starts.
· A parent / member can leave a short attendance note, e.g. “We will be 10 minutes late” or “Cannot attend today”.
· Coaches can view all attendance responses and prepare the session according to the expected number of players.
· Do not store real sensitive children’s data in the public demo app.
Group members can post comments on training sessions:
· Examples: “Will be 10 mins late”, “Can we borrow a racket?”, “Please bring indoor shoes”, “Tournament preparation today”, …
· Comments are listed after the session details.
· Comments can be edited / deleted by their owner and by coaches / group managers.

# Club Events
Club events are special activities outside regular training sessions.
· Examples: children’s tournament, amateur tournament, training camp, social badminton weekend, open day.
· Events hold: title, description, venue, date, time, capacity, visibility, canceled (yes/no).
· Users can view public events.
· Logged-in users can register / cancel registration for events if registration is open.
· Club managers can create / edit / cancel / delete events.

# Web App and Mobile App
· The Web app is the primary app for this project. It implements the entire app functionality: users, group management, group members, venue management, session management, event management, attendance and dashboards.
· The mobile app is an additional, scope-limited app, which implements only the most important parent / member functionality: login / register, view sessions, mark attendance, view comments and view / join events.

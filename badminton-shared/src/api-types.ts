export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type PagedResponse<T> = {
  data: T[];
  paging: PaginationMeta;
};

export type DataResponse<T> = {
  data: T;
};

export type AuthRole = "admin" | "manager" | "coach" | "parent";

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  role: AuthRole;
  photoUrl: string | null;
};

export type AuthResponse = {
  token: string;
  tokenType: "Bearer";
  user: AuthUser;
};

export type GroupRole = "manager" | "coach" | "parent" | "player";

export type AttendanceStatus = "attending" | "absent" | "maybe" | "no response";

export type AttendanceSummary = Record<AttendanceStatus, number>;

export type SessionListItem = {
  id: number;
  group: {
    id: number;
    title: string;
  };
  venue: {
    name: string;
  };
  date: string;
  formattedDate: string;
  time: string;
  state: string;
  canceled: boolean;
  capacity: number | null;
  capacityState: string;
  attendanceSummary: AttendanceSummary;
  commentsCount: number;
};

export type SessionAttendance = {
  memberId: string;
  playerId: number | null;
  userId: number | null;
  name: string;
  role: string;
  status: AttendanceStatus;
  note: string | null;
};

export type SessionComment = {
  id: number;
  userId: number;
  text: string;
  authorName: string;
  commentedAt: string;
  canEdit: boolean;
};

export type SessionDetail = {
  id: number;
  date: string;
  time: string;
  venue: {
    name: string;
  };
  group: {
    id: number;
    title: string;
  };
  coach: {
    name: string | null;
  };
  state: string;
  active: boolean;
  canceled: boolean;
  capacity: number | null;
  capacityState: string;
  attendanceSummary: AttendanceSummary;
  attendance: SessionAttendance[];
  comments: SessionComment[];
};

export type SessionsResponse = PagedResponse<SessionListItem>;
export type SessionDetailResponse = DataResponse<SessionDetail>;

export type RegistrationState = "registered" | "waitlisted" | "canceled" | "not_registered";

export type EventListItem = {
  id: number;
  title: string;
  description: string | null;
  eventType: "public" | "member";
  eventDate: string;
  capacity: number | null;
  canceled: boolean;
  registrationState: RegistrationState;
  venue: {
    id: number;
    name: string;
    city: string;
  };
};

export type EventRegistration = {
  id: number;
  status: Exclude<RegistrationState, "not_registered">;
  registeredAt: string;
  userName: string;
  playerName: string | null;
};

export type EventDetail = EventListItem & {
  venue: EventListItem["venue"] & {
    address: string;
  };
  registrations: EventRegistration[];
};

export type EventsResponse = PagedResponse<EventListItem>;
export type EventDetailResponse = DataResponse<EventDetail>;

export type AnnouncementListItem = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  group: {
    id: number;
    title: string;
  };
  author: {
    id: number;
    name: string;
    role: string;
  };
};

export type AnnouncementsResponse = PagedResponse<AnnouncementListItem>;

export type GroupListItem = {
  id: number;
  title: string;
  description: string | null;
  level: string;
  minAge: number | null;
  maxAge: number | null;
  ageRangeLabel: string;
  venue: {
    name: string;
    city: string;
  };
  stats: {
    memberCount: number;
    playerCount: number;
    sessionCount: number;
  };
  roles: GroupRole[];
  canManage: boolean;
};

export type GroupDetail = GroupListItem & {
  venue: {
    name: string;
    city: string;
    address: string;
    description: string | null;
  };
  currentUserRole: GroupRole | null | string;
  canLeave: boolean;
  canManageSessions: boolean;
  canManageAnnouncements: boolean;
  coaches: {
    id: number;
    name: string;
    email: string;
    role: GroupRole | string;
  }[];
  sessions: {
    id: number;
    sessionDate: string;
    startTime: string;
    capacity: number | null;
    canceled: boolean;
    state: string;
    venueName: string;
    coachName: string | null;
  }[];
  announcements: {
    id: number;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    authorName: string;
    authorRole: string;
  }[];
};

export type GroupDetailResponse = {
  data: GroupDetail;
};

export type GroupsResponse = PagedResponse<GroupListItem>;

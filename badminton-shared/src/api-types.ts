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

export type GroupRole = "manager" | "coach" | "parent" | "player";

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

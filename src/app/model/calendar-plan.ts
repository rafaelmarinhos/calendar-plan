export interface CalendarPlan {
  id?: string;
  name?: string;
  startsAt?: string;
  endsAt?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  originalId?: string;
  branchId?: string;
  branchName?: string;
  permissions?: any[];
  revised?: boolean;
  revisedAt?: string;
  revisedBy?: string;
}

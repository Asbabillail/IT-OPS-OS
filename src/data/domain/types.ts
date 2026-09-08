export type StudentId = `STU-${string}`;
export type FacultyId = `FAC-${string}`;
export type DistributionId = `DIST-${string}`;
export type ByodId = `BYOD-${string}`;
export type RepairId = `REP-${string}`;
export type AppleCareClaimId = `AC-${string}`;
export type ReturnId = `RET-${string}`;
export type ReleaseId = `REL-${string}`;

export type DeviceStatus =
  | "Assigned"
  | "Available"
  | "In Repair"
  | "Awaiting Parts";

export type Student = {
  id: StudentId;
  name: string;
  grade: string;
  email: string;
  enrollmentStatus: "Active" | "Inactive";
  guardian: {
    name: string;
    phone: string;
  };
};

export type Faculty = {
  id: FacultyId;
  name: string;
  department: string;
  email: string;
  employmentStatus: "Active" | "Inactive";
};

export type Device = {
  serial: string;
  assetTag: string;
  model: string;
  storage: string;
  status: DeviceStatus;
  purchaseDate: string;
  warrantyStatus: "Active" | "Expired";
  appleCareStatus: "Active" | "Expired" | "None";
  assignedStudentId?: StudentId;
  assignedFacultyId?: FacultyId;
};

export type TimelineEvent = {
  title: string;
  description: string;
  occurredAt?: string;
};
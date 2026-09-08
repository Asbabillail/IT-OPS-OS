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
export type ReturnRecord = {
  id: ReturnId;
  studentId: StudentId;
  deviceSerial: string;
  returnStatus: "Received" | "Inspection Required";
  condition: "Good" | "Screen Damage";
  accessories: "Complete" | "Missing Charger";
  outcome: "Ready for Release" | "Repair Required";
  initiatedDate: string;
  receivedDate: string;
  inspectedDate: string | null;
  assignmentClosedDate: string | null;
  inspectionNotes: string;
  repairId: RepairId | null;
};

export type ReleaseRecord = {
  id: ReleaseId;
  deviceSerial: string;
  source:
    | {
        type: "Return";
        id: ReturnId;
      }
    | {
        type: "Repair";
        id: RepairId;
      };
  eligibility: "Eligible" | "Blocked";
  action: "Release to Available" | "None";
  status: "Ready" | "Awaiting Repair Completion";
  validation:
    | "Return workflow complete"
    | "Repair workflow incomplete";
  releaseDate: string | null;
  resultingDeviceState: DeviceStatus | null;
};
export type RepairRecord = {
  id: RepairId;
  deviceSerial: string;
  ownerStudentId: StudentId | null;
  issue: string;
  priority: "High" | "Medium" | "Low";
  status: "In Repair" | "Awaiting Parts";
  openedDate: string;
  diagnosis: string;
  serviceRoute: "External Service" | "Internal Repair";
  sentForServiceDate: string;
  completedDate: string | null;
  verifiedDate: string | null;
};
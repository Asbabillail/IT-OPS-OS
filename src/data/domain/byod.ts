import type { ByodRecord } from "./types";

export const byodRecords = [
  {
    id: "BYOD-2026-001",
    owner: {
      type: "Student",
      id: "STU-2026-089",
    },
    deviceModel: "iPad Air",
    serial: "BYOD-SK-001",
    ownership: "Student Owned",
    enrollmentStatus: "Enrolled",
    complianceStatus: "Compliant",
    registeredDate: "2026-09-01",
    enrolledDate: "2026-09-02",
    reviewedDate: "2026-09-02",
  },
  {
    id: "BYOD-2026-002",
    owner: {
      type: "Faculty",
      id: "FAC-2026-019",
    },
    deviceModel: "iPad Pro",
    serial: "BYOD-OS-002",
    ownership: "Faculty Owned",
    enrollmentStatus: "Pending",
    complianceStatus: "Review Required",
    registeredDate: "2026-09-08",
    enrolledDate: null,
    reviewedDate: null,
  },
] satisfies readonly ByodRecord[];

export function getByodRecordById(
  id: string,
): ByodRecord | undefined {
  return byodRecords.find((record) => record.id === id);
}
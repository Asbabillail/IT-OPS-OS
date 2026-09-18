import type { ReturnRecord } from "./types";

export const returns = [
  {
    id: "RET-2026-001",
    studentId: "STU-2026-041",
    deviceSerial: "DMQR92KX",
    returnStatus: "Received",
    condition: "Good",
    accessories: "Complete",
    outcome: "Ready for Release",
    initiatedDate: "2026-09-03",
    receivedDate: "2026-09-04",
    inspectedDate: "2026-09-04",
    assignmentClosedDate: "2026-09-04",
    inspectionNotes:
      "Device returned in good operational condition.",
    repairId: null,
  },
  {
    id: "RET-2026-002",
    studentId: "STU-2026-089",
    deviceSerial: "F9FT81LP",
    returnStatus: "Inspection Required",
    condition: "Screen Damage",
    accessories: "Missing Charger",
    outcome: "Repair Required",
    initiatedDate: "2026-09-08",
    receivedDate: "2026-09-08",
    inspectedDate: null,
    assignmentClosedDate: null,
    inspectionNotes:
      "Visible screen damage reported. Charger not returned with device.",
    repairId: "REP-2026-002",
  },
] satisfies readonly ReturnRecord[];

export function getReturnById(
  id: string,
): ReturnRecord | undefined {
  return returns.find((record) => record.id === id);
}

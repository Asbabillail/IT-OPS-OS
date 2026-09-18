import type { RepairRecord } from "./types";

export const repairs = [
  {
    id: "REP-2026-001",
    deviceSerial: "DMQR92KX",
    ownerStudentId: "STU-2026-041",
    issue: "Cracked Display",
    priority: "High",
    status: "In Repair",
    openedDate: "2026-09-05",
    diagnosis: "Display assembly damaged after impact.",
    serviceRoute: "External Service",
    sentForServiceDate: "2026-09-06",
    completedDate: null,
    verifiedDate: null,
  },
  {
    id: "REP-2026-002",
    deviceSerial: "F9FT81LP",
    ownerStudentId: null,
    issue: "Battery Health",
    priority: "Medium",
    status: "Awaiting Parts",
    openedDate: "2026-09-07",
    diagnosis: "Battery capacity below operational threshold.",
    serviceRoute: "Internal Repair",
    sentForServiceDate: "2026-09-07",
    completedDate: null,
    verifiedDate: null,
  },
] satisfies readonly RepairRecord[];

export function getRepairById(
  id: string,
): RepairRecord | undefined {
  return repairs.find((repair) => repair.id === id);
}
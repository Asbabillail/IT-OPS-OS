import type { AppleCareClaim } from "./types";

export const appleCareClaims = [
  {
    id: "AC-2026-001",
    deviceSerial: "DMQR92KX",
    repairId: "REP-2026-001",
    ownerStudentId: "STU-2026-041",
    coverage: "Active",
    claimStatus: "Submitted",
    issue: "Accidental Damage",
    serviceType: "Display Repair",
    submittedDate: "2026-09-06",
    decisionDate: null,
  },
  {
    id: "AC-2026-002",
    deviceSerial: "F9FT81LP",
    repairId: "REP-2026-002",
    ownerStudentId: null,
    coverage: "Active",
    claimStatus: "Not Required",
    issue: "Battery Service",
    serviceType: "Internal Battery Service",
    submittedDate: null,
    decisionDate: null,
  },
] satisfies readonly AppleCareClaim[];

export function getAppleCareClaimById(
  id: string,
): AppleCareClaim | undefined {
  return appleCareClaims.find((claim) => claim.id === id);
}
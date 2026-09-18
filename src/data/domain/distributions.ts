import type { DistributionRecord } from "./types";

export const distributions = [
  {
    id: "DIST-2026-001",
    studentId: "STU-2026-041",
    deviceSerial: "DMQR92KX",
    status: "Verified",
    signatureStatus: "Verified",
    handoverDate: "2026-08-25",
    returnedDate: "2026-08-26",
    verifiedDate: "2026-08-26",
  },
  {
    id: "DIST-2026-002",
    studentId: "STU-2026-089",
    deviceSerial: "F9FT81LP",
    status: "Pending Signature",
    signatureStatus: "Awaiting Paper Return",
    handoverDate: "2026-09-08",
    returnedDate: null,
    verifiedDate: null,
  },
] satisfies readonly DistributionRecord[];

export function getDistributionById(
  id: string,
): DistributionRecord | undefined {
  return distributions.find(
    (distribution) => distribution.id === id,
  );
}
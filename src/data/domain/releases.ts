import type { ReleaseRecord } from "./types";

export const releases = [
  {
    id: "REL-2026-001",
    deviceSerial: "DMQR92KX",
    source: {
      type: "Return",
      id: "RET-2026-001",
    },
    eligibility: "Eligible",
    action: "Release to Available",
    status: "Ready",
    validation: "Return workflow complete",
    releaseDate: null,
    resultingDeviceState: null,
  },
  {
    id: "REL-2026-002",
    deviceSerial: "F9FT81LP",
    source: {
      type: "Repair",
      id: "REP-2026-002",
    },
    eligibility: "Blocked",
    action: "None",
    status: "Awaiting Repair Completion",
    validation: "Repair workflow incomplete",
    releaseDate: null,
    resultingDeviceState: null,
  },
] satisfies readonly ReleaseRecord[];

export function getReleaseById(
  id: string,
): ReleaseRecord | undefined {
  return releases.find((release) => release.id === id);
}

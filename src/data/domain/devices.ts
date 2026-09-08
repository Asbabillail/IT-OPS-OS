import type { Device } from "./types";

export const devices: readonly Device[] = [
  {
    serial: "DMQR92KX",
    assetTag: "YIS-PAD-0412",
    model: "iPad",
    storage: "256 GB",
    status: "Assigned",
    purchaseDate: "2026-01-15",
    warrantyStatus: "Active",
    appleCareStatus: "Active",
    assignedStudentId: "STU-2026-041",
  },
  {
    serial: "F9FT81LP",
    assetTag: "YIS-PAD-0413",
    model: "iPad",
    storage: "256 GB",
    status: "Awaiting Parts",
    purchaseDate: "2026-01-15",
    warrantyStatus: "Active",
    appleCareStatus: "Active",
  },
];

export function getDeviceBySerial(
  serial: string,
): Device | undefined {
  return devices.find((device) => device.serial === serial);
}

export function getDeviceByAssetTag(
  assetTag: string,
): Device | undefined {
  return devices.find(
    (device) => device.assetTag === assetTag,
  );
}
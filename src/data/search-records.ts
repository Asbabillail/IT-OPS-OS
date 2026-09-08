import {
  appleCareClaims,
  byodRecords,
  devices,
  distributions,
  faculty,
  releases,
  repairs,
  returns,
  students,
} from "@/data/domain";

export type SearchRecordType =
  | "student"
  | "faculty"
  | "device"
  | "distribution"
  | "byod"
  | "repair"
  | "applecare"
  | "return"
  | "release";

export type SearchRecord = {
  id: string;
  type: SearchRecordType;
  title: string;
  subtitle: string;
  identifiers: string[];
  href: string;
};

const studentSearchRecords: SearchRecord[] = students.map(
  (student) => ({
    id: `student-${student.id.toLowerCase()}`,
    type: "student",
    title: student.name,
    subtitle: `Student · Grade ${student.grade}`,
    identifiers: [
      student.id,
      student.name,
      student.email,
      student.grade,
      student.guardian.name,
      student.guardian.phone,
    ],
    href: `/students/${student.id}`,
  }),
);

const facultySearchRecords: SearchRecord[] = faculty.map(
  (member) => ({
    id: `faculty-${member.id.toLowerCase()}`,
    type: "faculty",
    title: member.name,
    subtitle: `Faculty · ${member.department}`,
    identifiers: [
      member.id,
      member.name,
      member.email,
      member.department,
    ],
    href: `/faculty/${member.id}`,
  }),
);

const deviceSearchRecords: SearchRecord[] = devices.map(
  (device) => ({
    id: `device-${device.serial.toLowerCase()}`,
    type: "device",
    title: `${device.model} ${device.serial}`,
    subtitle: `Device · ${device.status}`,
    identifiers: [
      device.serial,
      device.assetTag,
      device.model,
      device.storage,
      device.status,
      `${device.model} ${device.serial}`,
    ],
    href: `/devices/${device.serial}`,
  }),
);

const distributionSearchRecords: SearchRecord[] =
  distributions.map((distribution) => {
    const student = students.find(
      (candidate) =>
        candidate.id === distribution.studentId,
    );

    const device = devices.find(
      (candidate) =>
        candidate.serial === distribution.deviceSerial,
    );

    return {
      id: `distribution-${distribution.id.toLowerCase()}`,
      type: "distribution",
      title: distribution.id,
      subtitle: `Distribution · ${distribution.status}`,
      identifiers: [
        distribution.id,
        distribution.studentId,
        distribution.deviceSerial,
        distribution.status,
        distribution.signatureStatus,
        student?.name ?? "",
        student?.email ?? "",
        device?.assetTag ?? "",
      ],
      href: `/distribution/${distribution.id}`,
    };
  });

const byodSearchRecords: SearchRecord[] = byodRecords.map(
  (record) => {
    const owner =
      record.owner.type === "Student"
        ? students.find(
            (student) => student.id === record.owner.id,
          )
        : faculty.find(
            (member) => member.id === record.owner.id,
          );

    return {
      id: `byod-${record.id.toLowerCase()}`,
      type: "byod",
      title: record.id,
      subtitle: `BYOD · ${record.enrollmentStatus} · ${record.complianceStatus}`,
      identifiers: [
        record.id,
        record.owner.id,
        owner?.name ?? "",
        owner?.email ?? "",
        record.deviceModel,
        record.serial,
        record.ownership,
        record.enrollmentStatus,
        record.complianceStatus,
      ],
      href: `/byod/${record.id}`,
    };
  },
);

const repairSearchRecords: SearchRecord[] = repairs.map(
  (repair) => {
    const device = devices.find(
      (candidate) =>
        candidate.serial === repair.deviceSerial,
    );

    const owner = repair.ownerStudentId
      ? students.find(
          (student) =>
            student.id === repair.ownerStudentId,
        )
      : undefined;

    return {
      id: `repair-${repair.id.toLowerCase()}`,
      type: "repair",
      title: repair.id,
      subtitle: `Repair · ${repair.status} · ${repair.issue}`,
      identifiers: [
        repair.id,
        repair.deviceSerial,
        device?.assetTag ?? "",
        owner?.name ?? "",
        repair.issue,
        repair.priority,
        repair.status,
        repair.serviceRoute,
      ],
      href: `/repairs/${repair.id}`,
    };
  },
);

const appleCareSearchRecords: SearchRecord[] =
  appleCareClaims.map((claim) => {
    const device = devices.find(
      (candidate) =>
        candidate.serial === claim.deviceSerial,
    );

    const owner = claim.ownerStudentId
      ? students.find(
          (student) =>
            student.id === claim.ownerStudentId,
        )
      : undefined;

    return {
      id: `applecare-${claim.id.toLowerCase()}`,
      type: "applecare",
      title: claim.id,
      subtitle: `AppleCare · ${claim.claimStatus} · ${claim.issue}`,
      identifiers: [
        claim.id,
        claim.deviceSerial,
        device?.assetTag ?? "",
        claim.repairId,
        owner?.name ?? "",
        claim.coverage,
        claim.claimStatus,
        claim.issue,
        claim.serviceType,
      ],
      href: `/applecare/${claim.id}`,
    };
  });

const returnSearchRecords: SearchRecord[] = returns.map(
  (record) => {
    const student = students.find(
      (candidate) => candidate.id === record.studentId,
    );

    const device = devices.find(
      (candidate) =>
        candidate.serial === record.deviceSerial,
    );

    return {
      id: `return-${record.id.toLowerCase()}`,
      type: "return",
      title: record.id,
      subtitle: `Return · ${record.returnStatus} · ${record.outcome}`,
      identifiers: [
        record.id,
        record.studentId,
        student?.name ?? "",
        student?.email ?? "",
        record.deviceSerial,
        device?.assetTag ?? "",
        record.returnStatus,
        record.condition,
        record.accessories,
        record.outcome,
        record.repairId ?? "",
      ],
      href: `/returns/${record.id}`,
    };
  },
);

const releaseSearchRecords: SearchRecord[] = releases.map(
  (release) => {
    const device = devices.find(
      (candidate) =>
        candidate.serial === release.deviceSerial,
    );

    return {
      id: `release-${release.id.toLowerCase()}`,
      type: "release",
      title: release.id,
      subtitle: `Release · ${release.eligibility} · ${release.status}`,
      identifiers: [
        release.id,
        release.deviceSerial,
        device?.assetTag ?? "",
        release.source.id,
        release.source.type,
        release.eligibility,
        release.action,
        release.status,
        release.validation,
      ],
      href: `/releases/${release.id}`,
    };
  },
);

export const searchRecords: readonly SearchRecord[] = [
  ...studentSearchRecords,
  ...facultySearchRecords,
  ...deviceSearchRecords,
  ...distributionSearchRecords,
  ...byodSearchRecords,
  ...repairSearchRecords,
  ...appleCareSearchRecords,
  ...returnSearchRecords,
  ...releaseSearchRecords,
];
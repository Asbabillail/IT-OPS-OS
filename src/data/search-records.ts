export type SearchRecordType = "student" | "faculty" | "device";

export type SearchRecord = {
  id: string;
  type: SearchRecordType;
  title: string;
  subtitle: string;
  identifiers: string[];
  href: string;
};

export const searchRecords: SearchRecord[] = [
  {
    id: "student-stu-2026-041",
    type: "student",
    title: "Ayaan Rahman",
    subtitle: "Student · Grade 10A",
    identifiers: [
      "STU-2026-041",
      "ayaan.rahman@yis.edu.sa",
      "Ayaan Rahman",
    ],
    href: "/students/STU-2026-041",
  },
  {
    id: "student-stu-2026-089",
    type: "student",
    title: "Sara Khan",
    subtitle: "Student · Grade 8B",
    identifiers: [
      "STU-2026-089",
      "sara.khan@yis.edu.sa",
      "Sara Khan",
    ],
    href: "/students/STU-2026-089",
  },
  {
    id: "faculty-fac-2026-012",
    type: "faculty",
    title: "Nadia Farooq",
    subtitle: "Faculty · Mathematics",
    identifiers: [
      "FAC-2026-012",
      "nadia.farooq@yis.edu.sa",
      "Nadia Farooq",
    ],
    href: "/faculty/FAC-2026-012",
  },
  {
    id: "faculty-fac-2026-019",
    type: "faculty",
    title: "Omar Siddiqui",
    subtitle: "Faculty · Science",
    identifiers: [
      "FAC-2026-019",
      "omar.siddiqui@yis.edu.sa",
      "Omar Siddiqui",
    ],
    href: "/faculty/FAC-2026-019",
  },
  {
    id: "device-dmqr92kx",
    type: "device",
    title: "iPad DMQR92KX",
    subtitle: "Device · Assigned",
    identifiers: [
      "DMQR92KX",
      "YIS-PAD-0412",
      "iPad DMQR92KX",
    ],
    href: "/devices/DMQR92KX",
  },
  {
    id: "device-f9ft81lp",
    type: "device",
    title: "iPad F9FT81LP",
    subtitle: "Device · Available",
    identifiers: [
      "F9FT81LP",
      "YIS-PAD-0413",
      "iPad F9FT81LP",
    ],
    href: "/devices/F9FT81LP",
  },
];
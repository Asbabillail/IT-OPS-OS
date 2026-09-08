import type { Faculty } from "./types";

export const faculty = [
  {
    id: "FAC-2026-012",
    name: "Nadia Farooq",
    department: "Mathematics",
    email: "nadia.farooq@yis.edu.sa",
    employmentStatus: "Active",
  },
  {
    id: "FAC-2026-019",
    name: "Omar Siddiqui",
    department: "Science",
    email: "omar.siddiqui@yis.edu.sa",
    employmentStatus: "Active",
  },
] satisfies readonly Faculty[];

export function getFacultyById(
  id: string,
): Faculty | undefined {
  return faculty.find((member) => member.id === id);
}
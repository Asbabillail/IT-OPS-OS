import type { Student } from "./types";

export const students = [
  {
    id: "STU-2026-041",
    name: "Ayaan Rahman",
    grade: "10A",
    email: "ayaan.rahman@yis.edu.sa",
    enrollmentStatus: "Active",
    guardian: {
      name: "Imran Rahman",
      phone: "+966 50 123 4567",
    },
  },
  {
    id: "STU-2026-089",
    name: "Sara Khan",
    grade: "8B",
    email: "sara.khan@yis.edu.sa",
    enrollmentStatus: "Active",
    guardian: {
      name: "Ahmed Khan",
      phone: "+966 50 987 6543",
    },
  },
] satisfies readonly Student[];

export function getStudentById(id: string): Student | undefined {
  return students.find((student) => student.id === id);
}
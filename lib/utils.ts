import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export const uploadFormSchema = z
  .object({
    unitName: z.string({
      required_error: "Please select a unit.",
    }),
    resourceType: z.enum(["past_paper", "lesson_notes"], {
      required_error: "Please select a resource type.",
    }),
    yearCompleted: z.string().optional().nullable(),
    yearOfCandidates: z.string().min(1).max(4).optional().nullable(),
    semester: z.string().optional().nullable(),
    weekNumber: z.string().optional().nullable(),
    files: z
      .array(z.instanceof(File))
      .min(1, "Please upload at least one file.")
      .refine((files) => files.every((file) => file.size <= MAX_FILE_SIZE), {
        message: `Each file must be less than 10MB.`,
      })
      .refine(
        (files) =>
          files.every((file) => ACCEPTED_FILE_TYPES.includes(file.type)),
        {
          message: "Only PDF and Office documents are allowed.",
        }
      ),
  })
  .refine(
    (data) => {
      if (data.resourceType === "lesson_notes" && !data.weekNumber) {
        return false;
      }
      return true;
    },
    {
      message: "Week number is required for lesson notes",
      path: ["weekNumber"],
    }
  )
  .refine(
    (data) => {
      if (data.resourceType === "past_paper") {
        return (
          !!data.semester && !!data.yearCompleted && !!data.yearOfCandidates
        );
      }
      return true;
    },
    {
      message:
        "Semester, year completed, and year of candidates are required for past papers.",
      path: ["semester"],
    }
  );

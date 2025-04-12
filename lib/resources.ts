"use server";

import "server-only";
import { prisma } from "@/lib/prisma";
import { createClient } from "./supabase/server";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import type { Resource } from "@prisma/client";
import { uploadFormSchema } from "./utils";
import { ZodError, z } from "zod";

const STORAGE_BUCKET = "resources";

type UploadParams = z.infer<typeof uploadFormSchema> & {
  files: File[];
};

const serverOnly = () => {
  if (typeof window !== "undefined") {
    throw new Error("Server-only function called from client");
  }
};

function generateFileName(params: UploadParams, file: File): string {
  const safeUnitName = params.unitName.replace(/[^a-zA-Z0-9]/g, "_");
  const uniqueId = uuidv4().slice(0, 8);
  const fileExtension =
    file.name.split(".").pop() ?? file.type.split("/").pop();

  if (params.resourceType === "lesson_notes") {
    return `${safeUnitName}_Lesson_Week${params.weekNumber}_${uniqueId}.${fileExtension}`;
  }

  return `${safeUnitName}_PastPaper_${params.yearCompleted}_Sem${params.semester}_${uniqueId}.${fileExtension}`;
}

export async function uploadResource(formData: FormData) {
  try {
    serverOnly();

    const supabase = await createClient();

    const formDataObject = {
      unitName: formData.get("unitName"),
      resourceType: formData.get("resourceType"),
      files: formData.getAll("files"),
      yearCompleted: formData.get("yearCompleted"),
      yearOfCandidates: formData.get("yearOfCandidates"),
      semester: formData.get("semester"),
      weekNumber: formData.get("weekNumber"),
    };

    const validatedData = uploadFormSchema.parse({
      ...formDataObject,
      files: Array.from(formDataObject.files as Iterable<File>),
    }) as UploadParams;

    const uploadPromises = validatedData.files.map(async (file) => {
      const fileName = generateFileName(validatedData, file);
      const filePath = `${validatedData.resourceType}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file);

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      const { data: urlData } = await supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);
      return prisma.resource.create({
        data: {
          unitName: validatedData.unitName,
          resourceType: validatedData.resourceType,
          filePath,
          fileName,
          fileSize: file.size,
          fileType: file.type,
          publicUrl: urlData.publicUrl,
          yearCompleted: validatedData.yearCompleted
            ? Number(validatedData.yearCompleted)
            : null,
          semester: validatedData.semester || null,
          weekNumber: validatedData.weekNumber
            ? Number(validatedData.weekNumber)
            : null,
          isVerified: false,
        },
      });
    });

    const resources = await Promise.all(uploadPromises);
    revalidatePath("/");
    return { success: true, resources };
  } catch (error) {
    console.error("Upload error:", error);

    if (error instanceof ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      };
    }

    if (error instanceof Error) {
      if (error.message.includes("bucket")) {
        return {
          success: false,
          error: "Storage configuration error",
          message: "Please contact administrator about bucket setup",
        };
      }
      return { success: false, error: error.message };
    }

    return { success: false, error: "Unknown error occurred" };
  }
}

export async function getResources(): Promise<Resource[]> {
  serverOnly();

  const resources = await prisma.resource.findMany({
    where: { isVerified: true },
    orderBy: { createdAt: "desc" },
  });

  return resources.map((resource) => ({
    ...resource,
    yearCompleted: resource.yearCompleted
      ? Number(resource.yearCompleted)
      : null,
    weekNumber: resource.weekNumber ? Number(resource.weekNumber) : null,
  }));
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Upload, Loader2, AlertCircle, FileCheck2, X } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { ALLOWED_UNITS } from "@/lib/helper";

// Constants for file validation
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const uploadFormSchema = z
  .object({
    unitName: z.string({ required_error: "Please select a unit." }),
    resourceType: z.enum(["past_paper", "lesson_notes"], {
      required_error: "Please select a resource type.",
    }),
    yearCompleted: z.string().optional(),
    yearOfCandidates: z.string().min(1).max(4).optional(),
    semester: z.string().optional(),
    weekNumber: z
      .string()
      .refine((val) => {
        const num = parseInt(val);
        return !isNaN(num) && num >= 1 && num <= 14;
      }, "Week number must be between 1-14")
      .optional(),
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
    (data) => (data.resourceType === "lesson_notes" ? !!data.weekNumber : true),
    {
      message: "Week number is required for lesson notes",
      path: ["weekNumber"],
    }
  );

type UploadFormValues = z.infer<typeof uploadFormSchema>;

export function UploadForm() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [storageError, setStorageError] = useState(false);

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      unitName: "",
      resourceType: "past_paper",
      files: [],
    },
  });

  const resourceType = form.watch("resourceType");
  const isPastPaper = resourceType === "past_paper";
  const watchedFiles = form.watch("files");

  async function onSubmit(data: UploadFormValues) {
    setIsUploading(true);
    setSetupError(null);
    setStorageError(false);

    try {
      const formData = new FormData();
      formData.append("unitName", data.unitName);
      formData.append("resourceType", data.resourceType);

      if (isPastPaper) {
        if (data.yearCompleted) {
          formData.append("yearCompleted", data.yearCompleted);
        }
        if (data.yearOfCandidates) {
          formData.append("yearOfCandidates", data.yearOfCandidates);
        }
        if (data.semester) {
          formData.append("semester", data.semester);
        }
      }

      data.files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to upload resources");
      }

      toast.success("Resources uploaded successfully");

      form.reset();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error uploading resources:", error);
      if (error instanceof Error) {
        if (error.message.includes("table")) {
          setSetupError(
            "Database tables not set up. Please run the setup first."
          );
        } else if (
          error.message.includes("bucket") ||
          error.message.includes("security policy")
        ) {
          setStorageError(true);
        } else {
          toast.error(error.message);
        }
      }
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Resource</CardTitle>
        <CardDescription>
          Share academic resources with other students. All uploads will be
          verified before being published.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {setupError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Database Error</AlertTitle>
            <AlertDescription>
              {setupError}
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                disabled={isUploading}
              >
                {isUploading ? "Setting up..." : "Run Setup"}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {storageError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Storage Bucket Error</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>
                The storage bucket is not properly configured. You need to
                create a "resources" bucket in your Supabase dashboard and
                configure RLS policies.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/setup?tab=storage">View Setup Instructions</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="unitName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ALLOWED_UNITS.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resourceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resource Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select resource type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="past_paper">Past Paper</SelectItem>
                      <SelectItem value="lesson_notes">Lesson Notes</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the type of resource you are uploading.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isPastPaper ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="yearCompleted"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year Completed</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g 2025 for 2024/2025"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="yearOfCandidates"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year of Candidates</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Year of study" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">First Year</SelectItem>
                          <SelectItem value="2">Second Year</SelectItem>
                          <SelectItem value="3">Third Year</SelectItem>
                          <SelectItem value="4">Fourth Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="semester"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Semester</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select semester" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Semester 1</SelectItem>
                          <SelectItem value="2">Semester 2</SelectItem>
                          <SelectItem value="3">Semester 3</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : (
              <FormField
                control={form.control}
                name="weekNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Week Number</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isUploading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select week number" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 14 }, (_, i) => i + 1).map(
                          (week) => (
                            <SelectItem key={week} value={week.toString()}>
                              Week {week}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the week these notes correspond to.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="files"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload Files</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.ppt,.pptx"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        const values = form.getValues();
                        const renamedFiles = files.map((file) => {
                          if (values.resourceType === "lesson_notes") {
                            return new File(
                              [file],
                              `${values.unitName}_Lesson_Week${values.weekNumber}_${file.name}`,
                              {
                                type: file.type,
                              }
                            );
                          } else if (values.resourceType === "past_paper") {
                            return new File(
                              [file],
                              `${values.unitName}_PastPaper_${values.yearCompleted}_${values.semester}_${file.name}`,
                              {
                                type: file.type,
                              }
                            );
                          }
                          return file;
                        });
                        field.onChange(renamedFiles);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload multiple PDF or Office documents (max 10MB each).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchedFiles && watchedFiles.length > 0 && (
              <div className="space-y-2">
                {watchedFiles.map((file, index) => (
                  <Alert
                    key={file.name + index}
                    variant="default"
                    className="relative pr-10"
                  >
                    <div className="flex items-start gap-3">
                      <FileCheck2 className="h-4 w-4 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <AlertTitle className="text-sm">{file.name}</AlertTitle>
                        <AlertDescription className="text-xs space-y-1">
                          <div>
                            Type: {file.type.split("/")[1].toUpperCase()}
                          </div>
                          <div>Size: {formatBytes(file.size)}</div>
                          <div>
                            Last modified:{" "}
                            {new Date(file.lastModified).toLocaleDateString()}
                          </div>
                        </AlertDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 h-6 w-6 hover:bg-destructive/20"
                      onClick={() => {
                        const newFiles = watchedFiles.filter(
                          (_, i) => i !== index
                        );
                        form.setValue("files", newFiles);
                      }}
                    >
                      <X className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </Alert>
                ))}
              </div>
            )}

            <Button type="submit" disabled={isUploading} className="w-full">
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Resource
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

import { type NextRequest, NextResponse } from "next/server";
import { uploadResource } from "@/lib/resources";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const result = await uploadResource(formData);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in upload API route:", error);

    // Check for specific error types
    if (error instanceof Error) {
      if (
        error.message.includes("bucket") ||
        error.message.includes("security policy")
      ) {
        return NextResponse.json(
          {
            error:
              "Storage bucket not configured. Please set up the storage bucket in Supabase.",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to upload resource",
      },
      { status: 500 }
    );
  }
}

import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");

    if (!path) {
      return NextResponse.json(
        { error: "File path is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get file from Supabase Storage
    const { data, error } = await supabase.storage
      .from("resources")
      .download(path);

    if (error) {
      console.error("Error downloading file:", error);
      return NextResponse.json(
        { error: "Failed to download file" },
        { status: 500 }
      );
    }

    // Return file as response
    return new NextResponse(data, {
      headers: {
        "Content-Type": data.type,
        "Content-Disposition": `attachment; filename=${path.split("/").pop()}`,
      },
    });
  } catch (error) {
    console.error("Error in download API route:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}

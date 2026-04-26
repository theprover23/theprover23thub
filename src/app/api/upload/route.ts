import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/client";
import { db } from "@/server/db";
import { files } from "@/server/db/schema";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    // Generate unique filename
    const fileExtension = file.name.split(".").pop();
    const filename = `${uuidv4()}.${fileExtension}`;
    
    // In production, you would upload to S3 or similar
    // For now, we'll store metadata and use a placeholder URL
    const url = `/uploads/${filename}`;

    // Save file metadata to database
    const [newFile] = await db.insert(files).values({
      userId: session.user.id,
      filename: filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      url: url,
    }).returning();

    return NextResponse.json({
      success: true,
      url: newFile.url,
      filename: newFile.filename,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

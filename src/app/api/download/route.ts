import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fileUrl = searchParams.get("url");
  const requestedFilename = searchParams.get("filename");

  if (!fileUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(fileUrl);
  } catch {
    return new NextResponse("Invalid URL parameter", { status: 400 });
  }

  if (targetUrl.protocol !== "http:" && targetUrl.protocol !== "https:") {
    return new NextResponse("Invalid protocol", { status: 400 });
  }

  try {
    const upstreamRes = await fetch(fileUrl);
    if (!upstreamRes.ok) {
      return new NextResponse(
        `Failed to fetch file from source (${upstreamRes.status})`,
        { status: upstreamRes.status },
      );
    }

    // Determine content type
    const contentType =
      upstreamRes.headers.get("content-type") || "application/octet-stream";

    // Clean or construct filename
    let filename = requestedFilename?.trim() || "";
    if (!filename) {
      const pathnameSegments = targetUrl.pathname.split("/").filter(Boolean);
      filename = pathnameSegments.pop() || "space-asset";
    }

    // Ensure appropriate extension if missing
    if (!filename.includes(".")) {
      if (contentType.includes("image/jpeg")) filename += ".jpg";
      else if (contentType.includes("image/png")) filename += ".png";
      else if (contentType.includes("image/webp")) filename += ".webp";
      else if (contentType.includes("video/mp4")) filename += ".mp4";
      else if (contentType.includes("video/webm")) filename += ".webm";
      else filename += ".jpg";
    }

    // Sanitize filename for Content-Disposition header
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");

    const headers = new Headers();
    headers.set(
      "Content-Disposition",
      `attachment; filename="${sanitizedFilename}"; filename*=UTF-8''${encodeURIComponent(sanitizedFilename)}`,
    );
    headers.set("Content-Type", contentType);

    const contentLength = upstreamRes.headers.get("content-length");
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    return new NextResponse(upstreamRes.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Download proxy error:", error);
    return new NextResponse("Error downloading file", { status: 500 });
  }
}

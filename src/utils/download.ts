/**
 * Trigger an actual file download directly to the user's computer
 * avoiding cross-origin navigation or opening unwanted new tabs.
 */
export async function triggerFileDownload(
  url: string,
  preferredFilename?: string,
): Promise<void> {
  if (!url) return;

  // External video providers (YouTube / Vimeo) cannot be downloaded as raw media files directly
  if (
    url.includes("youtube.com") ||
    url.includes("youtu.be") ||
    url.includes("vimeo.com")
  ) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }

  // Construct same-origin attachment download URL
  const downloadApiUrl = `/api/download?url=${encodeURIComponent(url)}${
    preferredFilename
      ? `&filename=${encodeURIComponent(preferredFilename)}`
      : ""
  }`;

  // Use an invisible anchor tag to trigger the browser's download manager
  const link = document.createElement("a");
  link.href = downloadApiUrl;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
  }, 1000);
}

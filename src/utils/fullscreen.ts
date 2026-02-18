export const toggleNativeFullscreen = (
  e: React.MouseEvent,
  targetId: string,
) => {
  e.stopPropagation(); // Prevents bubbling

  if (!document.fullscreenElement) {
    const elem = document.getElementById(targetId);
    if (elem && elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch((err) => {
        console.error(`Error attempting to exit fullscreen: ${err.message}`);
      });
    }
  }
};

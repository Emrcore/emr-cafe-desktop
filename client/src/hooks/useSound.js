import { useCallback } from "react";

export default function useSound(url) {
  return useCallback(() => {
    const audio = new Audio(url);
    audio.play();
  }, [url]);
}

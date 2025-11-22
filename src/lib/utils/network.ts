export function isOnline() {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

export function listenNetworkStatus(callback: (online: boolean) => void) {
  if (typeof window === "undefined") return;

  const update = () => callback(navigator.onLine);

  window.addEventListener("online", update);
  window.addEventListener("offline", update);

  return () => {
    window.removeEventListener("online", update);
    window.removeEventListener("offline", update);
  };
}

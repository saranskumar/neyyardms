export function toast(msg: string) {
  if (typeof window === "undefined") return;
  const div = document.createElement("div");

  div.innerText = msg;
  div.style.position = "fixed";
  div.style.bottom = "20px";
  div.style.left = "50%";
  div.style.transform = "translateX(-50%)";
  div.style.background = "#3E2758";
  div.style.color = "white";
  div.style.padding = "12px 16px";
  div.style.borderRadius = "12px";
  div.style.zIndex = "9999";
  div.style.opacity = "0";
  div.style.transition = "opacity 0.3s ease";

  document.body.appendChild(div);

  setTimeout(() => (div.style.opacity = "1"), 50);
  setTimeout(() => {
    div.style.opacity = "0";
    setTimeout(() => div.remove(), 300);
  }, 2200);
}

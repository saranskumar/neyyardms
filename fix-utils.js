const fs = require("fs");
const path = require("path");

function log(msg) {
  console.log("[FIX]", msg);
}

const root = process.cwd();

// --------------------------------------------------
// 1) RENAME src/lib/utils.ts → src/lib/shadcn-utils.ts
// --------------------------------------------------

const utilsTs = path.join(root, "src/lib/utils.ts");
const shadcnUtils = path.join(root, "src/lib/shadcn-utils.ts");

if (fs.existsSync(utilsTs)) {
  log("Renaming src/lib/utils.ts -> shadcn-utils.ts");
  fs.renameSync(utilsTs, shadcnUtils);
} else {
  log("No src/lib/utils.ts found, OK");
}

// --------------------------------------------------
// 2) ENSURE src/lib/utils/index.ts exists
// --------------------------------------------------

const utilsIndex = path.join(root, "src/lib/utils/index.ts");

const indexContent = `
export * from "./network";
export * from "./rpcHandler";
export * from "./toast";
export * from "./formatter";
export * from "./cart";
export * from "./onlineQueueHandler";
`;

fs.writeFileSync(utilsIndex, indexContent, "utf8");
log("Rewrote src/lib/utils/index.ts");

// --------------------------------------------------
// 3) CREATE ToastContext if missing
// --------------------------------------------------

const toastCtx = path.join(root, "src/components/ToastContext.tsx");

if (!fs.existsSync(toastCtx)) {
  log("Creating ToastContext.tsx");

  const toastContent = `
"use client";
import React, { createContext, useContext, useState } from "react";

type ToastContextType = {
  toast: (msg: string) => void;
};

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  function toast(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(null), 2500);
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {message && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-violet-700 text-white px-4 py-2 rounded shadow-lg z-50">
          {message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
`;
  fs.writeFileSync(toastCtx, toastContent, "utf8");
} else {
  log("ToastContext.tsx already exists, skipping");
}

// --------------------------------------------------
// 4) FIX src/components/index.ts
// --------------------------------------------------

const compIndex = path.join(root, "src/components/index.ts");

const compIndexContent = `
export * from "./ToastContext";
export * from "./ui/AdminOnly";
export * from "./ui/Protected";
export * from "./ui/Logout";
export * from "./ui/Header";
`;

fs.writeFileSync(compIndex, compIndexContent, "utf8");
log("Rewrote src/components/index.ts");

// --------------------------------------------------
// 5) FIX imports: replace "@/lib/utils" → "@/lib/utils/index"
// --------------------------------------------------

function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let replaced = content.replace(/from\s+["']@\/lib\/utils["']/g, `from "@/lib/utils/index"`);
  if (replaced !== content) {
    fs.writeFileSync(filePath, replaced, "utf8");
    log("Fixed imports in " + filePath.replace(root, ""));
  }
}

function scan(dir) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);

    if (full.includes("node_modules") || full.includes(".next")) continue;

    if (fs.statSync(full).isDirectory()) {
      scan(full);
    } else if (full.endsWith(".ts") || full.endsWith(".tsx")) {
      fixImportsInFile(full);
    }
  }
}

log("Scanning TypeScript files for import fixes...");
scan(path.join(root, "src"));

log("=== ALL FIXES APPLIED ===");

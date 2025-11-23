
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

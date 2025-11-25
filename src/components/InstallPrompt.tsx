"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

export default function InstallPrompt() {
    const [showPrompt, setShowPrompt] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return;
        }

        // Listen for install prompt
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);

            // Show prompt after a delay
            setTimeout(() => {
                setShowPrompt(true);
            }, 3000);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('PWA installed');
        }

        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // Don't show again for this session
        sessionStorage.setItem('installPromptDismissed', 'true');
    };

    if (!showPrompt || sessionStorage.getItem('installPromptDismissed')) {
        return null;
    }

    return (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-slide-up">
            <div
                className="rounded-2xl shadow-2xl p-4"
                style={{ backgroundColor: "#3E2758" }}
            >
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center" style={{ backgroundColor: "#FACC15" }}>
                        <Download size={24} style={{ color: "#3E2758" }} />
                    </div>

                    <div className="flex-1">
                        <h3 className="text-white font-bold text-base mb-1">
                            Install Neyyar Dairy
                        </h3>
                        <p className="text-white/80 text-sm mb-3">
                            Install our app for a better experience and offline access
                        </p>

                        <div className="flex gap-2">
                            <button
                                onClick={handleInstall}
                                className="flex-1 px-4 py-2 rounded-lg font-medium text-sm"
                                style={{ backgroundColor: "#FACC15", color: "#3E2758" }}
                            >
                                Install
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="px-4 py-2 rounded-lg font-medium text-sm bg-white/10 text-white hover:bg-white/20"
                            >
                                Later
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleDismiss}
                        className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg text-white"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}

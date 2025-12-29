"use client";

import { AlertCircle, Eye, EyeOff, Lock, Shield } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "enterlink_auth";
const CORRECT_PASSWORD = process.env.NEXT_PUBLIC_PASSWORD!;

interface AuthGateProps {
    children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isShaking, setIsShaking] = useState(false);

    useEffect(() => {
        // Check if password exists in localStorage
        const storedAuth = localStorage.getItem(STORAGE_KEY);
        if (storedAuth === CORRECT_PASSWORD) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (password === CORRECT_PASSWORD) {
            localStorage.setItem(STORAGE_KEY, password);
            setIsAuthenticated(true);
            setError("");
        } else {
            setError("Incorrect password. Please try again.");
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSubmit(e);
        }
    };

    // Loading state - show nothing while checking localStorage
    if (isAuthenticated === null) {
        return (
            <div className="min-h-screen bg-[#0A1628] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#169FD6] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Not authenticated - show password gate
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#0A1628] flex items-center justify-center p-4">
                {/* Background gradient effects */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 sm:w-80 h-40 sm:h-80 bg-[#169FD6]/20 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-40 sm:w-80 h-40 sm:h-80 bg-[#0A68A8]/20 rounded-full blur-3xl" />
                </div>

                <div
                    className={`
            relative w-full max-w-md bg-[#1e2d4b]/40 backdrop-blur-xl 
            border border-white/10 rounded-xl sm:rounded-2xl shadow-2xl p-5 sm:p-8
            transform transition-transform duration-100
            ${isShaking ? "animate-shake" : ""}
          `}
                >
                    {/* Header */}
                    <div className="text-center mb-6 sm:mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#169FD6] to-[#0A68A8] rounded-xl sm:rounded-2xl mb-3 sm:mb-4 shadow-lg">
                            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                            Protected Access
                        </h1>
                        <p className="text-gray-400 text-xs sm:text-sm">
                            Enter the password to access Enterlink
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="relative mb-4">
                            <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                                <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError("");
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder="Enter password"
                                className={`
                  w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 bg-[#101C34] border rounded-lg sm:rounded-xl
                  text-white placeholder-gray-500 outline-none text-sm sm:text-base
                  transition-all duration-200
                  focus:ring-2 focus:ring-[#169FD6]/50
                  ${error ? "border-red-500/50" : "border-white/10 focus:border-[#169FD6]"}
                `}
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                                ) : (
                                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                                )}
                            </button>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="flex items-center gap-2 text-red-400 text-xs sm:text-sm mb-4 pl-1">
                                <AlertCircle className="w-4 h-4" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Submit button */}
                        <button
                            type="submit"
                            className="
                w-full py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-[#169FD6] to-[#0A68A8]
                rounded-lg sm:rounded-xl font-semibold text-white text-sm sm:text-base
                transition-all duration-200
                hover:opacity-90 hover:shadow-lg hover:shadow-[#169FD6]/25
                active:scale-[0.98]
              "
                        >
                            Unlock Access
                        </button>
                    </form>

                    {/* Footer hint */}
                    <p className="text-center text-gray-500 text-xs mt-4 sm:mt-6">
                        Contact your administrator if you forgot the password
                    </p>
                </div>

            </div>
        );
    }

    // Authenticated - show children
    return <>{children}</>;
}

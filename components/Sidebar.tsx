"use client";

import { Bot, FileText, Menu, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const links = [
        { href: "/", label: "Upload", icon: FileText },
        { href: "/search", label: "Search", icon: Search },
        { href: "/chat", label: "AI Assistant", icon: Bot },
    ];

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Prevent body scroll when sidebar is open on mobile
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    return (
        <>
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b border-[#1e2d4b] px-4 py-2 flex items-center justify-end">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 rounded-lg bg-[#1e2d4b] text-white hover:bg-[#2a3d5b] transition-colors"
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </header>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:sticky top-0 left-0 z-50 h-screen
                    w-64 bg-background border-r border-[#1e2d4b] 
                    flex flex-col shrink-0
                    transform transition-transform duration-300 ease-in-out
                    lg:transform-none
                    ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                `}
            >
                <div className="p-2">
                    <div className="flex items-center gap-2">
                        <Image
                            src="/logo.webp"
                            alt="Logo"
                            width={500}
                            height={500}
                            className="w-32 h-auto mx-auto"
                        />
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-2">
                    {links.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                    ? "bg-primary/20 text-primary font-semibold"
                                    : "text-gray-400 hover:bg-[#1e2d4b] hover:text-white"
                                    }`}
                            >
                                <link.icon className="w-5 h-5" />
                                <span className="text-sm">{link.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 mx-4 mb-4 rounded-xl bg-gradient-to-br from-secondary/50 to-primary/20 border border-white/5">
                    <p className="text-xs text-gray-400 mb-2">Powered by</p>
                    <div className="font-semibold text-white text-sm">Gemini 2.5 Pro</div>
                </div>
            </aside>
        </>
    );
}

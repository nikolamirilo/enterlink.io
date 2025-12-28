"use client";

import { Bot, FileText, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Upload", icon: FileText },
        { href: "/search", label: "Search", icon: Search },
        { href: "/chat", label: "AI Assistant", icon: Bot },
    ];

    return (
        <aside className="w-64 bg-background border-r border-[#1e2d4b] h-screen flex flex-col sticky top-0 shrink-0">
            <div className="p-2">
                <div className="flex items-center gap-2">
                    {/* Simple Logo Placeholder - matching brand color */}
                    {/* <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                        <span className="text-white font-bold text-xl">E</span>
                    </div>
                    <span className="text-xl font-bold text-white tracking-wide">Enterlink</span> */}
                    <Image src="/logo.webp" alt="Logo" width={500} height={500} className="w-32 h-auto mx-auto" />
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
    );
}

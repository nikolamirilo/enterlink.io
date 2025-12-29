"use client";

import { AuthGate } from "./AuthGate";

interface ClientLayoutProps {
    children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
    return <AuthGate>{children}</AuthGate>;
}

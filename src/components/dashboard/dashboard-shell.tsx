"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SidebarContextType {
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) throw new Error("useSidebar must be used within SidebarProvider");
    return context;
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar();

    return (
        <div
            className={cn(
                "min-h-screen bg-mesh transition-all duration-500 ease-in-out",
                isCollapsed ? "pl-20" : "pl-64"
            )}
        >
            <main className="p-4 md:p-8 max-w-[1600px] mx-auto">
                {children}
            </main>
        </div>
    );
}

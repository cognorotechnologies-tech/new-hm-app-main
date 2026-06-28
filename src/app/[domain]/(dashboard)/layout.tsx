import TenantSidebar from "@/components/dashboard/sidebar";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { getTenantSubscription } from "@/lib/subscription-service";
import { GracePeriodBanner } from "@/components/dashboard/grace-period-banner";
import { SidebarProvider, DashboardShell } from "@/components/dashboard/dashboard-shell";
import { CommandPalette } from "@/components/dashboard/command-palette";

export default async function DashboardLayout(props: {
    children: React.ReactNode;
    params: Promise<{ domain: string }>;
}) {
    const params = await props.params;
    const { domain } = params;
    const { children } = props;
    const session = await auth();
    const role = session?.user?.role || 'PATIENT'; // Default fallback

    const tenant = await (prisma as any).tenant.findFirst({
        where: {
            OR: [
                { id: domain },
                { slug: domain }
            ]
        },
        select: { id: true, status: true, plan: true, branding: true, settings: true }
    });

    const status = tenant?.status || 'ACTIVE';
    const branding = tenant?.branding as any;
    const settings = tenant?.settings as any;

    return (
        <SidebarProvider>
            {branding?.primaryColor && (
                <style dangerouslySetInnerHTML={{
                    __html: `
                    :root {
                        --primary: ${branding.primaryColor};
                        --primary-foreground: 210 40% 98%;
                    }
                `}} />
            )}
            <CommandPalette />
            <TenantSidebar
                domain={domain}
                role={role}
                branding={branding}
                settings={settings}
            />
            <DashboardShell>
                <GracePeriodBanner status={status} domain={domain} />
                {children}
            </DashboardShell>
        </SidebarProvider>
    );
}

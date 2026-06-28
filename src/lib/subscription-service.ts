import prisma from "./prisma";

export type FeatureModule = 'PHARMACY' | 'LAB' | 'HR' | 'CAMPAIGN' | 'SURVEY';

const PLAN_FEATURES: Record<string, FeatureModule[]> = {
    'FREE': [],
    'BASIC': ['HR'],
    'PROFESSIONAL': ['HR', 'PHARMACY', 'LAB'],
    'ENTERPRISE': ['HR', 'PHARMACY', 'LAB', 'CAMPAIGN', 'SURVEY'],
};

/**
 * Checks if a tenant has access to a specific module based on their plan and subscription status.
 * Now primarily uses the Super Admin entitlement settings if available.
 */
export async function checkFeatureAccess(tenantId: string, feature: FeatureModule): Promise<boolean> {
    const tenant = await (prisma as any).tenant.findUnique({
        where: { id: tenantId },
        select: { plan: true, status: true, settings: true }
    });

    if (!tenant) return false;

    // Hard restriction: if status is EXPIRED or RESTRICTED, all premium features are blocked
    if (tenant.status === 'EXPIRED' || tenant.status === 'RESTRICTED') {
        return false;
    }

    // 1. Try new entitlement system (settings.enabledModules)
    const settings = (tenant.settings as any) || {};
    if (settings.enabledModules && Array.isArray(settings.enabledModules)) {
        return settings.enabledModules.includes(feature);
    }

    // 2. Fallback to plan-based defaults
    const permittedFeatures = PLAN_FEATURES[tenant.plan as string] || [];
    return permittedFeatures.includes(feature);
}

/**
 * Retrieves the current subscription status and plan for a tenant.
 * Can search by ID or Slug.
 */
export async function getTenantSubscription(identifier: string) {
    return await (prisma as any).tenant.findFirst({
        where: {
            OR: [
                { id: identifier },
                { slug: identifier }
            ]
        },
        select: { id: true, status: true, plan: true, updatedAt: true }
    });
}

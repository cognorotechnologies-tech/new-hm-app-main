import { Tenant } from "@prisma/client";

export type ModuleName = 'hr' | 'clinical' | 'billing' | 'lab' | 'inventory' | 'pharmacy' | 'appointments' | 'patients' | 'crm' | 'campaigns';

/**
 * Checks if a specific module is enabled for a tenant.
 * Defaults to true if no settings are found.
 */
export function isModuleEnabled(tenant: any, moduleName: ModuleName): boolean {
    if (!tenant?.settings) return true;
    const settings = tenant.settings as any;
    if (!settings.modules) return true;

    // Specifically check if enabled is false
    return settings.modules[moduleName]?.enabled !== false;
}

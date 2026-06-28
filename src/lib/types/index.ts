export type Tenant = {
    id: string;
    name: string;
    slug: string;
    domain?: string;
};

export type User = {
    id: string;
    email: string;
    role: "SUPER_ADMIN" | "ADMIN" | "DOCTOR" | "NURSE" | "RECEPTIONIST" | "PATIENT";
    tenantId?: string;
};

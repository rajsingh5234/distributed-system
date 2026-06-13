export type Credentials = {
    email: string;
    password: string;
};

export type Tenant = {
    id: string;
    name: string;
    address: string;
};

export type User = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    tenant: Tenant | null;
};

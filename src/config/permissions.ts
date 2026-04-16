export const ALL_PERMISSIONS = {
    COMPANIES: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/companies', module: "COMPANIES" },
        CREATE: { method: "POST", apiPath: '/api/v1/companies', module: "COMPANIES" },
        UPDATE: { method: "PUT", apiPath: '/api/v1/companies', module: "COMPANIES" },
        DELETE: { method: "DELETE", apiPath: '/api/v1/companies/{id}', module: "COMPANIES" },
    },
    JOBS_PUBLIC: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/jobs', module: "JOBS" },
        GET_BY_ID: { method: "GET", apiPath: '/api/v1/jobs/{id}', module: "JOBS" },
    },
    JOBS: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/admin/jobs', module: "JOBS" },
        GET_BY_ID: { method: "GET", apiPath: '/api/v1/admin/jobs/{id}', module: "JOBS" },
        CREATE: { method: "POST", apiPath: '/api/v1/admin/jobs', module: "JOBS" },
        UPDATE: { method: "PUT", apiPath: '/api/v1/admin/jobs', module: "JOBS" },
        DELETE: { method: "DELETE", apiPath: '/api/v1/admin/jobs/{id}', module: "JOBS" },
    },
    PERMISSIONS: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/permissions', module: "PERMISSIONS" },
        CREATE: { method: "POST", apiPath: '/api/v1/permissions', module: "PERMISSIONS" },
        UPDATE: { method: "PUT", apiPath: '/api/v1/permissions', module: "PERMISSIONS" },
        DELETE: { method: "DELETE", apiPath: '/api/v1/permissions/{id}', module: "PERMISSIONS" },
    },
    RESUMES: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/resumes', module: "RESUMES" },
        CREATE: { method: "POST", apiPath: '/api/v1/resumes', module: "RESUMES" },
        UPDATE: { method: "PUT", apiPath: '/api/v1/resumes', module: "RESUMES" },
        DELETE: { method: "DELETE", apiPath: '/api/v1/resumes/{id}', module: "RESUMES" },
    },
    ROLES: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/roles', module: "ROLES" },
        CREATE: { method: "POST", apiPath: '/api/v1/roles', module: "ROLES" },
        UPDATE: { method: "PUT", apiPath: '/api/v1/roles', module: "ROLES" },
        DELETE: { method: "DELETE", apiPath: '/api/v1/roles/{id}', module: "ROLES" },
    },
    USERS: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/users', module: "USERS" },
        CREATE: { method: "POST", apiPath: '/api/v1/users', module: "USERS" },
        UPDATE: { method: "PUT", apiPath: '/api/v1/users', module: "USERS" },
        DELETE: { method: "DELETE", apiPath: '/api/v1/users/{id}', module: "USERS" },
    },
    EXPERTISE_CATEGORIES: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/expertise-category', module: "EXPERTISE_CATEGORIES" },
        CREATE: { method: "POST", apiPath: '/api/v1/expertise-category', module: "EXPERTISE_CATEGORIES" },
        UPDATE: { method: "PUT", apiPath: '/api/v1/expertise-category', module: "EXPERTISE_CATEGORIES" },
        DELETE: { method: "DELETE", apiPath: '/api/v1/expertise-category/{id}', module: "EXPERTISE_CATEGORIES" },
    },
    EXPERTISES: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/expertise', module: "EXPERTISES" },
        CREATE: { method: "POST", apiPath: '/api/v1/expertise', module: "EXPERTISES" },
        UPDATE: { method: "PUT", apiPath: '/api/v1/expertise', module: "EXPERTISES" },
        DELETE: { method: "DELETE", apiPath: '/api/v1/expertise/{id}', module: "EXPERTISES" },
    },
}

export const ALL_MODULES = {
    COMPANIES: 'COMPANIES',
    FILES: 'FILES',
    JOBS: 'JOBS',
    PERMISSIONS: 'PERMISSIONS',
    RESUMES: 'RESUMES',
    ROLES: 'ROLES',
    USERS: 'USERS',
    EXPERTISE_CATEGORIES: 'EXPERTISE_CATEGORIES',
    EXPERTISES: 'EXPERTISES',
    SUBSCRIBERS: 'SUBSCRIBERS'
}

export interface IBackendRes<T> {
    error?: string | string[];
    message: string;
    statusCode: number | string;
    data?: T;
}

export interface IModelPaginate<T> {
    meta: {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
    },
    result: T[]
}

export interface IAccount {
    access_token: string;
    user: {
        id: string;
        email: string;
        name: string;
        age: number;
        gender: string;
        address: string;
        role: {
            id: string;
            name: string;
            permissions: {
                id: string;
                name: string;
                apiPath: string;
                method: string;
                module: string;
            }[]
        }
    }
}

export interface IGetAccount extends Omit<IAccount, "access_token"> { }

export interface ICompany {
    id?: string;
    name?: string;
    address?: string;
    logo: string;
    description?: string;
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
    averageRating?: number;
    recommendPercentage?: number;
    totalReviews?: number;
    latestReview?: IReview;
}

export interface IReview {
    id?: string;
    rating: number;
    isRecommend?: boolean;
    content: string;
    title?: string;
    pros?: string;
    cons?: string;
    createdAt?: string;
    user?: {
        id: string;
        name: string;
    }
}

export interface ISkill {
    id?: string;
    name?: string;
    createdBy?: string;
    updatedBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}



export interface IUser {
    id?: string;
    name: string;
    email: string;
    password?: string;
    age: number;
    gender: string;
    address: string;
    role?: {
        id: string;
        name: string;
    }

    company?: {
        id: string;
        name: string;
    }
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IJob {
    id?: string;
    name: string;
    skills: ISkill[];
    expertises?: IExpertise[];
    company?: {
        id: string;
        name: string;
        logo?: string;
    }
    location: string;
    salary: number;
    quantity: number;
    level: string;
    description: string;
    required?: string;
    benefit?: string;
    startDate: Date;
    endDate: Date;
    active: boolean;

    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IJobRecommendation {
    job: IJob;
    score: number;
    matchSummary: string;
}

export interface IRecommendationProfilePayload {
    skillIds: Array<string | number>;
    level: 'INTERN' | 'JUNIOR' | 'MIDDLE' | 'SENIOR' | string;
    expertiseId?: string | number | null;
}

export interface IRecommendationProfileResponse {
    skillIds: Array<string | number>;
    skillDetails?: { label: string; value: string | number }[];
    level?: 'INTERN' | 'JUNIOR' | 'MIDDLE' | 'SENIOR' | string;
    expertiseId?: string | number | null;
    expertiseDetail?: { label: string; value: string | number } | null;
}

export interface IResume {
    id?: string;
    email: string;
    userId: string;
    url: string;
    status: string;
    companyId: string | {
        id: string;
        name: string;
        logo: string;
    };
    jobId: string | {
        id: string;
        name: string;
    };
    history?: {
        status: string;
        updatedAt: Date;
        updatedBy: { id: string; email: string }
    }[]
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
    aiScore?: number;
    aiFeedback?: string;
    companyName?: string;
}

export interface IPermission {
    id?: string;
    name?: string;
    apiPath?: string;
    method?: string;
    module?: string;

    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;

}

export interface IRole {
    id?: string;
    name: string;
    description: string;
    active: boolean;
    permissions: IPermission[] | string[];

    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface ISubscribers {
    id?: string;
    name?: string;
    email?: string;
    skills: string[];
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IExpertiseCategory {
    id?: string;
    name: string;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface IExpertise {
    id?: string;
    name: string;
    expertiseCategory?: IExpertiseCategory | null;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface IInterviewQuestion {
    id: number;
    question: string;
    type: 'technical' | 'behavioral' | 'situational';
    hint?: string;
}

export interface IInterviewEvaluation {
    success: boolean;
    score: number;
    feedback: string;
    suggestion: string;
    rating: 'Excellent' | 'Good' | 'Fair' | 'Needs Improvement' | 'Failed';
}

export interface IDashboardStats {
    totalUsers: number;
    totalJobs: number;
    totalActiveJobs: number;
    totalCompanies: number;
    totalResumes: number;
    resumeByStatus: Record<string, number>;
    topSkills: { name: string; count: number }[];
    recentJobs: {
        id: number;
        name: string;
        companyName: string;
        location: string;
        salary: number;
        level: string;
        active: boolean;
        createdAt: string;
    }[];
}


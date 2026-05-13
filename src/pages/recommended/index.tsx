import { ArrowRightOutlined, EnvironmentOutlined, ThunderboltOutlined, FireOutlined, StarOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { callFetchRecommendedJobs } from '@/config/api';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import type { IJobRecommendation } from '@/types/backend';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { convertSlug, getLocationName } from '@/config/utils';
import styles from './index.module.scss';

dayjs.extend(relativeTime);

/* ---------- Skeleton Card ---------- */
const SkeletonCard = () => (
    <div className={styles.skeletonCard}>
        <div className={styles.skeletonHeader}>
            <div className={styles.skeletonLogo} />
            <div className={styles.skeletonLines}>
                <div className={`${styles.skeletonLine} ${styles.w80} ${styles.h20}`} />
                <div className={`${styles.skeletonLine} ${styles.w50}`} />
            </div>
        </div>
        <div className={styles.skeletonLine} style={{ marginBottom: 8 }} />
        <div className={`${styles.skeletonLine} ${styles.w90}`} style={{ marginBottom: 8 }} />
        <div className={`${styles.skeletonLine} ${styles.w60}`} style={{ marginBottom: 20 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className={`${styles.skeletonLine} ${styles.w40}`} />
            <div className={`${styles.skeletonLine} ${styles.w40}`} />
        </div>
    </div>
);

/* ---------- Job Card ---------- */
const JobCard = ({ item, onClick }: { item: IJobRecommendation; onClick: () => void }) => {
    const job = item?.job;
    const jobName = job?.name ?? 'Recommended Job';
    const score = item.score ?? 0;
    const scoreClass = score >= 80 ? styles.high : score >= 60 ? styles.medium : styles.low;
    const skills = job?.skills?.slice(0, 3) ?? [];
    const logoSrc = job?.company?.logo
        ? `${import.meta.env.VITE_BACKEND_URL}/storage/company/${job.company.logo}`
        : '';
    const timeLabel = job?.updatedAt
        ? dayjs(job.updatedAt).fromNow()
        : job?.createdAt ? dayjs(job.createdAt).fromNow() : '';

    return (
        <div className={styles.jobCard} onClick={onClick} role="button" tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClick()}>
            <div className={styles.cardHeader}>
                <div className={styles.logoWrap}>
                    {logoSrc
                        ? <img src={logoSrc} alt={job?.company?.name ?? jobName} />
                        : <div className={styles.logoPlaceholder}>{jobName.charAt(0)}</div>
                    }
                </div>
                <div className={styles.cardTitleBlock}>
                    <div className={styles.jobTitle}>{jobName}</div>
                    <div className={styles.companyName}>{job?.company?.name ?? '—'}</div>
                </div>
                <span className={`${styles.scoreBadge} ${scoreClass}`}>
                    ⚡ {score}
                </span>
            </div>

            {skills.length > 0 && (
                <div className={styles.skillTags}>
                    {skills.map((s: any) => (
                        <span key={s.id} className={styles.skillTag}>{s.name}</span>
                    ))}
                </div>
            )}

            <div className={styles.matchSummary}>
                {item.matchSummary ?? 'Matching job based on your profile.'}
            </div>

            <div className={styles.cardFooter}>
                <span className={styles.footerMeta}>
                    <EnvironmentOutlined />
                    {getLocationName(job?.location ?? '')}
                </span>
                <span className={styles.timeAgo}>{timeLabel}</span>
                <span className={styles.cardArrow}><ArrowRightOutlined /></span>
            </div>
        </div>
    );
};

/* ---------- Page ---------- */
const RecommendedPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
    const user = useAppSelector(state => state.account.user);
    const [isLoading, setIsLoading] = useState(false);
    const [jobs, setJobs] = useState<IJobRecommendation[]>([]);

    const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const filter = params.get('filter') || 'all';

    useEffect(() => {
        const init = async () => {
            if (!isAuthenticated) { setJobs([]); setIsLoading(false); return; }
            setIsLoading(true);
            try {
                const res = await callFetchRecommendedJobs(100);
                const result = Array.isArray(res?.data)
                    ? res.data
                    : Array.isArray((res as any)?.data?.data)
                        ? (res as any).data.data
                        : [];
                setJobs(result);
            } catch {
                setJobs([]);
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, [isAuthenticated, filter]);

    const highScore = jobs.filter(j => (j.score ?? 0) >= 80).length;

    return (
        <div className={styles.pageWrapper}>
            {/* ---- Hero ---- */}
            <div className={styles.container}>
                <div className={styles.hero}>
                    <div className={styles.heroBadge}>
                        <ThunderboltOutlined /> AI-Powered Matching
                    </div>
                    <h1 className={styles.heroTitle}>
                        Jobs Recommended for You
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Our AI system analyzes your profile, skills, and experience to suggest the most relevant job opportunities.
                    </p>

                    {isAuthenticated && !isLoading && jobs.length > 0 && (
                        <div className={styles.heroStats}>
                            <div className={styles.statItem}>
                                <span className={styles.statNumber}>{jobs.length}</span>
                                <span className={styles.statLabel}>Matching Jobs</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statNumber}>{highScore}</span>
                                <span className={styles.statLabel}>High Score ≥80</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statNumber}>{jobs[0]?.score ?? 0}</span>
                                <span className={styles.statLabel}>Highest Score</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* ---- Content ---- */}
                <div className={styles.contentSection}>
                    {/* Loading */}
                    {isLoading && (
                        <div className={styles.skeletonGrid}>
                            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    )}

                    {/* Not authenticated */}
                    {!isLoading && !isAuthenticated && (
                        <div className={styles.emptyState}>
                            <span className={styles.emptyIcon}>🔐</span>
                            <h2 className={styles.emptyTitle}>Sign in to view recommendations</h2>
                            <p className={styles.emptyDesc}>
                                Create an account or sign in for AI to analyze your profile and suggest the best matching jobs for you.
                            </p>
                            <Link to="/login" className={styles.emptyBtn}>
                                Sign In Now <ArrowRightOutlined />
                            </Link>
                        </div>
                    )}

                    {/* No jobs */}
                    {!isLoading && isAuthenticated && jobs.length === 0 && (
                        <div className={styles.emptyState}>
                            <span className={styles.emptyIcon}>🎯</span>
                            <h2 className={styles.emptyTitle}>No job recommendations yet</h2>
                            <p className={styles.emptyDesc}>
                                Please update your skills, level, and expertise in your profile so AI can find and suggest matching jobs for you.
                            </p>
                            <Link to="/" className={styles.emptyBtn}>
                                Update Profile <ArrowRightOutlined />
                            </Link>
                        </div>
                    )}

                    {/* Job list */}
                    {!isLoading && jobs.length > 0 && (
                        <>
                            <div className={styles.toolbar}>
                                <div className={styles.resultCount}>
                                    <strong>{jobs.length}</strong>
                                    <span>matching jobs for your profile</span>
                                    <span className={styles.countBadge}><FireOutlined /> Hot</span>
                                </div>
                            </div>
                            <div className={styles.jobGrid}>
                                {jobs.map((item) => {
                                    const job = item?.job;
                                    const jobName = job?.name ?? 'Recommended Job';
                                    const slug = convertSlug(jobName);
                                    return (
                                        <JobCard
                                            key={String(job?.id ?? slug)}
                                            item={item}
                                            onClick={() => job?.id ? navigate(`/job/${slug}?id=${job.id}`) : undefined}
                                        />
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecommendedPage;

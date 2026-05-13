import { Row, Col, Spin, Empty } from 'antd';
import { ThunderboltOutlined, EnvironmentOutlined, FireOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { callFetchRecommendedJobs } from '@/config/api';
import type { IJob, IJobRecommendation } from '@/types/backend';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { convertSlug, getLocationName } from '@/config/utils';
import JobDetailPanel from '@/components/client/card/job-detail-panel';
import styles from './index.module.scss';
import compactStyles from '@/components/client/card/job-list-compact.module.scss';

dayjs.extend(relativeTime);

/* ---------- Compact AI Job Card ---------- */
const CompactAIJobCard = ({
    item,
    isActive,
    onClick
}: {
    item: IJobRecommendation;
    isActive: boolean;
    onClick: () => void;
}) => {
    const job = item?.job;
    if (!job) return null;

    const score = item.score ?? 0;
    const scoreClass = score >= 80 ? styles.high : score >= 60 ? styles.medium : styles.low;
    const timeLabel = dayjs(job.updatedAt || job.createdAt).fromNow();

    return (
        <div
            className={`${compactStyles.jobCard} ${isActive ? compactStyles.active : ''} ${styles.aiCardExtra}`}
            onClick={onClick}
        >
            {/* AI Score Badge */}
            <div className={`${styles.aiScoreBadge} ${scoreClass}`}>
                AI Matching: {score}%
            </div>

            <div className={compactStyles.postedTime}>Đăng {timeLabel}</div>
            <div className={compactStyles.jobTitle}>{job.name}</div>

            <div className={compactStyles.companyRow}>
                <img
                    alt={job.company?.name}
                    src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${job.company?.logo}`}
                    className={compactStyles.companyLogo}
                />
                <span className={compactStyles.companyName}>{job.company?.name}</span>
            </div>

            <div className={compactStyles.metaRow}>
                <span className={compactStyles.metaItem}>
                    <ThunderboltOutlined /> {job.level}
                </span>
                <span className={compactStyles.dot}>·</span>
                <span className={compactStyles.metaItem}>
                    <EnvironmentOutlined /> {getLocationName(job.location)}
                </span>
            </div>

            {job.skills && (
                <div className={compactStyles.skillsRow}>
                    {job.skills.slice(0, 3).map(s => (
                        <span key={s.id} className={compactStyles.skillTag}>{s.name}</span>
                    ))}
                </div>
            )}
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
    const [selectedJob, setSelectedJob] = useState<IJob | undefined>();

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
                if (result.length > 0) {
                    setSelectedJob(result[0].job);
                }
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
            {/* Dashboard Header (Dark) */}
            <header className={styles.dashboardHeader}>
                <div className={styles.container}>
                    <div className={styles.hero}>
                        <div className={styles.heroBadge}>
                            <ThunderboltOutlined /> AI-Powered Intelligence
                        </div>
                        <h1 className={styles.heroTitle}>
                            Smart Career Matching
                        </h1>
                        <p className={styles.heroSubtitle}>
                            We've analyzed your professional profile against our database to find your next perfect role.
                        </p>

                        {isAuthenticated && !isLoading && jobs.length > 0 && (
                            <div className={styles.heroStats}>
                                <div className={styles.statItem}>
                                    <span className={styles.statNumber}>{jobs.length}</span>
                                    <span className={styles.statLabel}>Opportunities</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={styles.statNumber}>{highScore}</span>
                                    <span className={styles.statLabel}>High Matches</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={styles.statNumber}>{jobs[0]?.score ?? 0}%</span>
                                    <span className={styles.statLabel}>Best Match</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Dashboard Content (2 Columns like Search Page) */}
            <main className={styles.dashboardContent}>
                <div className={styles.container}>
                    <Spin spinning={isLoading} tip="AI is matching jobs...">
                        {!isLoading && !isAuthenticated && (
                            <div className={styles.emptyState}>
                                <span className={styles.emptyIcon}>🔐</span>
                                <h2 className={styles.emptyTitle}>Sign in for Recommendations</h2>
                                <p className={styles.emptyDesc}>
                                    Join JobHunter to unlock AI career matching tailored to your skills.
                                </p>
                                <Link to="/login" className={styles.emptyBtn}>
                                    Get Started Now <ArrowRightOutlined />
                                </Link>
                            </div>
                        )}

                        {!isLoading && isAuthenticated && jobs.length === 0 && (
                            <div className={styles.emptyState}>
                                <span className={styles.emptyIcon}>🎯</span>
                                <h2 className={styles.emptyTitle}>No Matches Found Yet</h2>
                                <p className={styles.emptyDesc}>
                                    Update your profile details to help our AI engine.
                                </p>
                                <Link to="/" className={styles.emptyBtn}>
                                    Complete Profile <ArrowRightOutlined />
                                </Link>
                            </div>
                        )}

                        {isAuthenticated && jobs.length > 0 && (
                            <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
                                <Col span={24} lg={10}>
                                    <div className={styles.compactListHeader}>
                                        <FireOutlined /> <strong>{jobs.length}</strong> AI Recommendations
                                    </div>
                                    <div className={styles.compactListWrapper}>
                                        {jobs.map((item) => (
                                            <CompactAIJobCard
                                                key={item.job?.id}
                                                item={item}
                                                isActive={selectedJob?.id === item.job?.id}
                                                onClick={() => setSelectedJob(item.job)}
                                            />
                                        ))}
                                    </div>
                                </Col>
                                <Col span={24} lg={14}>
                                    <div className={styles.detailSticky}>
                                        <JobDetailPanel job={selectedJob} />
                                    </div>
                                </Col>
                            </Row>
                        )}
                    </Spin>
                </div>
            </main>
        </div>
    );
};

export default RecommendedPage;

import { callFetchPublicJob } from '@/config/api';
import { getLocationName } from '@/config/utils';
import { IJob } from '@/types/backend';
import { EnvironmentOutlined, DollarOutlined, FireOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Empty, Spin } from 'antd';
import { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import styles from './job-list-compact.module.scss';
import { sfIn } from "spring-filter-query-builder";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface IProps {
    onSelectJob: (job: IJob | undefined) => void;
    selectedJobId?: number | string;
    onTotalChange?: (total: number) => void;
}

const JobListCompact = (props: IProps) => {
    const { onSelectJob, selectedJobId, onTotalChange } = props;

    const [displayJob, setDisplayJob] = useState<IJob[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [total, setTotal] = useState<number>(0);

    const [current] = useState(1);
    const [pageSize] = useState(20);
    const [sortQuery] = useState("sort=updatedAt,desc");
    const [searchParams] = useSearchParams();
    const location = useLocation();

    useEffect(() => {
        fetchJob();
    }, [location]);

    const fetchJob = async () => {
        setIsLoading(true);
        let query = `page=${current}&size=${pageSize}&${sortQuery}`;

        const queryLocation = searchParams.get("location");
        const querySkills = searchParams.get("skills");
        const queryCompanyIds = searchParams.get("companyIds");
        const queryExpertiseId = searchParams.get("expertiseId");
        const queryExpertiseIds = searchParams.get("expertiseIds");
        const queryLevel = searchParams.get("level");

        let q = "";
        if (queryLocation) q = sfIn("location", queryLocation.split(",")).toString();
        if (querySkills) q = q ? q + " and " + `${sfIn("skills.id", querySkills.split(","))}` : `${sfIn("skills.id", querySkills.split(","))}`;
        if (queryCompanyIds) q = q ? q + " and " + `${sfIn("company.id", queryCompanyIds.split(","))}` : `${sfIn("company.id", queryCompanyIds.split(","))}`;
        if (queryLevel) q = q ? q + ` and level='${queryLevel}'` : `level='${queryLevel}'`;

        if (q) query += `&filter=${encodeURIComponent(q)}`;

        if (queryExpertiseId) {
            const ef = `expertise.id=${queryExpertiseId}`;
            query += q ? `&filter=${encodeURIComponent(q + " and " + ef)}` : `&filter=${encodeURIComponent(ef)}`;
        }
        if (queryExpertiseIds) {
            const ef = `expertise.id IN [${queryExpertiseIds}]`;
            query += q ? `&filter=${encodeURIComponent(q + " and " + ef)}` : `&filter=${encodeURIComponent(ef)}`;
        }

        try {
            const res = await callFetchPublicJob(query);
            if (res && res.data) {
                const newTotal = res.data.meta?.total ?? 0;
                const results = res.data.result || [];
                setDisplayJob(results);
                setTotal(newTotal);
                onTotalChange?.(newTotal);
                // Always auto-select first job after every fetch
                // (covers filter-change, initial load, empty results)
                if (results.length > 0) {
                    onSelectJob(results[0]);
                } else {
                    onSelectJob(undefined); // clear detail panel
                }
            } else {
                setDisplayJob([]);
                setTotal(0);
                onTotalChange?.(0);
                onSelectJob(undefined);
            }
        } catch (error) {
            console.error('Failed to fetch public jobs', error);
            setDisplayJob([]);
        } finally {
            setIsLoading(false);
        }
    };

    /** HOT nếu đăng trong 1 ngày, SUPER HOT nếu trong 2 giờ */
    const getHotLevel = (createdAt?: string): 'super' | 'hot' | null => {
        if (!createdAt) return null;
        const diff = dayjs().diff(dayjs(createdAt), 'hour');
        if (diff <= 2) return 'super';
        if (diff <= 24) return 'hot';
        return null;
    };

    const formatSalary = (salary?: number) => {
        if (!salary) return null;
        return salary.toLocaleString('vi-VN') + ' đ';
    };

    return (
        <div className={styles.jobListCompact}>
            <Spin spinning={isLoading} tip="Đang tải...">
                {displayJob && displayJob.length > 0 ? (
                    <div className={styles.listWrapper}>
                        {displayJob.map((item) => {
                            const hotLevel = getHotLevel(item.createdAt);
                            const isActive = selectedJobId === item.id;
                            return (
                                <div
                                    key={item.id}
                                    className={`${styles.jobCard} ${isActive ? styles.active : ''} ${hotLevel === 'super' ? styles.superHot : hotLevel === 'hot' ? styles.hotCard : ''}`}
                                    onClick={() => onSelectJob(item)}
                                >
                                    {/* HOT badge */}
                                    {hotLevel && (
                                        <span className={`${styles.hotBadge} ${hotLevel === 'super' ? styles.superBadge : ''}`}>
                                            {hotLevel === 'super' ? '🔥 SUPER HOT' : '🟠 HOT'}
                                        </span>
                                    )}

                                    {/* Posted time */}
                                    <div className={styles.postedTime}>
                                        Đăng {dayjs(item.updatedAt || item.createdAt).fromNow()}
                                    </div>

                                    {/* Job title */}
                                    <div className={styles.jobTitle}>{item.name}</div>

                                    {/* Company row */}
                                    <div className={styles.companyRow}>
                                        <img
                                            alt={item.company?.name}
                                            src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${item?.company?.logo}`}
                                            className={styles.companyLogo}
                                        />
                                        <span className={styles.companyName}>{item.company?.name}</span>
                                    </div>

                                    {/* Salary */}
                                    {item.salary ? (
                                        <div className={styles.salary}>
                                            <DollarOutlined /> {formatSalary(item.salary)}
                                        </div>
                                    ) : (
                                        <div className={styles.salaryHidden}>Đăng nhập để xem mức lương</div>
                                    )}

                                    {/* Meta row */}
                                    <div className={styles.metaRow}>
                                        <span className={styles.metaItem}>
                                            <ThunderboltOutlined /> {item.level}
                                        </span>
                                        <span className={styles.dot}>·</span>
                                        <span className={styles.metaItem}>
                                            <EnvironmentOutlined /> {getLocationName(item.location)}
                                        </span>
                                    </div>

                                    {/* Skills */}
                                    {item.skills && item.skills.length > 0 && (
                                        <div className={styles.skillsRow}>
                                            {item.skills.slice(0, 4).map(s => (
                                                <span key={s.id} className={styles.skillTag}>{s.name}</span>
                                            ))}
                                            {item.skills.length > 4 && (
                                                <span className={styles.skillTag}>+{item.skills.length - 4}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    !isLoading && <Empty description="Không có job nào" style={{ padding: '40px 0' }} />
                )}
            </Spin>
        </div>
    );
};

export default JobListCompact;

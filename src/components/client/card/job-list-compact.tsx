import { callFetchPublicJob } from '@/config/api';
import { convertSlug, getLocationName } from '@/config/utils';
import { IJob } from '@/types/backend';
import { EnvironmentOutlined, ThunderboltOutlined, FireOutlined } from '@ant-design/icons';
import { Empty, Spin, Tag } from 'antd';
import { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import styles from './job-list-compact.module.scss';
import { sfIn } from "spring-filter-query-builder";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface IProps {
    onSelectJob: (job: IJob) => void;
    selectedJobId?: number | string;
}

const JobListCompact = (props: IProps) => {
    const { onSelectJob, selectedJobId } = props;

    const [displayJob, setDisplayJob] = useState<IJob[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const [filter, setFilter] = useState("");
    const [sortQuery, setSortQuery] = useState("sort=updatedAt,desc");
    const [searchParams] = useSearchParams();
    const location = useLocation();

    useEffect(() => {
        fetchJob();
    }, [current, pageSize, filter, sortQuery, location]);

    const fetchJob = async () => {
        setIsLoading(true);
        let query = `page=${current}&size=${pageSize}`;
        if (filter) {
            query += `&${filter}`;
        }
        if (sortQuery) {
            query += `&${sortQuery}`;
        }

        const queryLocation = searchParams.get("location");
        const querySkills = searchParams.get("skills");
        const queryCompanyIds = searchParams.get("companyIds");
        const queryExpertiseId = searchParams.get("expertiseId");
        const queryExpertiseIds = searchParams.get("expertiseIds");
        const queryLevel = searchParams.get("level");

        let q = "";
        if (queryLocation) {
            q = sfIn("location", queryLocation.split(",")).toString();
        }
        if (querySkills) {
            q = queryLocation ? q + " and " + `${sfIn("skills.id", querySkills.split(","))}` : `${sfIn("skills.id", querySkills.split(","))}`;
        }
        if (queryCompanyIds) {
            q = q ? q + " and " + `${sfIn("company.id", queryCompanyIds.split(","))}` : `${sfIn("company.id", queryCompanyIds.split(","))}`;
        }
        if (queryLevel) {
            q = q ? q + " and " + `level='${queryLevel}'` : `level='${queryLevel}'`;
        }

        if (q) {
            query += `&filter=${encodeURIComponent(q)}`;
        }
        if (queryExpertiseId) {
            const expertiseFilter = `expertise.id=${queryExpertiseId}`;
            query += q
                ? `&filter=${encodeURIComponent(q + " and " + expertiseFilter)}`
                : `&filter=${encodeURIComponent(expertiseFilter)}`;
        }
        if (queryExpertiseIds) {
            const expertiseIdsFilter = `expertise.id IN [${queryExpertiseIds}]`;
            query += q
                ? `&filter=${encodeURIComponent(q + " and " + expertiseIdsFilter)}`
                : `&filter=${encodeURIComponent(expertiseIdsFilter)}`;
        }

        try {
            const res = await callFetchPublicJob(query);
            if (res && res.data) {
                setDisplayJob(res.data.result || []);
                if (res.data.result && res.data.result.length > 0 && !selectedJobId) {
                    onSelectJob(res.data.result[0]);
                }
            } else {
                setDisplayJob([]);
            }
        } catch (error) {
            console.error('Failed to fetch public jobs', error);
            setDisplayJob([]);
        } finally {
            setIsLoading(false);
        }
    };

    const isNew = (createdAt?: string) => {
        if (!createdAt) return false;
        const jobDate = dayjs(createdAt);
        const now = dayjs();
        const daysDiff = now.diff(jobDate, 'day');
        return daysDiff <= 2;
    };

    return (
        <div className={styles.jobListCompact}>
            <Spin spinning={isLoading} tip="Đang tải...">
                {displayJob && displayJob.length > 0 ? (
                    <div className={styles.listWrapper}>
                        {displayJob.map((item) => (
                            <div
                                key={item.id}
                                className={`${styles.jobItem} ${selectedJobId === item.id ? styles.active : ''}`}
                                onClick={() => onSelectJob(item)}
                            >
                                <div className={styles.jobItemContent}>
                                    <div className={styles.jobItemLeft}>
                                        <img
                                            alt={item.company?.name}
                                            src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${item?.company?.logo}`}
                                            className={styles.companyLogo}
                                        />
                                    </div>
                                    <div className={styles.jobItemRight}>
                                        <div className={styles.jobItemHeader}>
                                            <div className={styles.jobTitle}>{item.name}</div>
                                            {isNew(item.createdAt) && (
                                                <Tag
                                                    icon={<FireOutlined />}
                                                    color="red"
                                                    className={styles.newBadge}
                                                >
                                                    HOT
                                                </Tag>
                                            )}
                                        </div>
                                        <div className={styles.companyName}>{item.company?.name}</div>
                                        <div className={styles.jobCategory}>{item.level}</div>
                                        <div className={styles.jobMeta}>
                                            <span className={styles.location}>
                                                <EnvironmentOutlined /> {getLocationName(item.location)}
                                            </span>
                                            <span className={styles.workModel}>Remote</span>
                                        </div>
                                        <div className={styles.skillsTags}>
                                            {item.skills?.slice(0, 3).map((skill) => (
                                                <Tag key={skill.id} className={styles.skillTag}>
                                                    {skill.name}
                                                </Tag>
                                            ))}
                                            {item.skills && item.skills.length > 3 && (
                                                <Tag className={styles.skillTag}>+{item.skills.length - 3}</Tag>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    !isLoading && <Empty description="Không có job nào" />
                )}
            </Spin>
        </div>
    );
};

export default JobListCompact;

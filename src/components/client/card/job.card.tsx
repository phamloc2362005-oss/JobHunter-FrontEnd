import { callFetchPublicJob } from '@/config/api';
import { convertSlug, getLocationName } from '@/config/utils';
import { IJob } from '@/types/backend';
import { EnvironmentOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Card, Col, Empty, Pagination, Row, Spin } from 'antd';
import { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import styles from 'styles/client.module.scss';
import { sfIn } from "spring-filter-query-builder";

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);


interface IProps {
    showPagination?: boolean;
}

const JobCard = (props: IProps) => {
    const { showPagination = false } = props;

    const [displayJob, setDisplayJob] = useState<IJob[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(6);
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState("");
    const [sortQuery, setSortQuery] = useState("sort=updatedAt,desc");
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();

    useEffect(() => {
        fetchJob();
    }, [current, pageSize, filter, sortQuery, location]);

    const fetchJob = async () => {
        setIsLoading(true)
        let query = `page=${current}&size=${pageSize}`;
        if (filter) {
            query += `&${filter}`;
        }
        if (sortQuery) {
            query += `&${sortQuery}`;
        }

        //check query string
        const queryLocation = searchParams.get("location");
        const querySkills = searchParams.get("skills")
        const queryCompanyIds = searchParams.get("companyIds")
        const queryExpertiseId = searchParams.get("expertiseId")
        const queryExpertiseIds = searchParams.get("expertiseIds")
        const queryLevel = searchParams.get("level")

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

        const res = await callFetchPublicJob(query);
        if (res && res.data) {
            setDisplayJob(res.data.result);
            setTotal(res.data.meta.total)
        }
        setIsLoading(false);
    }



    const handleOnchangePage = (pagination: { current: number, pageSize: number }) => {
        if (pagination && pagination.current !== current) {
            setCurrent(pagination.current)
        }
        if (pagination && pagination.pageSize !== pageSize) {
            setPageSize(pagination.pageSize)
            setCurrent(1);
        }
    }

    const handleViewDetailJob = (item: IJob) => {
        const slug = convertSlug(item.name);
        navigate(`/job/${slug}?id=${item.id}`)
    }

    return (
        <div className={`${styles["card-job-section"]}`}>
            <div className={`${styles["job-content"]}`}>
                <Spin spinning={isLoading} tip="Loading...">
                    <Row gutter={[20, 20]} align="stretch">
                        <Col span={24}>
                            <div className={styles["section-head"]}>
                                <div>
                                    <span className={styles["section-badge"]}>Latest jobs</span>
                                    <div className={isMobile ? styles["dflex-mobile"] : styles["dflex-pc"]}>
                                        <span className={styles["title"]}>Công Việc Mới Nhất</span>
                                        <p className={styles["section-subtitle"]}>Những job vừa cập nhật được đẩy lên đầu để scan nhanh hơn.</p>
                                    </div>
                                </div>
                                {!showPagination &&
                                    <Link to="job" className={styles["section-link"]}>Xem tất cả</Link>
                                }
                            </div>
                        </Col>

                        {displayJob?.map(item => {
                            return (
                                <Col span={24} md={12} key={item.id} style={{ display: 'flex' }}>
                                    <Card size="small" title={null} hoverable
                                        className={styles["job-card-v2"]}
                                        style={{ width: '100%', height: '100%' }}
                                        onClick={() => handleViewDetailJob(item)}
                                    >
                                        <div className={styles["card-job-content"]} style={{ height: '100%' }}>
                                            <div className={styles["card-job-left-v2"]}>
                                                <img
                                                    alt="example"
                                                    src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${item?.company?.logo}`}
                                                />
                                            </div>
                                            <div className={styles["card-job-right"]}>
                                                <div className={styles["job-title"]}>{item.name}</div>
                                                <div className={styles["job-meta-row"]}>
                                                    <span className={styles["job-location"]}><EnvironmentOutlined style={{ color: '#0f766e' }} />&nbsp;{getLocationName(item.location)}</span>
                                                    <span className={styles["job-salary"]}><ThunderboltOutlined style={{ color: '#f59e0b' }} />&nbsp;{(item.salary + "")?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ</span>
                                                </div>
                                                <div className={styles["job-updatedAt"]}>{item.updatedAt ? dayjs(item.updatedAt).locale('en').fromNow() : dayjs(item.createdAt).locale('en').fromNow()}</div>
                                            </div>
                                        </div>

                                    </Card>
                                </Col>
                            )
                        })}


                        {(!displayJob || displayJob && displayJob.length === 0)
                            && !isLoading &&
                            <div className={styles["empty"]}>
                                <Empty description="Không có dữ liệu" />
                            </div>
                        }
                    </Row>
                    {showPagination && <>
                        <div style={{ marginTop: 30 }}></div>
                        <Row style={{ display: "flex", justifyContent: "center" }}>
                            <Pagination
                                current={current}
                                total={total}
                                pageSize={pageSize}
                                responsive
                                onChange={(p: number, s: number) => handleOnchangePage({ current: p, pageSize: s })}
                            />
                        </Row>
                    </>}
                </Spin>
            </div>
        </div>
    )
}

export default JobCard;
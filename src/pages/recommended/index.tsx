import { EnvironmentOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { callFetchRecommendedJobs } from '@/config/api';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from 'styles/client.module.scss';
import homeStyles from '../home/index.module.scss';
import { Card, Col, Empty, Row, Spin, Tag, Typography } from 'antd';
import type { IJobRecommendation } from '@/types/backend';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { convertSlug, getLocationName } from '@/config/utils';

dayjs.extend(relativeTime);

const RecommendedPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
    const [isLoading, setIsLoading] = useState(false);
    const [jobs, setJobs] = useState<IJobRecommendation[]>([]);

    const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const filter = params.get('filter') || 'all';

    useEffect(() => {
        const init = async () => {
            if (!isAuthenticated) {
                setJobs([]);
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                const res = await callFetchRecommendedJobs(100);
                const result = Array.isArray(res?.data)
                    ? res.data
                    : Array.isArray((res as any)?.data?.data)
                        ? (res as any).data.data
                        : [];
                setJobs(result);
            } catch (error) {
                console.error('Failed to load recommended jobs:', error);
                setJobs([]);
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, [isAuthenticated, filter]);

    return (
        <div className={homeStyles.pageShell}>
            <section className={`${styles['container']} ${homeStyles.contentSection}`}>
                <div className={homeStyles.sectionHeader}>
                    <div>
                        <span className={homeStyles.sectionKicker}>Việc làm phù hợp</span>
                        <h2>Việc làm phù hợp</h2>
                    </div>
                    <p>Những công việc phù hợp nhất với bạn dựa trên mong muốn, kỹ năng và kinh nghiệm.</p>
                </div>

                <Spin spinning={isLoading}>
                    {!isAuthenticated ? (
                        <Card>
                            <Empty description="Cần đăng nhập để xem job phù hợp" />
                        </Card>
                    ) : jobs.length === 0 ? (
                        <Card>
                            <Empty description="Chưa có job phù hợp." />
                        </Card>
                    ) : (
                        <>
                            <div style={{ marginBottom: 12, color: '#334155' }}>
                                Tìm thấy {jobs.length} việc làm phù hợp với yêu cầu của bạn.
                            </div>
                            <Row gutter={[18, 18]}>
                                {jobs.map((item) => {
                                    const job = item?.job;
                                    const jobName = job?.name ?? 'Công việc phù hợp';
                                    const slug = convertSlug(jobName);
                                    return (
                                        <Col xs={24} md={12} xl={8} key={String(job?.id ?? slug)}>
                                            <Card hoverable onClick={() => job?.id ? navigate(`/job/${slug}?id=${job.id}`) : undefined}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                        <div style={{ width: 56, height: 56 }}>
                                                            <img alt={job?.company?.name ?? jobName} src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${job?.company?.logo ?? ''}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                        </div>
                                                        <div>
                                                            <Typography.Title level={5}>{jobName}</Typography.Title>
                                                            <div style={{ color: '#64748b' }}>{job?.company?.name ?? ''}</div>
                                                        </div>
                                                    </div>
                                                    <Tag color={item.score >= 80 ? 'green' : item.score >= 60 ? 'blue' : 'gold'}>{item.score} điểm</Tag>
                                                </div>

                                                <div style={{ marginTop: 12, color: '#334155' }}>{item.matchSummary ?? 'Đang cập nhật thông tin phù hợp.'}</div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, color: '#64748b' }}>
                                                    <span><EnvironmentOutlined /> {getLocationName(job?.location ?? '')}</span>
                                                    <span>{job?.updatedAt ? dayjs(job.updatedAt).fromNow() : job?.createdAt ? dayjs(job.createdAt).fromNow() : ''}</span>
                                                </div>
                                            </Card>
                                        </Col>
                                    );
                                })}
                            </Row>
                        </>
                    )}
                </Spin>
            </section>
        </div>
    );
};

export default RecommendedPage;

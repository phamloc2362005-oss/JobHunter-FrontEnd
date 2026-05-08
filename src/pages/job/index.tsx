import SearchClient from '@/components/client/search.client';
import JobListCompact from '@/components/client/card/job-list-compact';
import JobDetailPanel from '@/components/client/card/job-detail-panel';
import { ArrowRightOutlined, EnvironmentOutlined, FireOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Col, Row, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { IJob } from '@/types/backend';
import { useState } from 'react';
import layoutStyles from 'styles/client.module.scss';
import styles from './index.module.scss';

const ClientJobPage = () => {
    const [selectedJob, setSelectedJob] = useState<IJob | undefined>();

    return (
        <div className={styles.pageShell}>
            <section className={styles.heroSection}>
                <div className={layoutStyles["container"]}>
                    <div className={styles.heroGrid}>
                        <div className={styles.heroCopy}>
                            <span className={styles.kicker}>IT JOB BOARD</span>
                            <Typography.Title level={1} className={styles.heroTitle}>
                                Tìm job IT đúng stack, đúng level
                            </Typography.Title>
                            <p className={styles.heroDescription}>
                                Trang việc làm được thiết kế theo hướng job board cao cấp: nhìn nhanh, lọc nhanh, và đi thẳng vào job phù hợp.
                                Chọn kỹ năng, địa điểm hoặc công ty để thu hẹp kết quả, hoặc bấm tìm kiếm để xem toàn bộ việc làm.
                            </p>

                            <div className={styles.heroActions}>
                                <Link to="#job-feed" className={styles.heroActionPrimary}>
                                    <ThunderboltOutlined />
                                    Khám phá việc làm
                                </Link>
                                <Link to="/recommended" className={styles.heroAction}>
                                    <ArrowRightOutlined />
                                    Việc làm phù hợp
                                </Link>
                            </div>

                            <div className={styles.heroTrustRow}>
                                <Tag className={styles.trustChip}>
                                    <FireOutlined />
                                    Job mới mỗi ngày
                                </Tag>
                                <Tag className={styles.trustChip}>
                                    <EnvironmentOutlined />
                                    Lọc theo địa điểm
                                </Tag>
                                <Tag className={styles.trustChip}>
                                    <ArrowRightOutlined />
                                    Gợi ý theo level và skill
                                </Tag>
                            </div>

                            <div className={styles.statGrid}>
                                <div className={styles.statCard}>
                                    <strong>Fast filtering</strong>
                                    <span>Chọn skill, company và location trong một form duy nhất.</span>
                                </div>
                                <div className={styles.statCard}>
                                    <strong>Premium jobs</strong>
                                    <span>Card layout rõ ràng, dễ scan nhanh như trang job board lớn.</span>
                                </div>
                                <div className={styles.statCard}>
                                    <strong>Career match</strong>
                                    <span>Hồ sơ tốt hơn sẽ đẩy job phù hợp lên đầu danh sách.</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.searchShell}>
                            <div className={styles.searchGlow} />
                            <div className={styles.searchIntro}>
                                <span className={styles.searchKicker}>Bộ lọc nhanh</span>
                                <h2 className={styles.searchTitle}>Tìm đúng job trong vài giây</h2>
                                <p className={styles.searchDescription}>
                                    Lọc theo kỹ năng, công ty và địa điểm để rút ngắn thời gian scan job. Không chọn gì vẫn xem được toàn bộ việc làm.
                                </p>
                            </div>
                            <div className={styles.searchPanel}>
                                <SearchClient />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="job-feed" className={`${layoutStyles["container"]} ${styles.feedSection}`}>
                <Row gutter={0} className={styles.feedGrid}>
                    {/* Job List Column */}
                    <Col span={24} md={10} className={styles.feedCol}>
                        <div className={styles.jobListColumn}>
                            <div className={styles.columnHeader}>
                                <span className={styles.sectionKicker}>Danh sách việc làm</span>
                                <Typography.Title level={3} style={{ margin: '8px 0 4px' }}>
                                    Job đang mở
                                </Typography.Title>
                                <p className={styles.columnDescription}>
                                    Chọn job để xem chi tiết
                                </p>
                            </div>
                            <div className={styles.listContainer}>
                                <JobListCompact
                                    onSelectJob={setSelectedJob}
                                    selectedJobId={selectedJob?.id}
                                />
                            </div>
                        </div>
                    </Col>

                    {/* Job Detail Column */}
                    <Col span={24} md={14} className={styles.feedCol}>
                        <div className={styles.jobDetailColumn}>
                            <JobDetailPanel job={selectedJob} />
                        </div>
                    </Col>
                </Row>
            </section>
        </div>
    )
}

export default ClientJobPage;
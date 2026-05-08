import SearchClient from '@/components/client/search.client';
import JobCard from '@/components/client/card/job.card';
import { ArrowRightOutlined, EnvironmentOutlined, FireOutlined, ThunderboltOutlined, TrophyOutlined } from '@ant-design/icons';
import { Col, Row, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import layoutStyles from 'styles/client.module.scss';
import styles from './index.module.scss';

const ClientJobPage = (props: any) => {
    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);

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
                                Thiết kế theo kiểu TopCV và ITviec: gọn, sáng, nhiều lớp lọc và scan job nhanh hơn.
                                Chọn kỹ năng, công ty và địa điểm để đi thẳng vào danh sách phù hợp nhất.
                            </p>

                            <div className={styles.heroActions}>
                                <Link to={isAuthenticated ? "/recommended" : "/login"} className={styles.heroActionPrimary}>
                                    <ThunderboltOutlined />
                                    Xem job phù hợp
                                </Link>
                                <Link to={isAuthenticated ? "/?manageAccount=1" : "/login"} className={styles.heroAction}>
                                    <TrophyOutlined />
                                    Cập nhật hồ sơ
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
                                    Lọc theo kỹ năng, công ty và địa điểm để rút ngắn thời gian scan job.
                                </p>
                            </div>
                            <div className={styles.searchPanel}>
                                <SearchClient />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className={`${layoutStyles["container"]} ${styles.feedSection}`}>
                <Row gutter={[20, 20]}>
                    <Col span={24}>
                        <div className={styles.feedHeader}>
                            <div>
                                <span className={styles.sectionKicker}>Danh sách việc làm</span>
                                <Typography.Title level={2} style={{ margin: '10px 0 0' }}>
                                    Các job đang mở
                                </Typography.Title>
                                <p>
                                    Duyệt danh sách job theo thứ tự mới nhất, sau đó dùng bộ lọc ở trên để thu hẹp kết quả.
                                </p>
                            </div>

                            <div className={styles.feedStats}>
                                <div className={styles.feedStat}>
                                    <strong>Quick scan</strong>
                                    <span>Thông tin job hiển thị theo card dễ đọc.</span>
                                </div>
                                <div className={styles.feedStat}>
                                    <strong>Multi filter</strong>
                                    <span>Search theo skill, company hoặc location.</span>
                                </div>
                                <div className={styles.feedStat}>
                                    <strong>Smart match</strong>
                                    <span>Job phù hợp hơn sẽ được đẩy lên phía trên.</span>
                                </div>
                            </div>
                        </div>
                    </Col>

                    <Col span={24}>
                        <div className={styles.feedSurface}>
                            <JobCard
                                showPagination={true}
                            />
                        </div>
                    </Col>
                </Row>
            </section>
        </div>
    )
}

export default ClientJobPage;
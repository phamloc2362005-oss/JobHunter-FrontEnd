import { callFetchExpertise } from "@/config/api";
import type { IExpertise } from "@/types/backend";
import { Col, Empty, Row, Spin, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./index.module.scss";

const PAGE_SIZE_ALL = 2000;

const chunk = <T,>(arr: T[], size: number) => {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
};

const ExpertisePage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [expertises, setExpertises] = useState<IExpertise[]>([]);

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            const res = await callFetchExpertise(`page=1&size=${PAGE_SIZE_ALL}&sort=name,asc`);
            if (res?.data?.result) setExpertises(res.data.result);
            setIsLoading(false);
        };

        init();
    }, []);

    const columns = useMemo(() => {
        const colCount = 4;
        const perCol = Math.ceil((expertises?.length ?? 0) / colCount) || 1;
        return chunk(expertises, perCol);
    }, [expertises]);

    return (
        <div className={styles.pageShell}>
            <Spin spinning={isLoading}>
                <section className={styles.hero}>
                    <div className={styles.heroCopy}>
                        <span className={styles.kicker}>EXPERTISE LIBRARY</span>
                        <Typography.Title level={2} className={styles.title}>
                            Tìm việc làm IT theo chuyên môn
                        </Typography.Title>
                        <p className={styles.description}>
                            Khám phá toàn bộ chuyên môn đang có trên hệ thống và đi thẳng tới các job phù hợp chỉ bằng một cú click.
                        </p>
                    </div>

                    <div className={styles.heroStat}>
                        <span className={styles.statNumber}>{expertises.length}</span>
                        <span className={styles.statLabel}>chuyên môn</span>
                    </div>
                </section>

                <section className={styles.contentCard}>
                    <div className={styles.contentHeader}>
                        <div>
                            <Typography.Title level={4} className={styles.sectionTitle}>
                                Danh sách chuyên môn
                            </Typography.Title>
                            <p className={styles.sectionNote}>
                                Chọn một chuyên môn để xem ngay các job liên quan.
                            </p>
                        </div>
                    </div>

                    {!isLoading && expertises.length === 0 ? (
                        <div className={styles.emptyState}>
                            <Empty description="Chưa có dữ liệu expertise" />
                        </div>
                    ) : (
                        <Row gutter={[18, 18]}>
                            {columns.map((col, idx) => (
                                <Col span={24} md={6} key={`col-${idx}`}>
                                    <div className={styles.column}>
                                        {col.map((expertise) => (
                                            <Link
                                                key={String(expertise.id)}
                                                to={`/job?expertiseId=${expertise.id}`}
                                                className={styles.expertiseLink}
                                            >
                                                {expertise.name}
                                            </Link>
                                        ))}
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    )}
                </section>
            </Spin>
        </div>
    );
};

export default ExpertisePage;
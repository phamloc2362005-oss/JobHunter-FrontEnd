import { callFetchAllSkill } from "@/config/api";
import type { ISkill } from "@/types/backend";
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

const SkillsPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [skills, setSkills] = useState<ISkill[]>([]);

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            const res = await callFetchAllSkill(`page=1&size=${PAGE_SIZE_ALL}&sort=name,asc`);
            if (res?.data?.result) setSkills(res.data.result);
            setIsLoading(false);
        };
        init();
    }, []);

    const columns = useMemo(() => {
        const colCount = 4;
        const perCol = Math.ceil((skills?.length ?? 0) / colCount) || 1;
        return chunk(skills, perCol);
    }, [skills]);

    return (
        <div className={styles.pageShell}>
            <Spin spinning={isLoading}>
                <section className={styles.hero}>
                    <div className={styles.heroCopy}>
                        <span className={styles.kicker}>SKILLS LIBRARY</span>
                        <Typography.Title level={2} className={styles.title}>
                            Find IT jobs by skills
                        </Typography.Title>
                        <p className={styles.description}>
                            Browse all available skills in our system and find matching jobs with a single click.
                        </p>
                    </div>

                    <div className={styles.heroStat}>
                        <span className={styles.statNumber}>{skills.length}</span>
                        <span className={styles.statLabel}>skills</span>
                    </div>
                </section>

                <section className={styles.contentCard}>
                    <div className={styles.contentHeader}>
                        <div>
                            <Typography.Title level={4} className={styles.sectionTitle}>
                                Skills List
                            </Typography.Title>
                            <p className={styles.sectionNote}>
                                Select a skill to view related jobs.
                            </p>
                        </div>
                    </div>

                    {!isLoading && skills.length === 0 ? (
                        <div className={styles.emptyState}>
                            <Empty description="No skills data found" />
                        </div>
                    ) : (
                        <Row gutter={[18, 18]}>
                            {columns.map((col, idx) => (
                                <Col span={24} md={6} key={`col-${idx}`}>
                                    <div className={styles.column}>
                                        {col.map((s) => (
                                            <Link
                                                key={String(s.id)}
                                                to={`/job?skills=${s.id}`}
                                                className={styles.skillLink}
                                            >
                                                {s.name}
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

export default SkillsPage;


import { callFetchAllSkill } from "@/config/api";
import type { ISkill } from "@/types/backend";
import { Col, Empty, Row, Spin, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "styles/client.module.scss";

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
        <div className={styles["container"]} style={{ marginTop: 20 }}>
            <Spin spinning={isLoading}>
                <Typography.Title level={3} style={{ marginBottom: 6 }}>
                    Tìm việc làm IT theo kỹ năng
                </Typography.Title>
                <div style={{ height: 1, background: "#eee", margin: "14px 0 18px" }} />

                {!isLoading && skills.length === 0 ? (
                    <Empty description="Chưa có dữ liệu skills" />
                ) : (
                    <Row gutter={[24, 12]}>
                        {columns.map((col, idx) => (
                            <Col span={24} md={6} key={`col-${idx}`}>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    {col.map((s) => (
                                        <Link
                                            key={String(s.id)}
                                            to={`/job?skills=${s.id}`}
                                            style={{ color: "#1f2937", textDecoration: "none" }}
                                        >
                                            {s.name}
                                        </Link>
                                    ))}
                                </div>
                            </Col>
                        ))}
                    </Row>
                )}
            </Spin>
        </div>
    );
};

export default SkillsPage;


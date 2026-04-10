import { callFetchAllSkill } from "@/config/api";
import { LOCATION_LIST } from "@/config/utils";
import type { ISkill } from "@/types/backend";
import { RightOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./job-mega-menu.module.scss";

type MenuKey = "skills" | "expertise" | "level" | "company" | "city";

const PAGE_SIZE_ALL = 2000;

const LEVELS = [
    { label: "INTERN", value: "INTERN" },
    { label: "FRESHER", value: "FRESHER" },
    { label: "JUNIOR", value: "JUNIOR" },
    { label: "MIDDLE", value: "MIDDLE" },
    { label: "SENIOR", value: "SENIOR" },
];

const JobMegaMenu = ({ onNavigate }: { onNavigate?: () => void }) => {
    const [active, setActive] = useState<MenuKey>("skills");
    const [isLoading, setIsLoading] = useState(false);
    const [skills, setSkills] = useState<ISkill[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            const res = await callFetchAllSkill(`page=1&size=${PAGE_SIZE_ALL}&sort=name,asc`);
            if (res?.data?.result) setSkills(res.data.result);
            setIsLoading(false);
        };
        init();
    }, []);

    const leftItems: { key: MenuKey; label: string }[] = [
        { key: "skills", label: "Việc làm IT theo kỹ năng" },
        { key: "level", label: "Việc làm IT theo cấp bậc" },
        { key: "company", label: "Việc làm IT theo công ty" },
        { key: "city", label: "Việc làm IT theo thành phố" },
    ];

    const skillLinks = useMemo(() => skills.slice(0, 40), [skills]);

    const go = (to: string) => {
        navigate(to);
        onNavigate?.();
    };

    return (
        <div className={styles.overlay} onMouseLeave={() => setActive("skills")}>
            <div className={styles.wrap}>
                <div className={styles.left}>
                    {leftItems.map((it) => (
                        <div
                            key={it.key}
                            className={`${styles.leftItem} ${active === it.key ? styles.leftItemActive : ""}`}
                            onMouseEnter={() => setActive(it.key)}
                            onClick={() => setActive(it.key)}
                        >
                            <span>{it.label}</span>
                            <RightOutlined className={styles.chev} />
                        </div>
                    ))}
                </div>

                <div className={styles.right}>
                    {active === "skills" && (
                        <Spin spinning={isLoading}>
                            <div className={styles.grid}>
                                {skillLinks.map((s) => (
                                    <Link
                                        key={String(s.id)}
                                        to={`/job?skills=${s.id}`}
                                        className={styles.link}
                                        onClick={() => onNavigate?.()}
                                        title={s.name}
                                    >
                                        {s.name}
                                    </Link>
                                ))}
                            </div>
                            <div className={styles.footer}>
                                <Link to="/skills" className={styles.link} onClick={() => onNavigate?.()}>
                                    Xem tất cả »
                                </Link>
                            </div>
                        </Spin>
                    )}

                    {active === "level" && (
                        <div className={styles.grid} style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                            {LEVELS.map((lv) => (
                                <a
                                    key={lv.value}
                                    className={styles.link}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => go(`/job?level=${encodeURIComponent(lv.value)}`)}
                                >
                                    {lv.label}
                                </a>
                            ))}
                        </div>
                    )}

                    {active === "company" && (
                        <div>
                            <div style={{ marginBottom: 10, fontWeight: 600 }}>Việc làm IT theo công ty</div>
                            <div className={styles.muted} style={{ marginBottom: 12 }}>
                                Xem danh sách công ty và chọn để xem job.
                            </div>
                            <a
                                className={styles.link}
                                onClick={() => go("/company")}
                                style={{ cursor: "pointer", display: "inline-block" }}
                            >
                                Xem tất cả công ty »
                            </a>
                        </div>
                    )}

                    {active === "city" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {LOCATION_LIST.map((loc) => (
                                <a
                                    key={loc.value}
                                    className={styles.link}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => go(`/job?location=${encodeURIComponent(loc.value)}`)}
                                >
                                    {loc.label}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobMegaMenu;


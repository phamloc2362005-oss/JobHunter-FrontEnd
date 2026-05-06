import { callFetchAllSkill, callFetchCompany, callFetchExpertise } from "@/config/api";
import { LOCATION_LIST } from "@/config/utils";
import type { ICompany, IExpertise, ISkill } from "@/types/backend";
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
    const [companies, setCompanies] = useState<ICompany[]>([]);
    const [expertises, setExpertises] = useState<IExpertise[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            const [skillRes, companyRes, categoryRes] = await Promise.all([
                callFetchAllSkill(`page=1&size=${PAGE_SIZE_ALL}&sort=name,asc`),
                callFetchCompany(`page=1&size=${PAGE_SIZE_ALL}&sort=updatedAt,desc`),
                callFetchExpertise(`page=1&size=${PAGE_SIZE_ALL}&sort=name,asc`),
            ]);

            if (skillRes?.data?.result) setSkills(skillRes.data.result);
            if (companyRes?.data?.result) setCompanies(companyRes.data.result);
            if (categoryRes?.data?.result) setExpertises(categoryRes.data.result);
            setIsLoading(false);
        };
        init();
    }, []);

    const leftItems: { key: MenuKey; label: string }[] = [
        { key: "skills", label: "Việc làm IT theo kỹ năng" },
        { key: "expertise", label: "Việc làm IT theo chuyên môn" },
        { key: "level", label: "Việc làm IT theo cấp bậc" },
        { key: "company", label: "Việc làm IT theo công ty" },
        { key: "city", label: "Việc làm IT theo thành phố" },
    ];

    const skillLinks = useMemo(() => skills.slice(0, 40), [skills]);
    const companyLinks = useMemo(() => companies.slice(0, 40), [companies]);
    const expertiseLinks = useMemo(() => expertises.slice(0, 20), [expertises]);

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

                    {active === "expertise" && (
                        <Spin spinning={isLoading}>
                            <div className={styles.grid} style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                                {expertiseLinks.map((expertise) => (
                                    <Link
                                        key={String(expertise.id)}
                                        to={`/job?expertiseId=${expertise.id}`}
                                        className={styles.link}
                                        onClick={() => onNavigate?.()}
                                        title={expertise.name}
                                    >
                                        {expertise.name}
                                    </Link>
                                ))}
                            </div>
                            <div className={styles.footer}>
                                <Link to="/expertise" className={styles.link} onClick={() => onNavigate?.()}>
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
                        <Spin spinning={isLoading}>
                            <div className={styles.grid}>
                                {companyLinks.map((company) => (
                                    <Link
                                        key={String(company.id)}
                                        to={`/job?companyIds=${company.id}`}
                                        className={styles.link}
                                        onClick={() => onNavigate?.()}
                                        title={company.name}
                                    >
                                        {company.name}
                                    </Link>
                                ))}
                            </div>
                            <div className={styles.footer}>
                                <Link to="/company" className={styles.link} onClick={() => onNavigate?.()}>
                                    Xem tất cả công ty »
                                </Link>
                            </div>
                        </Spin>
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


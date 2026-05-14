import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { IJob } from "@/types/backend";
import { callFetchPublicJob, callFetchPublicJobById } from "@/config/api";
import parse from 'html-react-parser';
import { Button, Col, Divider, Row, Skeleton, Tag, Typography, Breadcrumb, Space } from "antd";
import {
    DollarOutlined,
    EnvironmentOutlined,
    HistoryOutlined,
    ThunderboltOutlined,
    HomeOutlined,
    GlobalOutlined,
    SafetyCertificateOutlined,
    ArrowRightOutlined
} from "@ant-design/icons";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import ApplyModal from "@/components/client/modal/apply.modal";
import JobDetailHighlights from "@/components/client/job/job-detail-highlights";
import { sfIn } from "spring-filter-query-builder";
import { convertSlug } from "@/config/utils";
import detailStyles from './detail.module.scss';

dayjs.extend(relativeTime);

const ClientJobDetailPage = (props: any) => {
    const [jobDetail, setJobDetail] = useState<IJob | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [similarJobs, setSimilarJobs] = useState<IJob[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const id = params?.get("id");

    const handleSkillClick = (skillId: string) => {
        navigate(`/job?skills=${encodeURIComponent(skillId)}`);
    };

    useEffect(() => {
        const init = async () => {
            if (id) {
                setIsLoading(true);
                try {
                    const res = await callFetchPublicJobById(id);
                    if (res?.data) {
                        setJobDetail(res.data);
                    }
                } finally {
                    setIsLoading(false);
                }
            }
        };
        init();
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        const fetchSimilar = async () => {
            const companyId = jobDetail?.company?.id;
            const jobId = jobDetail?.id;
            if (!companyId || !jobId) {
                setSimilarJobs([]);
                return;
            }
            // Sử dụng filter thô để đảm bảo Backend nhận đúng
            const q = `company.id=${companyId}`;
            const res = await callFetchPublicJob(`page=1&size=6&filter=${encodeURIComponent(q)}&sort=updatedAt,desc`);
            const list = (res?.data?.result ?? []).filter((j: IJob) => `${j.id}` !== `${jobId}`).slice(0, 3);
            setSimilarJobs(list);
        };
        fetchSimilar();
    }, [jobDetail?.company?.id, jobDetail?.id]);

    if (isLoading) {
        return (
            <div className={detailStyles.jobDetailPage}>
                <div className={detailStyles.mainContainer} style={{ paddingTop: 40 }}>
                    <Skeleton active paragraph={{ rows: 10 }} />
                </div>
            </div>
        );
    }

    if (!jobDetail) return null;

    const timeLabel = jobDetail.updatedAt
        ? dayjs(jobDetail.updatedAt).fromNow()
        : dayjs(jobDetail.createdAt).fromNow();

    return (
        <div className={detailStyles.jobDetailPage}>
            {/* ════ HERO SECTION ════ */}
            <header className={detailStyles.heroSection}>
                <div className={detailStyles.mainContainer}>
                    <div className={detailStyles.heroInner}>
                        <div className={detailStyles.companyLogoWrapper}>
                            <img
                                alt={jobDetail.company?.name}
                                src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${jobDetail.company?.logo}`}
                            />
                        </div>

                        <div className={detailStyles.heroContent}>
                            <h1 className={detailStyles.jobTitle}>{jobDetail.name}</h1>
                            <div className={detailStyles.companyName}>
                                <GlobalOutlined />
                                <Link to={`/company/${convertSlug(jobDetail.company?.name || "company")}?id=${jobDetail.company?.id}`}>
                                    {jobDetail.company?.name}
                                </Link>
                            </div>

                            {jobDetail.skills && jobDetail.skills.length > 0 && (
                                <div style={{ marginBottom: 24 }}>
                                    <Space wrap size={[8, 8]}>
                                        {jobDetail.skills.map((s) => (
                                            <Tag
                                                key={s.id}
                                                color="blue"
                                                style={{ borderRadius: 6, padding: '4px 12px', fontSize: 13, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff' }}
                                                onClick={() => s.id && handleSkillClick(String(s.id))}
                                            >
                                                {s.name}
                                            </Tag>
                                        ))}
                                    </Space>
                                </div>
                            )}

                            <div className={detailStyles.heroActions}>
                                <Button
                                    type="primary"
                                    className={detailStyles.btnApply}
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    Apply for this job
                                </Button>
                                <Button
                                    className={detailStyles.btnInterview}
                                    onClick={() => navigate(`/interview/${jobDetail.id}`)}
                                >
                                    Mock Interview with AI
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ════ MAIN CONTENT ════ */}
            <main className={detailStyles.mainContainer}>
                <div className={detailStyles.contentRow}>

                    {/* Left Column: Job Info */}
                    <div className={detailStyles.mainColumn}>
                        <section className={detailStyles.contentCard}>
                            <div className={detailStyles.sectionTitle}>
                                Job Description
                            </div>
                            <div className={detailStyles.jobDescription}>
                                {jobDetail.description ? parse(jobDetail.description) : "No description provided."}
                            </div>

                            <Divider style={{ margin: '40px 0' }} />

                            <JobDetailHighlights job={jobDetail} />
                        </section>
                    </div>

                    {/* Right Column: Sidebar */}
                    <aside className={detailStyles.sideColumn}>
                        {/* Quick Info Card */}
                        <div className={detailStyles.sidebarCard}>
                            <div className={detailStyles.infoWidget}>
                                <div className={detailStyles.infoItem}>
                                    <div className={detailStyles.infoIcon} style={{ background: '#ecfdf5', color: '#059669' }}>
                                        <DollarOutlined />
                                    </div>
                                    <div>
                                        <div className={detailStyles.infoLabel}>Salary range</div>
                                        <div className={`${detailStyles.infoValue} ${detailStyles.salary}`}>
                                            {(jobDetail.salary + "")?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} VND
                                        </div>
                                    </div>
                                </div>

                                <div className={detailStyles.infoItem}>
                                    <div className={detailStyles.infoIcon}>
                                        <EnvironmentOutlined />
                                    </div>
                                    <div>
                                        <div className={detailStyles.infoLabel}>Location</div>
                                        <div className={detailStyles.infoValue}>{jobDetail.location}</div>
                                    </div>
                                </div>

                                <div className={detailStyles.infoItem}>
                                    <div className={detailStyles.infoIcon}>
                                        <ThunderboltOutlined />
                                    </div>
                                    <div>
                                        <div className={detailStyles.infoLabel}>Job Level</div>
                                        <div className={detailStyles.infoValue}>{jobDetail.level}</div>
                                    </div>
                                </div>

                                <div className={detailStyles.infoItem}>
                                    <div className={detailStyles.infoIcon}>
                                        <HistoryOutlined />
                                    </div>
                                    <div>
                                        <div className={detailStyles.infoLabel}>Posted Date</div>
                                        <div className={detailStyles.infoValue}>{timeLabel}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Hiring Company Card */}
                        <div className={detailStyles.sidebarCard}>
                            <div className={detailStyles.companyWidget}>
                                <img
                                    className={detailStyles.smallLogo}
                                    alt="company-logo"
                                    src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${jobDetail.company?.logo}`}
                                />
                                <div className={detailStyles.smallName}>{jobDetail.company?.name}</div>
                            </div>
                            <Button
                                className={detailStyles.btnViewCompany}
                                onClick={() => navigate(`/company/${convertSlug(jobDetail.company?.name || "company")}?id=${jobDetail.company?.id}`)}
                            >
                                View Company Profile
                            </Button>
                        </div>

                        {/* Similar Jobs */}
                        {similarJobs.length > 0 && (
                            <div className={detailStyles.sidebarCard}>
                                <div style={{ fontWeight: 800, marginBottom: 20, fontSize: 16 }}>
                                    Similar Opportunities
                                </div>
                                <div className={detailStyles.similarList}>
                                    {similarJobs.map((j) => (
                                        <Link key={j.id} to={`/job/${convertSlug(j.name)}?id=${j.id}`} className={detailStyles.similarItem}>
                                            <img
                                                className={detailStyles.similarLogo}
                                                alt={j.name}
                                                src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${j.company?.logo}`}
                                            />
                                            <div style={{ flex: 1 }}>
                                                <div className={detailStyles.similarTitle}>{j.name}</div>
                                                <div className={detailStyles.similarMeta}>
                                                    {j.location} • <span style={{ color: '#059669', fontWeight: 600 }}>{(j.salary + "")?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                                                </div>
                                            </div>
                                            <ArrowRightOutlined style={{ fontSize: 12, color: '#94a3b8' }} />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            </main>

            <ApplyModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                jobDetail={jobDetail}
            />
        </div>
    );
};

export default ClientJobDetailPage;
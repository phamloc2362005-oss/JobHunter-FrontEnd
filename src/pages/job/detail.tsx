import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from 'react';
import { IJob } from "@/types/backend";
import { callFetchPublicJob, callFetchPublicJobById } from "@/config/api";
import styles from 'styles/client.module.scss';
import parse from 'html-react-parser';
import { Button, Card, Col, Divider, Row, Skeleton, Tag, Typography } from "antd";
import { DollarOutlined, EnvironmentOutlined, HistoryOutlined } from "@ant-design/icons";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import ApplyModal from "@/components/client/modal/apply.modal";
import JobDetailHighlights from "@/components/client/job/job-detail-highlights";
import { sfIn } from "spring-filter-query-builder";
dayjs.extend(relativeTime)


const ClientJobDetailPage = (props: any) => {
    const [jobDetail, setJobDetail] = useState<IJob | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [similarJobs, setSimilarJobs] = useState<IJob[]>([]);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const id = params?.get("id"); // job id

    useEffect(() => {
        const init = async () => {
            if (id) {
                setIsLoading(true)
                const res = await callFetchPublicJobById(id);
                if (res?.data) {
                    setJobDetail(res.data)
                }
                setIsLoading(false)
            }
        }
        init();
    }, [id]);

    useEffect(() => {
        const fetchSimilar = async () => {
            const companyId = jobDetail?.company?.id;
            const jobId = jobDetail?.id;
            if (!companyId || !jobId) {
                setSimilarJobs([]);
                return;
            }
            const q = sfIn("company.id", [companyId]).toString();
            const res = await callFetchPublicJob(`page=1&size=6&filter=${encodeURIComponent(q)}&sort=updatedAt,desc`);
            const list = (res?.data?.result ?? []).filter((j: IJob) => `${j.id}` !== `${jobId}`).slice(0, 3);
            setSimilarJobs(list);
        };
        fetchSimilar();
    }, [jobDetail?.company?.id, jobDetail?.id]);

    return (
        <div className={`${styles["container"]} ${styles["detail-job-section"]}`}>
            {isLoading ?
                <Skeleton />
                :
                <Row gutter={[20, 20]}>
                    {jobDetail && jobDetail.id &&
                        <>
                            <Col span={24} md={16}>
                                <Card className={styles["jobDetailCard"]} bordered={false}>
                                    <div className={styles["jobTop"]}>
                                        <div>
                                            <div className={styles["header"]}>{jobDetail.name}</div>
                                            <div className={styles["jobMeta"]}>
                                                <span className={styles["jobMetaItem"]}>
                                                    <DollarOutlined /> {(jobDetail.salary + "")?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ
                                                </span>
                                                <span className={styles["jobMetaItem"]}>
                                                    <EnvironmentOutlined /> {jobDetail.location}
                                                </span>
                                                <span className={styles["jobMetaItem"]}>
                                                    <HistoryOutlined /> {jobDetail.updatedAt ? dayjs(jobDetail.updatedAt).locale("en").fromNow() : dayjs(jobDetail.createdAt).locale("en").fromNow()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={styles["jobTopActions"]}>
                                            <Button type="primary" size="large" className={styles["btnApplyV2"]} onClick={() => setIsModalOpen(true)}>
                                                Apply Now
                                            </Button>
                                        </div>
                                    </div>

                                    <div className={styles["skillsRow"]}>
                                        {jobDetail?.skills?.map((item, index) => (
                                            <Tag key={`${index}-key`} color="gold">
                                                {item.name}
                                            </Tag>
                                        ))}
                                    </div>

                                    <Divider />

                                    <Typography.Title level={4} className={styles["sectionTitle"]}>
                                        Job Description
                                    </Typography.Title>
                                    <div className={styles["jobDescription"]}>
                                        {jobDetail.description ? parse(jobDetail.description) : <Typography.Text type="secondary">Chưa cập nhật</Typography.Text>}
                                    </div>

                                    <JobDetailHighlights job={jobDetail} />
                                </Card>
                            </Col>

                            <Col span={24} md={8}>
                                <div className={styles["jobSidebar"]}>
                                    <Card title="Hiring Company" bordered={false} className={styles["sidebarCard"]}>
                                        <div className={styles["companyBox"]}>
                                            <img
                                                className={styles["companyLogo"]}
                                                alt="company-logo"
                                                src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${jobDetail.company?.logo}`}
                                            />
                                            <div>
                                                <div className={styles["companyName"]}>{jobDetail.company?.name}</div>
                                                <div className={styles["companyAddress"]}>
                                                    <EnvironmentOutlined /> {jobDetail.location ?? "—"}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>

                                    <Card title="Similar opportunities" bordered={false} className={styles["sidebarCard"]}>
                                        {similarJobs.length === 0 ? (
                                            <Typography.Text type="secondary">Chưa có job tương tự</Typography.Text>
                                        ) : (
                                            <div className={styles["similarList"]}>
                                                {similarJobs.map((j) => (
                                                    <Link key={String(j.id)} to={`/job/${encodeURIComponent(j.name)}?id=${j.id}`} className={styles["similarItem"]}>
                                                        <img
                                                            className={styles["similarLogo"]}
                                                            alt="company-logo"
                                                            src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${j.company?.logo}`}
                                                        />
                                                        <div className={styles["similarBody"]}>
                                                            <div className={styles["similarTitle"]}>{j.name}</div>
                                                            <div className={styles["similarMeta"]}>
                                                                {j.company?.name} • {j.location}
                                                            </div>
                                                            <div className={styles["similarMeta2"]}>
                                                                <DollarOutlined /> {(j.salary + "")?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </Card>
                                </div>
                            </Col>
                        </>
                    }
                </Row>
            }
            <ApplyModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                jobDetail={jobDetail}
            />
        </div>
    )
}
export default ClientJobDetailPage;
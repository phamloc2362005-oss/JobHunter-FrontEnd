import { useLocation, useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import { ICompany } from "@/types/backend";
import { callFetchCompanyById } from "@/config/api";
import styles from 'styles/client.module.scss';
import parse from 'html-react-parser';
import { Col, Row, Skeleton, Card, Divider } from "antd";
import { EnvironmentOutlined, ThunderboltOutlined, TeamOutlined, GlobalOutlined, RightOutlined, CodeOutlined } from "@ant-design/icons";
import { IJob } from "@/types/backend";
import { callFetchPublicJob } from "@/config/api";
import { getLocationName, convertSlug } from '@/config/utils';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import s from './detail.module.scss';
import homeStyles from '@/pages/home/index.module.scss';

dayjs.extend(relativeTime);


const ClientCompanyDetailPage = (props: any) => {
    const [companyDetail, setCompanyDetail] = useState<ICompany | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [companyJobs, setCompanyJobs] = useState<IJob[]>([]);
    const [isLoadingJobs, setIsLoadingJobs] = useState<boolean>(false);
    
    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const id = params?.get("id"); // job id, actually company id

    const navigate = useNavigate();

    useEffect(() => {
        const init = async () => {
            if (id) {
                setIsLoading(true)
                const res = await callFetchCompanyById(id);
                if (res?.data) {
                    setCompanyDetail(res.data)
                }
                setIsLoading(false)
            }
        }
        init();
    }, [id]);

    useEffect(() => {
        const fetchJobs = async () => {
            if (id) {
                setIsLoadingJobs(true);
                const query = `page=1&size=20&filter=company.id='${id}' and active=true&sort=updatedAt,desc`;
                const res = await callFetchPublicJob(query);
                if (res?.data?.result) {
                    setCompanyJobs(res.data.result);
                }
                setIsLoadingJobs(false);
            }
        };
        fetchJobs();
    }, [id]);

    return (
        <div className={s.page}>
            <section className={s.hero}>
                <div className={`${styles["container"]} ${s.heroInner}`}>
                    {companyDetail?.logo && (
                        <div className={s.logoWrap}>
                            <img
                                alt={companyDetail?.name}
                                src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${companyDetail?.logo}`}
                            />
                        </div>
                    )}
                    <div className={s.heroInfo}>
                        <h1 className={s.companyName}>{companyDetail?.name || 'Công ty'}</h1>
                        {companyDetail?.address && (
                            <div className={s.companyMeta}>
                                <span><EnvironmentOutlined /> {companyDetail?.address}</span>
                                <span><TeamOutlined /> 50-150 nhân viên</span>
                                <span><GlobalOutlined /> {companyDetail?.name?.toLowerCase().replace(/\s/g, '')}.com</span>
                            </div>
                        )}
                        <div className={s.jobCountBadge}>
                            {companyJobs.length} Việc làm đang tuyển
                        </div>
                    </div>
                </div>
            </section>

            <section className={s.contentWrap}>
                <div className={`${styles["container"]}`}>
                    <Row gutter={[24, 24]}>
                        <Col span={24} md={16}>
                            <div className={s.contentCard}>
                                {isLoading ? (
                                    <Skeleton active />
                                ) : (
                                    <>
                                        <div className={s.contentHeader}>
                                            <h2>Giới thiệu công ty</h2>
                                        </div>
                                        <div className={s.description}>
                                            {parse(companyDetail?.description ?? "Chưa có mô tả.")}
                                        </div>
                                    </>
                                )}
                            </div>
                        </Col>

                        <Col span={24} md={8}>
                            <div className={s.jobsSidebar}>
                                <h3 className={s.sidebarTitle}>Tuyển dụng hiện tại</h3>
                                <Divider style={{ margin: '12px 0' }} />
                                {isLoadingJobs ? (
                                    <Skeleton active paragraph={{ rows: 4 }} />
                                ) : companyJobs.length > 0 ? (
                                    <div className={s.jobList}>
                                        {companyJobs.map(job => (
                                            <div 
                                                key={job.id} 
                                                className={s.sidebarJobCard}
                                                onClick={() => navigate(`/job/${convertSlug(job.name)}?id=${job.id}`)}
                                            >
                                                <div className={s.jobCardTitle}>{job.name}</div>
                                                <div className={s.jobCardMeta}>
                                                    <span className={s.jobCardSalary}>
                                                        <ThunderboltOutlined /> {(job.salary + "")?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ
                                                    </span>
                                                    <span className={s.jobCardLocation}>
                                                        <EnvironmentOutlined /> {getLocationName(job.location)}
                                                    </span>
                                                </div>
                                                <div className={s.jobCardFooter}>
                                                    <span>{job.updatedAt ? dayjs(job.updatedAt).locale('en').fromNow() : dayjs(job.createdAt).locale('en').fromNow()}</span>
                                                    <span className={s.viewDetailBtn}>Xem chi tiết <RightOutlined style={{ fontSize: '10px' }}/></span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={s.noJobs}>
                                        Hiện công ty chưa có tin tuyển dụng nào.
                                    </div>
                                )}
                            </div>
                        </Col>
                    </Row>
                </div>
            </section>

            {/* ══════════════════ FOOTER ══════════════════ */}
            <footer className={homeStyles.footer}>
                <div className={`${styles['container']} ${homeStyles.footerInner}`}>
                    <div className={homeStyles.footerBrand}>
                        <div className={homeStyles.footerLogo}>
                            <CodeOutlined />
                        </div>
                        <strong>JobHunter</strong>
                        <p>Platform tuyển dụng IT hàng đầu Việt Nam. Built for developers, by developers.</p>
                    </div>

                    <div className={homeStyles.footerLinks}>
                        <div className={homeStyles.footerCol}>
                            <h4>Platform</h4>
                            <a href="/">Trang Chủ</a>
                            <a href="/job">Việc Làm</a>
                            <a href="/company">Công Ty</a>
                            <a href="/skills">Kỹ Năng</a>
                        </div>
                        <div className={homeStyles.footerCol}>
                            <h4>Nhà Tuyển Dụng</h4>
                            <a href="#">Đăng tin tuyển dụng</a>
                            <a href="#">Tìm ứng viên</a>
                            <a href="#">Dashboard công ty</a>
                            <a href="#">Bảng giá</a>
                        </div>
                        <div className={homeStyles.footerCol}>
                            <h4>Liên Hệ</h4>
                            <a href="mailto:support@jobhunter.com">support@jobhunter.com</a>
                            <a href="tel:+84123456789">+84 123 456 789</a>
                            <span>TP. Hồ Chí Minh, Việt Nam</span>
                        </div>
                    </div>
                </div>
                <div className={homeStyles.footerBottom}>
                    <div className={styles['container']}>
                        <span>© 2024 JobHunter. All rights reserved.</span>
                        <div className={homeStyles.footerBottomLinks}>
                            <a href="#">Privacy Policy</a>
                            <a href="#">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
export default ClientCompanyDetailPage;
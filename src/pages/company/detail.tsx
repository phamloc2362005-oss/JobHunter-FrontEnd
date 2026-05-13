import { useLocation, useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import { ICompany } from "@/types/backend";
import { callFetchCompanyById } from "@/config/api";
import styles from 'styles/client.module.scss';
import parse from 'html-react-parser';
import { Col, Row, Skeleton, Card, Divider, Rate, Input, Button, message, Form, Tabs, Progress, Modal, Checkbox } from "antd";
import { EnvironmentOutlined, ThunderboltOutlined, TeamOutlined, GlobalOutlined, RightOutlined, CodeOutlined, UserOutlined, StarFilled, LikeOutlined, DislikeOutlined, FormOutlined } from "@ant-design/icons";
import { IJob, IReview } from "@/types/backend";
import { callFetchPublicJob, callFetchCompanyReviews, callCreateReview } from "@/config/api";
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

    // Reviews state
    const [reviews, setReviews] = useState<IReview[]>([]);
    const [isLoadingReviews, setIsLoadingReviews] = useState<boolean>(false);
    const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [form] = Form.useForm();

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

    const fetchReviews = async () => {
        if (id) {
            setIsLoadingReviews(true);
            const res = await callFetchCompanyReviews(id, 1, 10);
            if (res?.data?.result) {
                setReviews(res.data.result);
            }
            setIsLoadingReviews(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [id]);

    const handlePostReview = async (values: any) => {
        if (!id) return;
        setIsSubmittingReview(true);
        try {
            const res = await callCreateReview(values.rating, values.isRecommend || false, values.content, values.title, values.pros, values.cons, id);
            if (res?.data) {
                message.success('Đánh giá công ty thành công!');
                form.resetFields();
                setIsModalOpen(false); // Close modal
                fetchReviews(); // reload reviews
            } else {
                message.error('Có lỗi xảy ra khi gửi đánh giá');
            }
        } catch (error: any) {
            message.error(error?.response?.data || 'Có lỗi xảy ra khi gửi đánh giá (Vui lòng đăng nhập)');
        }
        setIsSubmittingReview(false);
    };

    // Calculate star breakdown
    const getStarBreakdown = () => {
        const counts = [0, 0, 0, 0, 0, 0]; // 0 to 5
        reviews.forEach(r => {
            if (r.rating >= 1 && r.rating <= 5) counts[r.rating]++;
        });
        const total = reviews.length || 1;
        return counts.map(c => Math.round((c / total) * 100));
    };
    const starBreakdown = getStarBreakdown();

    // Calculate average rating
    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
        : 0;

    // Tính % khuyên bạn bè: quy đổi điểm trung bình sao sang thang 100
    // Ví dụ: avg 4.67 sao → 93%, avg 5 sao → 100%, avg 3 sao → 60%
    // Sử dụng thông số từ backend nếu có
    const recommendPercent = companyDetail?.recommendPercentage ?? 
        (reviews.length > 0
        ? Math.round((reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length / 5) * 100)
        : 0);

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
                        <Button
                            danger
                            icon={<FormOutlined />}
                            style={{ marginLeft: 12, borderRadius: 999, fontWeight: 700 }}
                            onClick={() => setIsModalOpen(true)}
                        >
                            Viết đánh giá
                        </Button>
                    </div>
                </div>
            </section>

            <section className={s.contentWrap}>
                <div className={`${styles["container"]}`}>
                    <Row gutter={[24, 24]}>
                        <Col span={24} md={16}>
                            <Tabs defaultActiveKey="overview" items={[
                                {
                                    key: 'overview',
                                    label: 'Tổng quan',
                                    children: (
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
                                    )
                                },
                                {
                                    key: 'reviews',
                                    label: (
                                        <span>
                                            Đánh giá
                                            <span className={s.reviewBadge}>{reviews.length}</span>
                                        </span>
                                    ),
                                    children: (
                                        <div className={s.reviewSection}>
                                            <div className={s.reviewHeader}>
                                                <div className={s.summaryLeft}>
                                                    <div className={s.averageBox}>
                                                        <span className={s.bigScore}>{averageRating}</span>
                                                        <Rate disabled allowHalf defaultValue={Number(averageRating)} />
                                                        <span className={s.totalReviews}>{reviews.length} đánh giá</span>
                                                    </div>
                                                    <div className={s.starStats}>
                                                        {[5, 4, 3, 2, 1].map(star => (
                                                            <div key={star} className={s.statRow}>
                                                                <span className={s.statLabel}>{star} sao</span>
                                                                <Progress
                                                                    percent={starBreakdown[star]}
                                                                    showInfo={false}
                                                                    strokeColor="#f5a623"
                                                                    trailColor="#e5e7eb"
                                                                />
                                                                <span className={s.statPercent}>{starBreakdown[star]}%</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className={s.summaryRight}>
                                                    <div className={s.recommendBox}>
                                                        <Progress
                                                            type="circle"
                                                            percent={recommendPercent}
                                                            width={80}
                                                            strokeColor="#4caf50"
                                                            format={percent => `${percent}%`}
                                                        />
                                                        <p>Khuyên bạn bè làm việc tại đây</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <Divider style={{ margin: '8px 0' }} />

                                            <div className={s.reviewGrid}>
                                                {/* Review List */}
                                                <div className={s.reviewListSide} style={{ gridColumn: 'span 2' }}>
                                                    {isLoadingReviews ? (
                                                        <Skeleton active />
                                                    ) : reviews.length > 0 ? (
                                                        reviews.map((rv, idx) => (
                                                            <div key={idx} className={s.reviewCard}>
                                                                <div className={s.rvTop}>
                                                                    <div className={s.rvUser}>
                                                                        <UserOutlined />
                                                                        <span className={s.rvName}>{rv?.user?.name || "Người dùng ẩn danh"}</span>
                                                                        <span className={s.rvDate}>{rv.createdAt ? dayjs(rv.createdAt).locale('vi').fromNow() : ''}</span>
                                                                    </div>
                                                                    <Rate disabled defaultValue={rv.rating} style={{ fontSize: 14 }} />
                                                                </div>
                                                                <h4 className={s.rvTitle}>{rv.title || "Môi trường làm việc tốt"}</h4>

                                                                <div className={s.rvContent}>
                                                                    <div className={s.rvSection}>
                                                                        <span className={s.rvLabel}><LikeOutlined /> Điều tôi thích</span>
                                                                        <p>{rv.pros || rv.content}</p>
                                                                    </div>
                                                                    {(rv.cons || rv.content) && (
                                                                        <div className={s.rvSection}>
                                                                            <span className={s.rvLabel}><DislikeOutlined /> Đề xuất cải thiện</span>
                                                                            <p>{rv.cons || "Không có đề xuất."}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p style={{ color: '#64748b', textAlign: 'center', padding: '40px 0' }}>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            ]} />

                            {/* REVIEW MODAL */}
                            <Modal
                                title="Viết đánh giá của bạn"
                                open={isModalOpen}
                                onCancel={() => setIsModalOpen(false)}
                                footer={null}
                                width={600}
                                centered
                            >
                                <Form form={form} layout="vertical" onFinish={handlePostReview}>
                                    <Form.Item
                                        name="rating"
                                        label="Đánh giá tổng quát"
                                        rules={[{ required: true, message: 'Vui lòng chọn số sao!' }]}
                                    >
                                        <Rate />
                                    </Form.Item>
                                    <Form.Item
                                        name="title"
                                        label="Tiêu đề đánh giá"
                                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                                    >
                                        <Input placeholder="Ví dụ: Công ty tuyệt vời, Sếp vui tính..." />
                                    </Form.Item>
                                    <Form.Item
                                        name="pros"
                                        label="Điều bạn thích nhất"
                                        rules={[{ required: true, message: 'Vui lòng nhập điều bạn thích!' }]}
                                    >
                                        <Input.TextArea rows={3} placeholder="Môi trường, đồng nghiệp, lương bổng..." />
                                    </Form.Item>
                                    <Form.Item
                                        name="cons"
                                        label="Điều cần cải thiện"
                                        rules={[{ required: true, message: 'Vui lòng nhập đề xuất!' }]}
                                    >
                                        <Input.TextArea rows={3} placeholder="Quy trình, dự án, văn phòng..." />
                                    </Form.Item>
                                    <Form.Item
                                        name="isRecommend"
                                        valuePropName="checked"
                                        initialValue={true}
                                    >
                                        <Checkbox>Tôi giới thiệu công ty này cho bạn bè</Checkbox>
                                    </Form.Item>
                                    <Form.Item name="content" hidden initialValue="Review content">
                                        <Input />
                                    </Form.Item>
                                    <Button type="primary" danger htmlType="submit" loading={isSubmittingReview} block size="large">
                                        Gửi đánh giá
                                    </Button>
                                </Form>
                            </Modal>
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
                                                    <span className={s.viewDetailBtn}>Xem chi tiết <RightOutlined style={{ fontSize: '10px' }} /></span>
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
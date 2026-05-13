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
                message.success('Company review posted successfully!');
                form.resetFields();
                setIsModalOpen(false); // Close modal
                fetchReviews(); // reload reviews
            } else {
                message.error('An error occurred while submitting the review');
            }
        } catch (error: any) {
            message.error(error?.response?.data || 'An error occurred (Please login to review)');
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
                        <h1 className={s.companyName}>{companyDetail?.name || 'Company'}</h1>
                        {companyDetail?.address && (
                            <div className={s.companyMeta}>
                                <span><EnvironmentOutlined /> {companyDetail?.address}</span>
                                <span><TeamOutlined /> 50-150 employees</span>
                                <span><GlobalOutlined /> {companyDetail?.name?.toLowerCase().replace(/\s/g, '')}.com</span>
                            </div>
                        )}
                        <div className={s.jobCountBadge}>
                            {companyJobs.length} Jobs recruiting
                        </div>
                        <Button
                            danger
                            icon={<FormOutlined />}
                            style={{ marginLeft: 12, borderRadius: 999, fontWeight: 700 }}
                            onClick={() => setIsModalOpen(true)}
                        >
                            Write a review
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
                                    label: 'Overview',
                                    children: (
                                        <div className={s.contentCard}>
                                            {isLoading ? (
                                                <Skeleton active />
                                            ) : (
                                                <>
                                                    <div className={s.contentHeader}>
                                                        <h2>About Company</h2>
                                                    </div>
                                                    <div className={s.description}>
                                                        {parse(companyDetail?.description ?? "No description available.")}
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
                                            Reviews
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
                                                        <span className={s.totalReviews}>{reviews.length} reviews</span>
                                                    </div>
                                                    <div className={s.starStats}>
                                                        {[5, 4, 3, 2, 1].map(star => (
                                                            <div key={star} className={s.statRow}>
                                                                <span className={s.statLabel}>{star} stars</span>
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
                                                        <p>Recommend working here</p>
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
                                                                        <span className={s.rvName}>{rv?.user?.name || "Anonymous User"}</span>
                                                                        <span className={s.rvDate}>{rv.createdAt ? dayjs(rv.createdAt).locale('en').fromNow() : ''}</span>
                                                                    </div>
                                                                    <Rate disabled defaultValue={rv.rating} style={{ fontSize: 14 }} />
                                                                </div>
                                                                <h4 className={s.rvTitle}>{rv.title || "Good working environment"}</h4>

                                                                <div className={s.rvContent}>
                                                                    <div className={s.rvSection}>
                                                                        <span className={s.rvLabel}><LikeOutlined /> What I like</span>
                                                                        <p>{rv.pros || rv.content}</p>
                                                                    </div>
                                                                    {(rv.cons || rv.content) && (
                                                                        <div className={s.rvSection}>
                                                                            <span className={s.rvLabel}><DislikeOutlined /> Suggestions for improvement</span>
                                                                            <p>{rv.cons || "No suggestions."}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p style={{ color: '#64748b', textAlign: 'center', padding: '40px 0' }}>No reviews yet. Be the first one!</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            ]} />

                            {/* REVIEW MODAL */}
                            <Modal
                                title="Write your review"
                                open={isModalOpen}
                                onCancel={() => setIsModalOpen(false)}
                                footer={null}
                                width={600}
                                centered
                            >
                                <Form form={form} layout="vertical" onFinish={handlePostReview}>
                                    <Form.Item
                                        name="rating"
                                        label="General Rating"
                                        rules={[{ required: true, message: 'Please select star rating!' }]}
                                    >
                                        <Rate />
                                    </Form.Item>
                                    <Form.Item
                                        name="title"
                                        label="Review Title"
                                        rules={[{ required: true, message: 'Please enter a title!' }]}
                                    >
                                        <Input placeholder="Example: Great company, fun boss..." />
                                    </Form.Item>
                                    <Form.Item
                                        name="pros"
                                        label="What you like most"
                                        rules={[{ required: true, message: 'Please enter what you like!' }]}
                                    >
                                        <Input.TextArea rows={3} placeholder="Environment, colleagues, benefits..." />
                                    </Form.Item>
                                    <Form.Item
                                        name="cons"
                                        label="Things to improve"
                                        rules={[{ required: true, message: 'Please enter suggestions!' }]}
                                    >
                                        <Input.TextArea rows={3} placeholder="Process, projects, office..." />
                                    </Form.Item>
                                    <Form.Item
                                        name="isRecommend"
                                        valuePropName="checked"
                                        initialValue={true}
                                    >
                                        <Checkbox>I recommend working here</Checkbox>
                                    </Form.Item>
                                    <Form.Item name="content" hidden initialValue="Review content">
                                        <Input />
                                    </Form.Item>
                                    <Button type="primary" danger htmlType="submit" loading={isSubmittingReview} block size="large">
                                        Submit Review
                                    </Button>
                                </Form>
                            </Modal>
                        </Col>

                        <Col span={24} md={8}>
                            <div className={s.jobsSidebar}>
                                <h3 className={s.sidebarTitle}>Current Openings</h3>
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
                                                        <ThunderboltOutlined /> {(job.salary + "")?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} VND
                                                    </span>
                                                    <span className={s.jobCardLocation}>
                                                        <EnvironmentOutlined /> {getLocationName(job.location)}
                                                    </span>
                                                </div>
                                                <div className={s.jobCardFooter}>
                                                    <span>{job.updatedAt ? dayjs(job.updatedAt).locale('en').fromNow() : dayjs(job.createdAt).locale('en').fromNow()}</span>
                                                    <span className={s.viewDetailBtn}>View details <RightOutlined style={{ fontSize: '10px' }} /></span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={s.noJobs}>
                                        No current openings at this company.
                                    </div>
                                )}
                            </div>
                        </Col>
                    </Row>
                </div>
            </section>
        </div>
    )
}
export default ClientCompanyDetailPage;
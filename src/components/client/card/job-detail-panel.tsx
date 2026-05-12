import { IJob } from '@/types/backend';
import { convertSlug } from '@/config/utils';
import { callAddFavoriteJob, callCheckFavoriteJob, callRemoveFavoriteJob } from '@/config/api';
import { EnvironmentOutlined, ThunderboltOutlined, HeartOutlined, HeartFilled, ShareAltOutlined } from '@ant-design/icons';
import { Button, Tag, Empty, Space, Divider, notification } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import styles from './job-detail-panel.module.scss';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface IProps {
    job?: IJob;
}

const JobDetailPanel = (props: IProps) => {
    const { job } = props;
    const [isLiked, setIsLiked] = useState(false);
    const navigate = useNavigate();
    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);

    useEffect(() => {
        let isActive = true;
        const checkFavorite = async () => {
            if (!job?.id || !isAuthenticated) {
                if (isActive) setIsLiked(false);
                return;
            }
            try {
                const res = await callCheckFavoriteJob(job.id);
                if (isActive) setIsLiked(!!res?.data);
            } catch (err) {
                if (isActive) setIsLiked(false);
            }
        };
        checkFavorite();
        return () => {
            isActive = false;
        };
    }, [job?.id, isAuthenticated]);

    if (!job) {
        return (
            <div className={styles.jobDetailPanel}>
                <Empty description="Chọn một job để xem chi tiết" />
            </div>
        );
    }

    const handleApplyJob = () => {
        const slug = convertSlug(job.name);
        navigate(`/job/${slug}?id=${job.id}`);
    };

    const handleToggleFavorite = async () => {
        if (!job?.id) return;
        if (!isAuthenticated) {
            notification.warning({ message: 'Vui lòng đăng nhập để lưu job yêu thích' });
            navigate('/login');
            return;
        }
        const nextState = !isLiked;
        setIsLiked(nextState);
        try {
            if (nextState) {
                await callAddFavoriteJob(job.id);
            } else {
                await callRemoveFavoriteJob(job.id);
            }
        } catch (err) {
            setIsLiked(!nextState);
            notification.error({ message: 'Không thể cập nhật job yêu thích' });
        }
    };

    return (
        <div className={styles.jobDetailPanel}>
            <div className={styles.detailContent}>
                {/* Header - Company Logo + Title */}
                <div className={styles.detailHeader}>
                    <div className={styles.companyInfo}>
                        <img
                            alt={job.company?.name}
                            src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${job?.company?.logo}`}
                            className={styles.companyLogo}
                        />
                        <div className={styles.companyDetails}>
                            <h3 className={styles.companyName}>{job.company?.name}</h3>
                            <p className={styles.jobTitle} onClick={handleApplyJob}>
                                {job.name}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Salary */}
                <div className={styles.salarySection}>
                    <div className={styles.salaryValue}>
                        {job.salary ? `${(job.salary + "")?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ` : "Thương lượng"}
                    </div>
                </div>

                {/* Apply Button + Like Button */}
                <div className={styles.actionButtons}>
                    <Button
                        type="primary"
                        size="large"
                        block
                        className={styles.applyBtn}
                        onClick={handleApplyJob}
                    >
                        Ứng tuyển ngay
                    </Button>
                    <button
                        className={`${styles.likeBtn} ${isLiked ? styles.likeBtnActive : ''}`}
                        onClick={handleToggleFavorite}
                    >
                        {isLiked ? <HeartFilled /> : <HeartOutlined />}
                    </button>
                </div>

                {/* Interview Practice Button */}
                <Button
                    size="large"
                    block
                    className={styles.interviewBtn}
                    onClick={() => navigate(`/interview/${job.id}`)}
                    style={{ marginBottom: 16 }}
                >
                    Luyện phỏng vấn với AI
                </Button>

                <Divider className={styles.divider} />

                {/* Location & Work Type & Posted Time */}
                <div className={styles.detailSection}>
                    <div className={styles.metaRow}>
                        <div className={styles.metaItem}>
                            <EnvironmentOutlined className={styles.metaIcon} />
                            <span className={styles.metaLabel}>Địa điểm</span>
                        </div>
                        <span className={styles.metaValue}>{job.location}</span>
                    </div>
                    <div className={styles.metaRow}>
                        <div className={styles.metaItem}>
                            <ThunderboltOutlined className={styles.metaIcon} />
                            <span className={styles.metaLabel}>Cấp bậc</span>
                        </div>
                        <span className={styles.metaValue}>{job.level}</span>
                    </div>
                    <div className={styles.postDate}>
                        Đăng {job.updatedAt ? dayjs(job.updatedAt).locale('en').fromNow() : dayjs(job.createdAt).locale('en').fromNow()}
                    </div>
                </div>

                <Divider className={styles.divider} />

                {/* Skills */}
                {job.skills && job.skills.length > 0 && (
                    <div className={styles.detailSection}>
                        <div className={styles.sectionLabel}>Skills:</div>
                        <div className={styles.skillsList}>
                            {job.skills.map((skill) => (
                                <Tag
                                    key={skill.id}
                                    className={styles.skillItem}
                                >
                                    {skill.name}
                                </Tag>
                            ))}
                        </div>
                    </div>
                )}

                {/* Job Expertise */}
                {job.level && (
                    <>
                        <Divider className={styles.divider} />
                        <div className={styles.detailSection}>
                            <div className={styles.sectionLabel}>Job Expertise:</div>
                            <div className={styles.metaValue}>{job.level}</div>
                        </div>
                    </>
                )}

                <Divider className={styles.divider} />

                {/* Description */}
                <div className={styles.detailSection}>
                    <div className={styles.sectionTitle}>Mô tả công việc</div>
                    <div
                        className={styles.description}
                        dangerouslySetInnerHTML={{ __html: job.description || '' }}
                    />
                </div>

                {/* Requirements */}
                {job.description && (
                    <>
                        <Divider className={styles.divider} />
                        <div className={styles.detailSection}>
                            <div className={styles.sectionTitle}>Yêu cầu</div>
                            <div
                                className={styles.description}
                                dangerouslySetInnerHTML={{ __html: job.description || '' }}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default JobDetailPanel;

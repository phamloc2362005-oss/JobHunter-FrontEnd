import { IJob } from '@/types/backend';
import { EnvironmentOutlined, ThunderboltOutlined, HeartOutlined, HeartFilled, ShareAltOutlined } from '@ant-design/icons';
import { Button, Tag, Empty, Space, Divider } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

    if (!job) {
        return (
            <div className={styles.jobDetailPanel}>
                <Empty description="Chọn một job để xem chi tiết" />
            </div>
        );
    }

    const handleApplyJob = () => {
        navigate(`/job/${job.id}`);
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
                            <p className={styles.jobTitle}>{job.name}</p>
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
                        className={styles.likeBtn}
                        onClick={() => setIsLiked(!isLiked)}
                    >
                        {isLiked ? <HeartFilled /> : <HeartOutlined />}
                    </button>
                </div>

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

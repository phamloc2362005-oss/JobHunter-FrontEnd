import { useState, useEffect } from 'react';
import { Collapse, Spin, Empty, Card, Row, Col, Button } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { callFetchPublicJob } from '@/config/api';
import { IJob } from '@/types/backend';
import { convertSlug } from '@/config/utils';
import styles from 'styles/client.module.scss';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface IExpertiseCategory {
    key: string;
    label: string;
    jobs: IJob[];
    loading: boolean;
}

const ExpertiseSummary = () => {
    const [categories, setCategories] = useState<IExpertiseCategory[]>([
        // Left Column
        { key: 'it-exec', label: 'IT Executive and Management', jobs: [], loading: false },
        { key: 'mobile-dev', label: 'Mobile Application Development', jobs: [], loading: false },
        { key: 'lowcode-nocode', label: 'Low-Code / No-Code Development', jobs: [], loading: false },
        { key: 'blockchain', label: 'Blockchain Development', jobs: [], loading: false },
        { key: 'qa-testing', label: 'Software Testing & Quality Assurance', jobs: [], loading: false },
        { key: 'data-eng', label: 'Data Engineering', jobs: [], loading: false },
        { key: 'data-mgmt', label: 'Data Management & Governance', jobs: [], loading: false },
        { key: 'network-admin', label: 'Systems & Network Engineering / Administration', jobs: [], loading: false },
        { key: 'it-support', label: 'IT Support & Helpdesk', jobs: [], loading: false },
        { key: 'it-compliance', label: 'IT Compliance & Risk Management', jobs: [], loading: false },
        { key: 'iot-robotics', label: 'IoT & Robotics', jobs: [], loading: false },
        { key: 'project-mgmt', label: 'Project Management / Technical Communication', jobs: [], loading: false },
        { key: 'it-consulting', label: 'IT Consulting & Sales', jobs: [], loading: false },
        // Right Column
        { key: 'web-dev', label: 'Web Application Development', jobs: [], loading: false },
        { key: 'enterprise-dev', label: 'Core / Enterprise Systems Development', jobs: [], loading: false },
        { key: 'tech-arch', label: 'Technical Architecture', jobs: [], loading: false },
        { key: 'game-dev', label: 'Game Development', jobs: [], loading: false },
        { key: 'data-analytics', label: 'Data Analytics & Business Intelligence', jobs: [], loading: false },
        { key: 'ai-ml', label: 'Data Science & AI / Machine Learning', jobs: [], loading: false },
        { key: 'cloud-computing', label: 'Cloud Computing', jobs: [], loading: false },
        { key: 'devops', label: 'DevOps & Site Reliability (SRE)', jobs: [], loading: false },
        { key: 'cybersecurity', label: 'Cybersecurity', jobs: [], loading: false },
        { key: 'embedded-systems', label: 'Embedded Systems', jobs: [], loading: false },
        { key: 'product-mgmt', label: 'Product Management', jobs: [], loading: false },
        { key: 'design-ux', label: 'Design & User Experience', jobs: [], loading: false },
    ]);

    const [activeKeys, setActiveKeys] = useState<string[]>([]);
    const navigate = useNavigate();

    const fetchJobsByCategory = async (categoryKey: string) => {
        setCategories(prev => prev.map(cat => 
            cat.key === categoryKey ? { ...cat, loading: true } : cat
        ));

        try {
            // Lấy các job từ API, bạn có thể tùy chỉnh query dựa trên category
            const query = `page=1&size=6`;
            const res = await callFetchPublicJob(query);
            
            if (res?.data && Array.isArray(res.data)) {
                setCategories(prev => prev.map(cat => 
                    cat.key === categoryKey 
                        ? { ...cat, jobs: res.data, loading: false } 
                        : cat
                ));
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
            setCategories(prev => prev.map(cat => 
                cat.key === categoryKey ? { ...cat, loading: false } : cat
            ));
        }
    };

    const handleExpand = (expandedKeys: string | string[]) => {
        const keys = Array.isArray(expandedKeys) ? expandedKeys : [expandedKeys];
        setActiveKeys(keys);

        // Fetch jobs khi mở expand
        const newExpandedKeys = keys as string[];
        newExpandedKeys.forEach(key => {
            const category = categories.find(c => c.key === key);
            if (category && category.jobs.length === 0 && !category.loading) {
                fetchJobsByCategory(key);
            }
        });
    };

    const handleNavigateToJobDetail = (jobId: string) => {
        navigate(`/job/${convertSlug(jobId)}?id=${jobId}`);
    };

    const items = categories.map(category => ({
        key: category.key,
        label: category.label,
        children: (
            <Spin spinning={category.loading}>
                {category.jobs.length === 0 && !category.loading ? (
                    <Empty description="No jobs available" />
                ) : (
                    <Row gutter={[12, 12]}>
                        {category.jobs.map((job: IJob) => (
                            <Col xs={24} sm={12} key={job.id}>
                                <Card 
                                    hoverable
                                    onClick={() => job.id && handleNavigateToJobDetail(job.id)}
                                    className={styles["job-card-item"]}
                                >
                                    <h4>{job.name}</h4>
                                    <p>{job.company?.name}</p>
                                    <p className={styles["job-salary"]}>
                                        {job.salary ? `$${job.salary}` : 'Negotiate'}
                                    </p>
                                    <p className={styles["job-time"]}>
                                        {dayjs(job.createdAt).fromNow()}
                                    </p>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Spin>
        ),
        extra: activeKeys.includes(category.key) ? <MinusOutlined /> : <PlusOutlined />,
    }));

    const midPoint = Math.ceil(items.length / 2);
    const leftItems = items.slice(0, midPoint);
    const rightItems = items.slice(midPoint);

    return (
        <div className={styles["expertise-summary"]}>
            <h2 className={styles["section-title"]}>IT Expertise Summary</h2>
            <Row gutter={[24, 0]}>
                <Col xs={24} lg={12}>
                    <Collapse 
                        items={leftItems} 
                        onChange={handleExpand}
                        accordion={false}
                    />
                </Col>
                <Col xs={24} lg={12}>
                    <Collapse 
                        items={rightItems} 
                        onChange={handleExpand}
                        accordion={false}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default ExpertiseSummary;

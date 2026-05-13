import { callFetchCompany } from '@/config/api';
import { convertSlug } from '@/config/utils';
import { ICompany } from '@/types/backend';
import { Col, Empty, Pagination, Row, Spin } from 'antd';
import { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { Link, useNavigate } from 'react-router-dom';
import styles from 'styles/client.module.scss';
import cardStyles from './company.card.module.scss';
import {
    EnvironmentOutlined,
    ThunderboltOutlined,
    StarFilled,
    CrownOutlined,
} from '@ant-design/icons';

interface IProps {
    showPagination?: boolean;
    variant?: 'home' | 'catalog';
}

// Cover gradients cycling through ITViec-like brand colors
const COVER_GRADIENTS = [
    'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)',
    'linear-gradient(135deg, #0b3d0b 0%, #1a5c1a 60%, #236e23 100%)',
    'linear-gradient(135deg, #1a0533 0%, #2d1b69 60%, #4a2f8e 100%)',
    'linear-gradient(135deg, #1a1200 0%, #3d2b00 60%, #614500 100%)',
    'linear-gradient(135deg, #0a1628 0%, #1a3a5c 60%, #1e5f8c 100%)',
    'linear-gradient(135deg, #1a0a0a 0%, #5c1a1a 60%, #8c2e2e 100%)',
];

const CompanyCard = (props: IProps) => {
    const { showPagination = false, variant = 'home' } = props;
    const isCatalog = variant === 'catalog';

    const [displayCompany, setDisplayCompany] = useState<ICompany[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(isCatalog ? 9 : 4);
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState('');
    const [sortQuery] = useState('sort=updatedAt,desc');
    const navigate = useNavigate();

    useEffect(() => {
        fetchCompany();
    }, [current, pageSize, filter, sortQuery]);

    const fetchCompany = async () => {
        setIsLoading(true);
        let query = `page=${current}&size=${pageSize}`;
        if (filter) query += `&${filter}`;
        if (sortQuery) query += `&${sortQuery}`;

        const res = await callFetchCompany(query);
        if (res && res.data) {
            setDisplayCompany(res.data.result);
            setTotal(res.data.meta.total);
        }
        setIsLoading(false);
    };

    const handleOnchangePage = (pagination: { current: number; pageSize: number }) => {
        if (pagination && pagination.current !== current) setCurrent(pagination.current);
        if (pagination && pagination.pageSize !== pageSize) {
            setPageSize(pagination.pageSize);
            setCurrent(1);
        }
    };

    const handleViewDetailJob = (item: ICompany) => {
        if (item.name) {
            const slug = convertSlug(item.name);
            navigate(`/company/${slug}?id=${item.id}`);
        }
    };

    return (
        <div className={`${styles['company-section']} ${isCatalog ? cardStyles.catalogSection : ''}`}>
            <div className={isCatalog ? cardStyles.catalogContent : styles['company-content']}>
                <Spin spinning={isLoading} tip="Loading...">
                    {/* Header - chỉ hiện ở home variant */}
                    {showPagination && !isCatalog && (
                        <div className={styles['section-head']}>
                            <div>
                                <span className={styles['section-badge']}>Top employers</span>
                                <div className={isMobile ? styles['dflex-mobile'] : styles['dflex-pc']}>
                                    <span className={styles['title']}>Top Employers</span>
                                    <p className={styles['section-subtitle']}>
                                        The most prominent and trending IT companies on the platform.
                                    </p>
                                </div>
                            </div>
                            <Link to="company" className={styles['section-link']}>View all</Link>
                        </div>
                    )}

                    {/* Catalog header */}
                    {isCatalog && (
                        <div className={cardStyles.catalogToolbar}>
                            <div className={cardStyles.catalogToolbarLeft}>
                                <span className={cardStyles.totalCount}>
                                    {total} IT companies displaying
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Grid cards / Rows */}
                    <Row gutter={[20, 24]}>
                        {displayCompany?.map((item, index) => {
                            const coverGradient = COVER_GRADIENTS[index % COVER_GRADIENTS.length];
                            const rank = (current - 1) * pageSize + index + 1;

                            if (isCatalog) {
                                return (
                                    <Col span={24} key={item.id}>
                                        <div
                                            className={cardStyles.companyRow}
                                            onClick={() => handleViewDetailJob(item)}
                                        >
                                            <div className={cardStyles.logoSection}>
                                                <img
                                                    alt={item.name}
                                                    src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${item?.logo}`}
                                                />
                                            </div>

                                            <div className={cardStyles.mainInfo}>
                                                <div className={cardStyles.headerRow}>
                                                    <div>
                                                        <h3 className={cardStyles.companyName}>{item.name}</h3>
                                                        <div className={cardStyles.locationBadge}>
                                                            <EnvironmentOutlined />
                                                            {item.address || 'Vietnam'}
                                                        </div>
                                                    </div>
                                                    {rank <= 10 && (
                                                        <div className={cardStyles.rankBadge}>
                                                            <CrownOutlined />
                                                            <span>Top {rank}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {item.latestReview && (
                                                    <div className={cardStyles.highlightReview}>
                                                        <span className={cardStyles.reviewTitle}>
                                                            {item.latestReview.title || 'Featured Review'}
                                                        </span>
                                                        <p className={cardStyles.reviewSnippet}>
                                                            {item.latestReview.content}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className={cardStyles.statsSection}>
                                                <div className={cardStyles.statsRow}>
                                                    <div className={cardStyles.statItem}>
                                                        <span className={cardStyles.statLabel}>Reviews</span>
                                                        <div className={cardStyles.statValue}>
                                                            <span>{item.averageRating?.toFixed(1) || '0.0'}</span>
                                                            <div className={cardStyles.ratingStars}>
                                                                <StarFilled />
                                                            </div>
                                                            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 400 }}>
                                                                ({item.totalReviews || 0} reviews)
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className={cardStyles.statItem}>
                                                        <span className={cardStyles.statLabel}>Recommend working here</span>
                                                        <div className={cardStyles.statValue}>
                                                            <ThunderboltOutlined style={{ color: '#059669' }} />
                                                            <span className={cardStyles.recommendPercent}>
                                                                {item.recommendPercentage?.toFixed(0) || '0'}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                );
                            }

                            // Home variant grid cards
                            return (
                                <Col
                                    span={24}
                                    md={6}
                                    key={item.id}
                                >
                                    <div
                                        className={cardStyles.companyCard}
                                        onClick={() => handleViewDetailJob(item)}
                                    >
                                        <div
                                            className={cardStyles.coverArea}
                                            style={{ background: coverGradient }}
                                        >
                                            <div className={cardStyles.coverDots} />
                                        </div>

                                        <div className={cardStyles.logoOverlay}>
                                            <img
                                                alt={item.name}
                                                src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${item?.logo}`}
                                            />
                                        </div>

                                        <div className={cardStyles.cardBody}>
                                            <h3 className={cardStyles.companyName}>{item.name}</h3>
                                            <p className={cardStyles.companyDesc}>
                                                {item.address || 'Address not updated'}
                                            </p>
                                            <div className={cardStyles.cardFooter}>
                                                <span className={cardStyles.footerLocation}>
                                                    <EnvironmentOutlined />
                                                    {item.address
                                                        ? item.address.split(',').pop()?.trim() || item.address
                                                        : 'Vietnam'}
                                                </span>
                                                <span className={cardStyles.footerJobs}>
                                                    <ThunderboltOutlined />
                                                    View Jobs
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            );
                        })}

                        {(!displayCompany || displayCompany.length === 0) && !isLoading && (
                            <Col span={24}>
                                <div className={styles['empty']}>
                                    <Empty description="No data found" />
                                </div>
                            </Col>
                        )}
                    </Row>

                    {/* Pagination */}
                    {showPagination && (
                        <>
                            <div style={{ marginTop: 36 }} />
                            <Row style={{ display: 'flex', justifyContent: 'center' }}>
                                <Pagination
                                    current={current}
                                    total={total}
                                    pageSize={pageSize}
                                    responsive
                                    showSizeChanger={false}
                                    onChange={(p: number, s: number) =>
                                        handleOnchangePage({ current: p, pageSize: s })
                                    }
                                />
                            </Row>
                        </>
                    )}
                </Spin>
            </div>
        </div>
    );
};

export default CompanyCard;
import { callFetchCompany } from '@/config/api';
import { convertSlug } from '@/config/utils';
import { ICompany } from '@/types/backend';
import { Card, Col, Empty, Pagination, Row, Spin } from 'antd';
import { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { Link, useNavigate } from 'react-router-dom';
import styles from 'styles/client.module.scss';
import cardStyles from './company.card.module.scss';

interface IProps {
    showPagination?: boolean;
    variant?: 'home' | 'catalog';
}

const CompanyCard = (props: IProps) => {
    const { showPagination = false, variant = 'home' } = props;
    const isCatalog = variant === 'catalog';

    const [displayCompany, setDisplayCompany] = useState<ICompany[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(4);
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState("");
    const [sortQuery, setSortQuery] = useState("sort=updatedAt,desc");
    const navigate = useNavigate();

    useEffect(() => {
        fetchCompany();
    }, [current, pageSize, filter, sortQuery]);

    const fetchCompany = async () => {
        setIsLoading(true)
        let query = `page=${current}&size=${pageSize}`;
        if (filter) {
            query += `&${filter}`;
        }
        if (sortQuery) {
            query += `&${sortQuery}`;
        }

        const res = await callFetchCompany(query);
        if (res && res.data) {
            setDisplayCompany(res.data.result);
            setTotal(res.data.meta.total)
        }
        setIsLoading(false)
    }


    const handleOnchangePage = (pagination: { current: number, pageSize: number }) => {
        if (pagination && pagination.current !== current) {
            setCurrent(pagination.current)
        }
        if (pagination && pagination.pageSize !== pageSize) {
            setPageSize(pagination.pageSize)
            setCurrent(1);
        }
    }

    const handleViewDetailJob = (item: ICompany) => {
        if (item.name) {
            const slug = convertSlug(item.name);
            navigate(`/company/${slug}?id=${item.id}`)
        }
    }

    return (
        <div className={`${styles["company-section"]} ${isCatalog ? cardStyles.catalogSection : ''}`}>
            <div className={isCatalog ? cardStyles.catalogContent : styles["company-content"]}>
                <Spin spinning={isLoading} tip="Loading...">
                    <Row gutter={[20, 20]}>
                        {showPagination && <Col span={24}>
                            <div className={isCatalog ? cardStyles.catalogHeader : styles["section-head"]}>
                                <div>
                                    <span className={isCatalog ? cardStyles.catalogBadge : styles["section-badge"]}>Top employers</span>
                                    <div className={isMobile ? styles["dflex-mobile"] : styles["dflex-pc"]}>
                                        <span className={isCatalog ? cardStyles.catalogTitle : styles["title"]}>Nhà Tuyển Dụng Hàng Đầu</span>
                                        <p className={isCatalog ? cardStyles.catalogSubtitle : styles["section-subtitle"]}>Các công ty IT đang nổi bật và được quan tâm nhất trên hệ thống.</p>
                                    </div>
                                </div>
                                <Link to="company" className={isCatalog ? cardStyles.catalogAction : styles["section-link"]}>Xem tất cả</Link>
                            </div>
                        </Col>}

                        {displayCompany?.map(item => {
                            return (
                                <Col span={24} md={6} key={item.id}>
                                    <Card
                                        onClick={() => handleViewDetailJob(item)}
                                        className={`${styles["company-card-v2"]} ${isCatalog ? cardStyles.catalogCard : ''}`}
                                        hoverable
                                        cover={
                                            <div className={isCatalog ? cardStyles.logoWrap : styles["card-customize-v2"]}>
                                                <img
                                                    style={{ maxWidth: "110px", maxHeight: "74px", objectFit: "contain" }}
                                                    alt="example"
                                                    src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${item?.logo}`}
                                                />
                                            </div>
                                        }
                                    >
                                        {isCatalog ? (
                                            <div className={cardStyles.cardBody}>
                                                <h3 className={cardStyles.companyName}>{item.name}</h3>
                                                <div className={cardStyles.companyMeta}>
                                                    {item.address || 'Chưa cập nhật địa chỉ'}
                                                </div>
                                                <div className={cardStyles.cardFooter}>
                                                    <span>Khám phá profile</span>
                                                    <span className={cardStyles.cardTag}>Chi tiết</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <h3 className={styles["company-card-title"]}>{item.name}</h3>
                                        )}
                                    </Card>
                                </Col>
                            )
                        })}

                        {(!displayCompany || displayCompany && displayCompany.length === 0)
                            && !isLoading &&
                            <div className={styles["empty"]}>
                                <Empty description="Không có dữ liệu" />
                            </div>
                        }
                    </Row>
                    {showPagination && <>
                        <div style={{ marginTop: 30 }}></div>
                        <Row style={{ display: "flex", justifyContent: "center" }}>
                            <Pagination
                                current={current}
                                total={total}
                                pageSize={pageSize}
                                responsive
                                onChange={(p: number, s: number) => handleOnchangePage({ current: p, pageSize: s })}
                            />
                        </Row>
                    </>}
                </Spin>
            </div>
        </div>
    )
}

export default CompanyCard;
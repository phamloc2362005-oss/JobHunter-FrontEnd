import { callFetchArticles } from "@/config/api";
import { IArticle } from "@/types/backend";
import { CalendarOutlined, EyeOutlined, ReadOutlined, TagOutlined } from "@ant-design/icons";
import { Col, Empty, Row, Select, Spin, Tag } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./index.module.scss";

const CATEGORY_OPTIONS = [
    { label: "All Categories", value: "" },
    { label: "Career Tips", value: "Career Tips" },
    { label: "Tech News", value: "Tech News" },
    { label: "Salary Report", value: "Salary Report" },
    { label: "IT Market", value: "IT Market" },
    { label: "Interview Tips", value: "Interview Tips" },
    { label: "Company Culture", value: "Company Culture" },
    { label: "Other", value: "Other" },
];

const ArticlesPage = () => {
    const [articles, setArticles] = useState<IArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 9;

    const fetchArticles = async (cat: string, pg: number) => {
        setLoading(true);
        try {
            let query = `page=${pg}&size=${pageSize}&sort=createdAt,desc&filter=isPublished:true`;
            if (cat) query += ` and category:'${cat}'`;
            const res = await callFetchArticles(query);
            setArticles(res?.data?.result ?? []);
            setTotal(res?.data?.meta?.total ?? 0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles(category, page);
    }, [category, page]);

    const handleCategoryChange = (val: string) => {
        setCategory(val);
        setPage(1);
    };

    return (
        <div className={styles["articles-page"]}>
            {/* Hero */}
            <div className={styles["articles-hero"]}>
                <div className={styles["articles-hero-inner"]}>
                    <div className={styles["articles-hero-icon"]}>
                        <ReadOutlined />
                    </div>
                    <h1 className={styles["articles-hero-title"]}>IT Career Insights</h1>
                    <p className={styles["articles-hero-sub"]}>
                        Stay ahead with the latest tech news, career tips, and salary reports
                    </p>
                </div>
            </div>

            <div className={styles["articles-container"]}>
                {/* Filter Bar */}
                <div className={styles["articles-filter"]}>
                    <span className={styles["articles-total"]}>
                        <strong>{total}</strong> articles found
                    </span>
                    <Select
                        value={category}
                        onChange={handleCategoryChange}
                        options={CATEGORY_OPTIONS}
                        style={{ width: 200 }}
                        placeholder="Filter by category"
                    />
                </div>

                {loading ? (
                    <div className={styles["articles-loading"]}>
                        <Spin size="large" />
                    </div>
                ) : articles.length === 0 ? (
                    <Empty description="No articles found" style={{ padding: "60px 0" }} />
                ) : (
                    <Row gutter={[24, 32]}>
                        {articles.map((article) => (
                            <Col key={article.id} xs={24} sm={12} lg={8}>
                                <Link
                                    to={`/articles/${article.id}`}
                                    className={styles["article-card"]}
                                >
                                    <div className={styles["article-card-img-wrap"]}>
                                        {article.thumbnail ? (
                                            <img
                                                src={article.thumbnail}
                                                alt={article.title}
                                                className={styles["article-card-img"]}
                                            />
                                        ) : (
                                            <div className={styles["article-card-img-placeholder"]}>
                                                <ReadOutlined />
                                            </div>
                                        )}
                                        {article.category && (
                                            <span className={styles["article-card-category"]}>
                                                {article.category}
                                            </span>
                                        )}
                                    </div>
                                    <div className={styles["article-card-body"]}>
                                        <h3 className={styles["article-card-title"]}>
                                            {article.title}
                                        </h3>
                                        <p className={styles["article-card-desc"]}>
                                            {article.description}
                                        </p>
                                        <div className={styles["article-card-meta"]}>
                                            <span>
                                                <CalendarOutlined style={{ marginRight: 4 }} />
                                                {article.createdAt
                                                    ? dayjs(article.createdAt).format("DD MMM YYYY")
                                                    : ""}
                                            </span>
                                            <span>
                                                <EyeOutlined style={{ marginRight: 4 }} />
                                                {article.viewCount ?? 0} views
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </Col>
                        ))}
                    </Row>
                )}

                {/* Pagination */}
                {total > pageSize && !loading && (
                    <div className={styles["articles-pagination"]}>
                        {Array.from({ length: Math.ceil(total / pageSize) }, (_, i) => i + 1).map(
                            (p) => (
                                <button
                                    key={p}
                                    className={`${styles["page-btn"]} ${p === page ? styles["page-btn-active"] : ""}`}
                                    onClick={() => setPage(p)}
                                >
                                    {p}
                                </button>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArticlesPage;

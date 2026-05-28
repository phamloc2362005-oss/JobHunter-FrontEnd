import { callFetchArticleById, callFetchFeaturedArticles } from "@/config/api";
import { IArticle } from "@/types/backend";
import {
    ArrowLeftOutlined,
    CalendarOutlined,
    EyeOutlined,
    ReadOutlined,
    TagOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Divider, Empty, Skeleton, Tag } from "antd";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import styles from "./detail.module.scss";

const ArticleDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState<IArticle | null>(null);
    const [related, setRelated] = useState<IArticle[]>([]);
    const [loading, setLoading] = useState(true);
    // Ngăn React StrictMode gọi API 2 lần (mount → unmount → mount)
    const calledRef = useRef(false);

    useEffect(() => {
        if (!id) return;
        if (calledRef.current) return; // đã gọi rồi, bỏ qua lần thứ 2
        calledRef.current = true;

        (async () => {
            setLoading(true);
            try {
                const res = await callFetchArticleById(id);
                if (res?.data) {
                    setArticle(res.data);
                }
                // Load related (featured) articles
                const relatedRes = await callFetchFeaturedArticles();
                setRelated(
                    (relatedRes?.data ?? [])
                        .filter((a: IArticle) => String(a.id) !== id)
                        .slice(0, 3)
                );
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) {
        return (
            <div className={styles["detail-page"]}>
                <div className={styles["detail-container"]}>
                    <Skeleton active paragraph={{ rows: 12 }} />
                </div>
            </div>
        );
    }

    if (!article) {
        return (
            <div className={styles["detail-page"]}>
                <Empty
                    description="Article not found"
                    style={{ padding: "80px 0" }}
                />
            </div>
        );
    }

    return (
        <div className={styles["detail-page"]}>
            {/* Hero Banner */}
            <div
                className={styles["detail-hero"]}
                style={
                    article.thumbnail
                        ? { backgroundImage: `url(${article.thumbnail})` }
                        : undefined
                }
            >
                <div className={styles["detail-hero-overlay"]} />
                <div className={styles["detail-hero-content"]}>
                    {article.category && (
                        <span className={styles["detail-category"]}>
                            {article.category}
                        </span>
                    )}
                    <h1 className={styles["detail-title"]}>{article.title}</h1>
                    <div className={styles["detail-meta"]}>
                        {article.author && (
                            <span>
                                <UserOutlined style={{ marginRight: 4 }} />
                                {article.author}
                            </span>
                        )}
                        {article.createdAt && (
                            <span>
                                <CalendarOutlined style={{ marginRight: 4 }} />
                                {dayjs(article.createdAt).format("DD MMMM YYYY")}
                            </span>
                        )}
                        <span>
                            <EyeOutlined style={{ marginRight: 4 }} />
                            {article.viewCount ?? 0} views
                        </span>
                    </div>
                </div>
            </div>

            <div className={styles["detail-container"]}>
                <div className={styles["detail-layout"]}>
                    {/* Main Content */}
                    <article className={styles["detail-main"]}>
                        <button
                            className={styles["detail-back"]}
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeftOutlined style={{ marginRight: 8 }} />
                            Back to Articles
                        </button>

                        {article.description && (
                            <p className={styles["detail-desc"]}>{article.description}</p>
                        )}

                        <Divider />

                        {article.content ? (
                            <div
                                className={styles["detail-content"]}
                                style={{ whiteSpace: "pre-wrap" }}
                            >
                                {article.content}
                            </div>
                        ) : (
                            <p className={styles["detail-no-content"]}>
                                Full content is not available for this article.
                            </p>
                        )}
                    </article>

                    {/* Sidebar */}
                    <aside className={styles["detail-sidebar"]}>
                        {related.length > 0 && (
                            <div className={styles["sidebar-related"]}>
                                <h3 className={styles["sidebar-title"]}>
                                    <ReadOutlined style={{ marginRight: 8 }} />
                                    Related Articles
                                </h3>
                                <div className={styles["sidebar-list"]}>
                                    {related.map((rel) => (
                                        <Link
                                            key={rel.id}
                                            to={`/articles/${rel.id}`}
                                            className={styles["sidebar-item"]}
                                        >
                                            {rel.thumbnail ? (
                                                <img
                                                    src={rel.thumbnail}
                                                    alt={rel.title}
                                                    className={styles["sidebar-item-img"]}
                                                />
                                            ) : (
                                                <div
                                                    className={styles["sidebar-item-img-placeholder"]}
                                                >
                                                    <ReadOutlined />
                                                </div>
                                            )}
                                            <div className={styles["sidebar-item-body"]}>
                                                <p className={styles["sidebar-item-title"]}>
                                                    {rel.title}
                                                </p>
                                                {rel.category && (
                                                    <Tag
                                                        color="red"
                                                        style={{ fontSize: 10, marginTop: 4 }}
                                                    >
                                                        {rel.category}
                                                    </Tag>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className={styles["sidebar-cta"]}>
                            <h4>Looking for IT Jobs?</h4>
                            <p>Browse thousands of tech opportunities tailored for you.</p>
                            <Link to="/job" className={styles["sidebar-cta-btn"]}>
                                Explore Jobs
                            </Link>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default ArticleDetailPage;

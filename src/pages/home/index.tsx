import {
    ArrowRightOutlined,
    BulbOutlined,
    CalendarOutlined,
    CodeOutlined,
    EnvironmentOutlined,
    EyeOutlined,
    FireOutlined,
    ReadOutlined,
    RiseOutlined,
    RocketOutlined,
    SafetyCertificateOutlined,
    TeamOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';
import SearchClient from '@/components/client/search.client';
import JobCard from '@/components/client/card/job.card';
import CompanyCard from '@/components/client/card/company.card';
import ExpertiseSummary from '@/components/client/expertise-summary';
import { Divider, Spin } from 'antd';
import { callFetchFeaturedArticles, callFetchPublicJob } from '@/config/api';
import { IArticle } from '@/types/backend';
import { Link } from 'react-router-dom';
import styles from 'styles/client.module.scss';
import s from './index.module.scss';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';

/* ─── animated counter ─── */
const useCountUp = (target: number, duration = 2000, start = false) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!start) return;
        let startTime: number | null = null;
        const step = (ts: number) => {
            if (!startTime) startTime = ts;
            const progress = Math.min((ts - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(ease * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [start, target, duration]);
    return count;
};

const StatItem = ({ value, suffix, label, icon, start }: { value: number; suffix: string; label: string; icon: React.ReactNode; start: boolean }) => {
    const count = useCountUp(value, 1800, start);
    return (
        <div className={s.statItem}>
            <span className={s.statIcon}>{icon}</span>
            <strong className={s.statNumber}>{count.toLocaleString()}{suffix}</strong>
            <span className={s.statLabel}>{label}</span>
        </div>
    );
};

const TECH_TAGS = ['React', 'Node.js', 'Java', 'Python', 'Go', 'AWS', 'Docker', 'Kubernetes', 'TypeScript', 'GraphQL', 'Vue', 'Spring Boot', 'MongoDB', 'Redis', '.NET', 'Flutter'];

const HomePage = () => {
    const statsRef = useRef<HTMLDivElement>(null);
    const [statsVisible, setStatsVisible] = useState(false);
    const [featuredArticles, setFeaturedArticles] = useState<IArticle[]>([]);
    const [articlesLoading, setArticlesLoading] = useState(true);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
            { threshold: 0.3 }
        );
        if (statsRef.current) observer.observe(statsRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const res = await callFetchFeaturedArticles();
                setFeaturedArticles(res?.data ?? []);
            } finally {
                setArticlesLoading(false);
            }
        })();
    }, []);

    return (
        <div className={s.pageShell}>

            {/* ══════════════════ HERO ══════════════════ */}
            <section className={s.heroSection}>
                {/* animated grid background */}
                <div className={s.gridBg} aria-hidden="true" />
                {/* floating blobs */}
                <div className={s.blob1} aria-hidden="true" />
                <div className={s.blob2} aria-hidden="true" />
                <div className={s.blob3} aria-hidden="true" />

                <div className={`${styles['container']} ${s.heroInner}`}>
                    {/* badge */}
                    <div className={s.heroBadge}>
                        <span className={s.badgeDot} />
                        <FireOutlined /> #1 Platform for IT professionals in Vietnam
                    </div>

                    <h1 className={s.heroTitle}>
                        Find IT jobs <span className={s.gradientText}>with your stack</span>,<br />
                        right team, right salary.
                    </h1>

                    <p className={s.heroSub}>
                        Connect with hundreds of top tech companies. Filter by skills,
                        level, location, and salary range — in just one click.
                    </p>

                    {/* search box */}
                    <div className={s.searchBox}>
                        <div className={s.searchGlow} aria-hidden="true" />
                        <SearchClient />
                    </div>

                    {/* tech tags strip */}
                    <div className={s.tagStrip}>
                        <span className={s.tagStripLabel}>Trending:</span>
                        {TECH_TAGS.map(tag => (
                            <Link key={tag} to={`/job?skills=${tag}`} className={s.techTag}>{tag}</Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════ STATS BAR ══════════════════ */}
            <section className={s.statsBar} ref={statsRef}>
                <div className={styles['container']}>
                    <div className={s.statsGrid}>
                        <StatItem value={5000} suffix="+" label="Active IT Jobs" icon={<BulbOutlined />} start={statsVisible} />
                        <div className={s.statDivider} />
                        <StatItem value={1200} suffix="+" label="Partner Companies" icon={<TeamOutlined />} start={statsVisible} />
                        <div className={s.statDivider} />
                        <StatItem value={98} suffix="%" label="Happy Candidates" icon={<SafetyCertificateOutlined />} start={statsVisible} />
                        <div className={s.statDivider} />
                        <StatItem value={48} suffix="h" label="Avg Response Time" icon={<ThunderboltOutlined />} start={statsVisible} />
                    </div>
                </div>
            </section>

            {/* ══════════════════ QUICK PATHS ══════════════════ */}
            <section className={`${styles['container']} ${s.section}`}>
                <div className={s.sectionHead}>
                    <div>
                        <span className={s.chip}>🚀 Quick paths</span>
                        <h2 className={s.sectionTitle}>Explore by your goals</h2>
                    </div>
                    <p className={s.sectionDesc}>
                        Whether you are looking for skills, expertise, or companies — we have it all.
                    </p>
                </div>

                <div className={s.pathGrid}>
                    <Link to="/job" className={`${s.pathCard} ${s.pathCardPrimary}`}>
                        <div className={s.pathCardBg} aria-hidden="true" />
                        <span className={s.pathIcon}><ThunderboltOutlined /></span>
                        <div className={s.pathInfo}>
                            <strong>IT Jobs</strong>
                            <span>Find jobs matching your stack</span>
                        </div>
                        <ArrowRightOutlined className={s.pathArrow} />
                    </Link>
                    <Link to="/skills" className={`${s.pathCard} ${s.pathCardSecondary}`}>
                        <div className={s.pathCardBg} aria-hidden="true" />
                        <span className={s.pathIcon}><CodeOutlined /></span>
                        <div className={s.pathInfo}>
                            <strong>Skills</strong>
                            <span>Browse full skill categories</span>
                        </div>
                        <ArrowRightOutlined className={s.pathArrow} />
                    </Link>
                    <Link to="/expertise" className={`${s.pathCard} ${s.pathCardTertiary}`}>
                        <div className={s.pathCardBg} aria-hidden="true" />
                        <span className={s.pathIcon}><RocketOutlined /></span>
                        <div className={s.pathInfo}>
                            <strong>Expertise</strong>
                            <span>Explore expertise roadmaps</span>
                        </div>
                        <ArrowRightOutlined className={s.pathArrow} />
                    </Link>
                    <Link to="/company" className={`${s.pathCard} ${s.pathCardQuaternary}`}>
                        <div className={s.pathCardBg} aria-hidden="true" />
                        <span className={s.pathIcon}><RiseOutlined /></span>
                        <div className={s.pathInfo}>
                            <strong>Top Companies</strong>
                            <span>Leading IT employers</span>
                        </div>
                        <ArrowRightOutlined className={s.pathArrow} />
                    </Link>
                </div>
            </section>

            {/* ══════════════════ COMPANIES ══════════════════ */}
            <section className={`${styles['container']} ${s.section}`}>
                <div className={s.marketCard}>
                    <div className={s.marketCardHeader}>
                        <div className={s.marketCardLeft}>
                            <span className={s.chipBlue}>🏢 Companies</span>
                            <h2 className={s.marketTitle}>Featured Employers</h2>
                            <p className={s.marketDesc}>Leading IT recruiters active on the platform.</p>
                        </div>
                        <Link to="/company" className={s.viewAllBtn}>
                            View all <ArrowRightOutlined />
                        </Link>
                    </div>
                    <div className={s.marketBody}>
                        <CompanyCard />
                    </div>
                </div>
            </section>

            {/* ══════════════════ FEATURED ARTICLES ══════════════════ */}
            {(articlesLoading || featuredArticles.length > 0) && (
                <section className={`${styles['container']} ${s.section}`}>
                    <div className={s.marketCard}>
                        <div className={s.marketCardHeader}>
                            <div className={s.marketCardLeft}>
                                <span className={s.chipRed}>📰 Articles</span>
                                <h2 className={s.marketTitle}>Featured Articles</h2>
                                <p className={s.marketDesc}>Career tips, tech news & salary insights for IT professionals.</p>
                            </div>
                            <Link to="/articles" className={s.viewAllBtn}>
                                View all <ArrowRightOutlined />
                            </Link>
                        </div>
                        <div className={s.marketBody}>
                            {articlesLoading ? (
                                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                    <Spin size="large" />
                                </div>
                            ) : (
                                <div className={s.articlesGrid}>
                                    {/* Large featured card — first article */}
                                    {featuredArticles[0] && (
                                        <Link
                                            to={`/articles/${featuredArticles[0].id}`}
                                            className={`${s.articleCard} ${s.articleCardLarge}`}
                                        >
                                            <div className={s.articleCardImg}>
                                                {featuredArticles[0].thumbnail ? (
                                                    <img src={featuredArticles[0].thumbnail} alt={featuredArticles[0].title} />
                                                ) : (
                                                    <div className={s.articleCardImgPlaceholder}><ReadOutlined /></div>
                                                )}
                                                {featuredArticles[0].category && (
                                                    <span className={s.articleCardCat}>{featuredArticles[0].category}</span>
                                                )}
                                            </div>
                                            <div className={s.articleCardBody}>
                                                <h3 className={s.articleCardTitle}>{featuredArticles[0].title}</h3>
                                                <p className={s.articleCardDesc}>{featuredArticles[0].description}</p>
                                                <div className={s.articleCardMeta}>
                                                    <span><CalendarOutlined style={{ marginRight: 4 }} />
                                                        {featuredArticles[0].createdAt ? dayjs(featuredArticles[0].createdAt).format('DD MMM YYYY') : ''}
                                                    </span>
                                                    <span><EyeOutlined style={{ marginRight: 4 }} />{featuredArticles[0].viewCount ?? 0} views</span>
                                                </div>
                                            </div>
                                        </Link>
                                    )}
                                    {/* Small cards — remaining articles */}
                                    <div className={s.articlesSideGrid}>
                                        {featuredArticles.slice(1, 5).map(article => (
                                            <Link
                                                key={article.id}
                                                to={`/articles/${article.id}`}
                                                className={s.articleCard}
                                            >
                                                <div className={s.articleCardImg}>
                                                    {article.thumbnail ? (
                                                        <img src={article.thumbnail} alt={article.title} />
                                                    ) : (
                                                        <div className={s.articleCardImgPlaceholder}><ReadOutlined /></div>
                                                    )}
                                                    {article.category && (
                                                        <span className={s.articleCardCat}>{article.category}</span>
                                                    )}
                                                </div>
                                                <div className={s.articleCardBody}>
                                                    <h3 className={s.articleCardTitle}>{article.title}</h3>
                                                    <div className={s.articleCardMeta}>
                                                        <span><CalendarOutlined style={{ marginRight: 4 }} />
                                                            {article.createdAt ? dayjs(article.createdAt).format('DD MMM YYYY') : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* ══════════════════ JOBS ══════════════════ */}
            <section className={`${styles['container']} ${s.section}`}>
                <div className={s.marketCard}>
                    <div className={s.marketCardHeader}>
                        <div className={s.marketCardLeft}>
                            <span className={s.chipGreen}>⚡ Jobs</span>
                            <h2 className={s.marketTitle}>Latest Jobs</h2>
                            <p className={s.marketDesc}>Freshly updated jobs pushed to the top for quick scanning.</p>
                        </div>
                        <Link to="/job" className={s.viewAllBtn}>
                            View all <ArrowRightOutlined />
                        </Link>
                    </div>
                    <div className={s.marketBody}>
                        <JobCard />
                    </div>
                </div>
            </section>

            {/* ══════════════════ EXPERTISE ══════════════════ */}
            <section className={`${styles['container']} ${s.section}`}>
                <div className={s.expertiseWrap}>
                    <ExpertiseSummary />
                </div>
            </section>


            {/* ══════════════════ CTA BANNER ══════════════════ */}
            <section className={`${styles['container']} ${s.section}`}>
                <div className={s.ctaBanner}>
                    <div className={s.ctaBannerBg} aria-hidden="true" />
                    <div className={s.ctaContent}>
                        <span className={s.ctaEmoji}>🎯</span>
                        <h2 className={s.ctaTitle}>Ready to boost your IT career?</h2>
                        <p className={s.ctaDesc}>
                            Join over <strong>50,000+</strong> IT professionals using JobHunter every day.
                        </p>
                        <div className={s.ctaActions}>
                            <Link to="/job" className={s.ctaPrimary}>
                                <ThunderboltOutlined /> Find jobs now
                            </Link>
                            <Link to="/login" className={s.ctaSecondary}>
                                Join for free <ArrowRightOutlined />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default HomePage;
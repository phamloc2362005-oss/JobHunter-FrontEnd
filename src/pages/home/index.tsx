import {
    ArrowRightOutlined,
    BulbOutlined,
    CalendarOutlined,
    CodeOutlined,
    EyeOutlined,
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
import { Spin } from 'antd';
import { callFetchFeaturedArticles } from '@/config/api';
import { IArticle } from '@/types/backend';
import { Link } from 'react-router-dom';
import styles from 'styles/client.module.scss';
import s from './index.module.scss';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import { useEffect, useRef, useState, useCallback } from 'react';

/* ─── Animated counter hook ─── */
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

/* ─── 3D Tilt Card ─── */
const TiltCard = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;
        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03,1.03,1.03)`;
    }, []);

    const handleMouseLeave = useCallback(() => {
        const card = cardRef.current;
        if (!card) return;
        card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    }, []);

    return (
        <div
            ref={cardRef}
            className={className}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ transition: 'transform 0.1s ease', willChange: 'transform' }}
        >
            {children}
        </div>
    );
};

/* ─── WebGL Particle Canvas ─── */
const ParticleCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animId: number;
        let W = canvas.offsetWidth;
        let H = canvas.offsetHeight;
        canvas.width = W;
        canvas.height = H;

        interface Particle {
            x: number; y: number; z: number;
            vx: number; vy: number; vz: number;
            r: number; color: string;
        }

        const COLORS = ['#38bdf8', '#818cf8', '#a78bfa', '#34d399', '#f472b6'];
        const COUNT = 120;

        const particles: Particle[] = Array.from({ length: COUNT }, () => ({
            x: Math.random() * W,
            y: Math.random() * H,
            z: Math.random() * 1000,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            vz: Math.random() * 2 + 0.5,
            r: Math.random() * 2 + 0.5,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
        }));

        const fov = 500;
        const drawLine = (p1: Particle, p2: Particle, d: number) => {
            const scale1 = fov / (fov + p1.z);
            const scale2 = fov / (fov + p2.z);
            const sx1 = p1.x * scale1 + W / 2 * (1 - scale1);
            const sy1 = p1.y * scale1 + H / 2 * (1 - scale1);
            const sx2 = p2.x * scale2 + W / 2 * (1 - scale2);
            const sy2 = p2.y * scale2 + H / 2 * (1 - scale2);
            ctx.beginPath();
            ctx.moveTo(sx1, sy1);
            ctx.lineTo(sx2, sy2);
            ctx.strokeStyle = `rgba(99,102,241,${Math.max(0, 0.25 - d / 28000)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
        };

        const render = () => {
            ctx.clearRect(0, 0, W, H);

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.z -= p.vz;

                if (p.z <= 0) p.z = 1000;
                if (p.x < 0 || p.x > W) p.vx *= -1;
                if (p.y < 0 || p.y > H) p.vy *= -1;

                const scale = fov / (fov + p.z);
                const sx = p.x * scale + W / 2 * (1 - scale);
                const sy = p.y * scale + H / 2 * (1 - scale);
                const r = p.r * scale;

                ctx.beginPath();
                ctx.arc(sx, sy, r, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = scale * 0.8;
                ctx.fill();
                ctx.globalAlpha = 1;

                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x, dy = p.y - p2.y;
                    const d = dx * dx + dy * dy;
                    if (d < 28000) drawLine(p, p2, d);
                }
            }
            animId = requestAnimationFrame(render);
        };

        render();

        const onResize = () => {
            W = canvas.offsetWidth;
            H = canvas.offsetHeight;
            canvas.width = W;
            canvas.height = H;
        };
        window.addEventListener('resize', onResize);

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', onResize);
        };
    }, []);

    return <canvas ref={canvasRef} className={s.particleCanvas} />;
};

const TECH_TAGS = ['React', 'Node.js', 'Java', 'Python', 'Go', 'AWS', 'Docker', 'Kubernetes', 'TypeScript', 'GraphQL', 'Vue', 'Spring Boot', 'MongoDB', 'Redis', '.NET', 'Flutter'];

const QUICK_PATHS = [
    { to: '/job', icon: <ThunderboltOutlined />, label: 'IT Jobs', sub: 'Find jobs matching your stack', colorClass: s.pathCardBlue },
    { to: '/skills', icon: <CodeOutlined />, label: 'Skills', sub: 'Browse full skill categories', colorClass: s.pathCardPurple },
    { to: '/expertise', icon: <RocketOutlined />, label: 'Expertise', sub: 'Explore expertise roadmaps', colorClass: s.pathCardOrange },
    { to: '/company', icon: <RiseOutlined />, label: 'Top Companies', sub: 'Leading IT employers', colorClass: s.pathCardGreen },
];

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
                <ParticleCanvas />
                <div className={s.heroBg} aria-hidden="true" />
                <div className={s.heroNoise} aria-hidden="true" />

                {/* Orbit rings */}
                <div className={s.orbitRing1} aria-hidden="true" />
                <div className={s.orbitRing2} aria-hidden="true" />
                <div className={s.orbitRing3} aria-hidden="true" />

                <div className={`${styles['container']} ${s.heroInner}`}>
                    {/* Badge */}
                    <div className={s.heroBadge}>
                        <span className={s.badgeLive}></span>
                        <span>#1 Platform for IT professionals in Vietnam</span>
                    </div>

                    {/* Title with 3D text */}
                    <h1 className={s.heroTitle}>
                        <span className={s.heroTitleLine1}>Find IT jobs</span>
                        <span className={s.heroTitleAccent}> with your stack,</span>
                        <br />
                        <span className={s.heroTitleLine3}>right team, right salary.</span>
                    </h1>

                    <p className={s.heroSub}>
                        Connect with hundreds of top tech companies. Filter by skills,
                        level, location, and salary range — in just one click.
                    </p>

                    {/* Glassmorphism search box */}
                    <div className={s.searchBox}>
                        <div className={s.searchGlowTop} aria-hidden="true" />
                        <div className={s.searchGlowBottom} aria-hidden="true" />
                        <SearchClient />
                    </div>

                    {/* Tech tag strip */}
                    <div className={s.tagStrip}>
                        <span className={s.tagStripLabel}>Trending:</span>
                        {TECH_TAGS.map(tag => (
                            <Link key={tag} to={`/job?skills=${tag}`} className={s.techTag}>{tag}</Link>
                        ))}
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className={s.scrollIndicator} aria-hidden="true">
                    <div className={s.scrollMouse}>
                        <div className={s.scrollWheel} />
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
                        <span className={s.chip}>Quick paths</span>
                        <h2 className={s.sectionTitle}>Explore by your goals</h2>
                    </div>
                    <p className={s.sectionDesc}>
                        Whether you're looking for skills, expertise, or companies — we have it all.
                    </p>
                </div>

                <div className={s.pathGrid}>
                    {QUICK_PATHS.map(path => (
                        <TiltCard key={path.to} className={`${s.pathCard} ${path.colorClass}`}>
                            <Link to={path.to} className={s.pathCardInner}>
                                <div className={s.pathCardGlow} />
                                <span className={s.pathIcon}>{path.icon}</span>
                                <div className={s.pathInfo}>
                                    <strong>{path.label}</strong>
                                    <span>{path.sub}</span>
                                </div>
                                <ArrowRightOutlined className={s.pathArrow} />
                            </Link>
                        </TiltCard>
                    ))}
                </div>
            </section>

            {/* ══════════════════ COMPANIES ══════════════════ */}
            <section className={`${styles['container']} ${s.section}`}>
                <div className={s.glassPanel}>
                    <div className={s.glassPanelHeader}>
                        <div className={s.glassPanelLeft}>
                            <span className={s.chipBlue}>Companies</span>
                            <h2 className={s.panelTitle}>Featured Employers</h2>
                            <p className={s.panelDesc}>Leading IT recruiters active on the platform.</p>
                        </div>
                        <Link to="/company" className={s.viewAllBtn}>
                            View all <ArrowRightOutlined />
                        </Link>
                    </div>
                    <div className={s.glassPanelBody}>
                        <CompanyCard />
                    </div>
                </div>
            </section>

            {/* ══════════════════ FEATURED ARTICLES ══════════════════ */}
            {(articlesLoading || featuredArticles.length > 0) && (
                <section className={`${styles['container']} ${s.section}`}>
                    <div className={s.glassPanel}>
                        <div className={s.glassPanelHeader}>
                            <div className={s.glassPanelLeft}>
                                <span className={s.chipRed}>Articles</span>
                                <h2 className={s.panelTitle}>Featured Articles</h2>
                                <p className={s.panelDesc}>Career tips, tech news &amp; salary insights for IT professionals.</p>
                            </div>
                            <Link to="/articles" className={s.viewAllBtn}>
                                View all <ArrowRightOutlined />
                            </Link>
                        </div>
                        <div className={s.glassPanelBody}>
                            {articlesLoading ? (
                                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                                    <Spin size="large" />
                                </div>
                            ) : (
                                <div className={s.articlesGrid}>
                                    {/* Large featured card — first article */}
                                    {featuredArticles[0] && (
                                        <TiltCard className={`${s.articleCard} ${s.articleCardLarge}`}>
                                            <Link to={`/articles/${featuredArticles[0].id}`} className={s.articleCardLink}>
                                                <div className={s.articleCardImg}>
                                                    {featuredArticles[0].thumbnail ? (
                                                        <img src={featuredArticles[0].thumbnail} alt={featuredArticles[0].title} />
                                                    ) : (
                                                        <div className={s.articleCardImgPlaceholder}><ReadOutlined /></div>
                                                    )}
                                                    {featuredArticles[0].category && (
                                                        <span className={s.articleCardCat}>{featuredArticles[0].category}</span>
                                                    )}
                                                    <div className={s.articleCardOverlay} />
                                                </div>
                                                <div className={s.articleCardBody}>
                                                    <h3 className={s.articleCardTitle}>{featuredArticles[0].title}</h3>
                                                    <p className={s.articleCardDesc}>{featuredArticles[0].description}</p>
                                                    <div className={s.articleCardMeta}>
                                                        <span><CalendarOutlined style={{ marginRight: 4 }} />
                                                            {featuredArticles[0].createdAt ? dayjs(featuredArticles[0].createdAt).locale('en').format('DD MMM YYYY') : ''}
                                                        </span>
                                                        <span><EyeOutlined style={{ marginRight: 4 }} />{featuredArticles[0].viewCount ?? 0} views</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </TiltCard>
                                    )}
                                    {/* Small cards — remaining articles */}
                                    <div className={s.articlesSideGrid}>
                                        {featuredArticles.slice(1, 5).map(article => (
                                            <TiltCard key={article.id} className={s.articleCard}>
                                                <Link to={`/articles/${article.id}`} className={s.articleCardLink}>
                                                    <div className={s.articleCardImg}>
                                                        {article.thumbnail ? (
                                                            <img src={article.thumbnail} alt={article.title} />
                                                        ) : (
                                                            <div className={s.articleCardImgPlaceholder}><ReadOutlined /></div>
                                                        )}
                                                        {article.category && (
                                                            <span className={s.articleCardCat}>{article.category}</span>
                                                        )}
                                                        <div className={s.articleCardOverlay} />
                                                    </div>
                                                    <div className={s.articleCardBody}>
                                                        <h3 className={s.articleCardTitle}>{article.title}</h3>
                                                        <div className={s.articleCardMeta}>
                                                            <span><CalendarOutlined style={{ marginRight: 4 }} />
                                                                {article.createdAt ? dayjs(article.createdAt).locale('en').format('DD MMM YYYY') : ''}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </TiltCard>
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
                <div className={s.glassPanel}>
                    <div className={s.glassPanelHeader}>
                        <div className={s.glassPanelLeft}>
                            <span className={s.chipGreen}>Jobs</span>
                            <h2 className={s.panelTitle}>Latest Jobs</h2>
                            <p className={s.panelDesc}>Freshly updated jobs pushed to the top for quick scanning.</p>
                        </div>
                        <Link to="/job" className={s.viewAllBtn}>
                            View all <ArrowRightOutlined />
                        </Link>
                    </div>
                    <div className={s.glassPanelBody}>
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
                    {/* 3D mesh grid */}
                    <div className={s.ctaMesh} aria-hidden="true" />
                    <div className={s.ctaBlob1} aria-hidden="true" />
                    <div className={s.ctaBlob2} aria-hidden="true" />

                    <div className={s.ctaContent}>

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
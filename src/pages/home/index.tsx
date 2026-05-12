import {
    ArrowRightOutlined,
    BulbOutlined,
    CodeOutlined,
    EnvironmentOutlined,
    FireOutlined,
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
import { Link } from 'react-router-dom';
import styles from 'styles/client.module.scss';
import s from './index.module.scss';
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

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
            { threshold: 0.3 }
        );
        if (statsRef.current) observer.observe(statsRef.current);
        return () => observer.disconnect();
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
                        <FireOutlined /> Platform #1 cho IT professionals tại Việt Nam
                    </div>

                    <h1 className={s.heroTitle}>
                        Tìm việc IT <span className={s.gradientText}>đúng stack</span>,<br />
                        đúng team, đúng mức lương.
                    </h1>

                    <p className={s.heroSub}>
                        Kết nối với hàng trăm công ty công nghệ hàng đầu. Filter theo kỹ năng,
                        level, địa điểm và salary range — chỉ trong một cú click.
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
                        <StatItem value={5000} suffix="+" label="Việc làm IT đang tuyển" icon={<BulbOutlined />} start={statsVisible} />
                        <div className={s.statDivider} />
                        <StatItem value={1200} suffix="+" label="Công ty đối tác" icon={<TeamOutlined />} start={statsVisible} />
                        <div className={s.statDivider} />
                        <StatItem value={98} suffix="%" label="Ứng viên hài lòng" icon={<SafetyCertificateOutlined />} start={statsVisible} />
                        <div className={s.statDivider} />
                        <StatItem value={48} suffix="h" label="Phản hồi trung bình" icon={<ThunderboltOutlined />} start={statsVisible} />
                    </div>
                </div>
            </section>

            {/* ══════════════════ QUICK PATHS ══════════════════ */}
            <section className={`${styles['container']} ${s.section}`}>
                <div className={s.sectionHead}>
                    <div>
                        <span className={s.chip}>🚀 Quick paths</span>
                        <h2 className={s.sectionTitle}>Khám phá ngay theo mục tiêu</h2>
                    </div>
                    <p className={s.sectionDesc}>
                        Dù bạn muốn tìm kỹ năng, chuyên môn hay công ty — chúng mình đều có.
                    </p>
                </div>

                <div className={s.pathGrid}>
                    <Link to="/job" className={`${s.pathCard} ${s.pathCardPrimary}`}>
                        <div className={s.pathCardBg} aria-hidden="true" />
                        <span className={s.pathIcon}><ThunderboltOutlined /></span>
                        <div className={s.pathInfo}>
                            <strong>Việc làm IT</strong>
                            <span>Tìm job phù hợp với stack của bạn</span>
                        </div>
                        <ArrowRightOutlined className={s.pathArrow} />
                    </Link>
                    <Link to="/skills" className={`${s.pathCard} ${s.pathCardSecondary}`}>
                        <div className={s.pathCardBg} aria-hidden="true" />
                        <span className={s.pathIcon}><CodeOutlined /></span>
                        <div className={s.pathInfo}>
                            <strong>Kỹ năng</strong>
                            <span>Duyệt toàn bộ danh mục kỹ năng</span>
                        </div>
                        <ArrowRightOutlined className={s.pathArrow} />
                    </Link>
                    <Link to="/expertise" className={`${s.pathCard} ${s.pathCardTertiary}`}>
                        <div className={s.pathCardBg} aria-hidden="true" />
                        <span className={s.pathIcon}><RocketOutlined /></span>
                        <div className={s.pathInfo}>
                            <strong>Chuyên môn</strong>
                            <span>Khám phá mọi lộ trình chuyên môn</span>
                        </div>
                        <ArrowRightOutlined className={s.pathArrow} />
                    </Link>
                    <Link to="/company" className={`${s.pathCard} ${s.pathCardQuaternary}`}>
                        <div className={s.pathCardBg} aria-hidden="true" />
                        <span className={s.pathIcon}><RiseOutlined /></span>
                        <div className={s.pathInfo}>
                            <strong>Top Công ty</strong>
                            <span>Nhà tuyển dụng IT hàng đầu</span>
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
                            <h2 className={s.marketTitle}>Top tuyển dụng nổi bật</h2>
                            <p className={s.marketDesc}>Các nhà tuyển dụng IT đang hoạt động tích cực trên hệ thống.</p>
                        </div>
                        <Link to="/company" className={s.viewAllBtn}>
                            Xem tất cả <ArrowRightOutlined />
                        </Link>
                    </div>
                    <div className={s.marketBody}>
                        <CompanyCard />
                    </div>
                </div>
            </section>

            {/* ══════════════════ JOBS ══════════════════ */}
            <section className={`${styles['container']} ${s.section}`}>
                <div className={s.marketCard}>
                    <div className={s.marketCardHeader}>
                        <div className={s.marketCardLeft}>
                            <span className={s.chipGreen}>⚡ Jobs</span>
                            <h2 className={s.marketTitle}>Việc làm mới nhất</h2>
                            <p className={s.marketDesc}>Các job vừa cập nhật được đẩy lên đầu để bạn scan nhanh hơn.</p>
                        </div>
                        <Link to="/job" className={s.viewAllBtn}>
                            Xem tất cả <ArrowRightOutlined />
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
                        <h2 className={s.ctaTitle}>Bạn đã sẵn sàng bứt phá sự nghiệp IT?</h2>
                        <p className={s.ctaDesc}>
                            Tham gia cùng hơn <strong>50,000+</strong> IT professionals đang dùng JobHunter mỗi ngày.
                        </p>
                        <div className={s.ctaActions}>
                            <Link to="/job" className={s.ctaPrimary}>
                                <ThunderboltOutlined /> Tìm việc ngay
                            </Link>
                            <Link to="/login" className={s.ctaSecondary}>
                                Đăng ký miễn phí <ArrowRightOutlined />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
            {/* ══════════════════ FOOTER ══════════════════ */}
            <footer className={s.footer}>
                <div className={`${styles['container']} ${s.footerInner}`}>
                    <div className={s.footerBrand}>
                        <div className={s.footerLogo}>
                            <CodeOutlined />
                        </div>
                        <strong>JobHunter</strong>
                        <p>Platform tuyển dụng IT hàng đầu Việt Nam. Built for developers, by developers.</p>
                    </div>

                    <div className={s.footerLinks}>
                        <div className={s.footerCol}>
                            <h4>Platform</h4>
                            <a href="/">Trang Chủ</a>
                            <a href="/job">Việc Làm</a>
                            <a href="/company">Công Ty</a>
                            <a href="/skills">Kỹ Năng</a>
                        </div>
                        <div className={s.footerCol}>
                            <h4>Nhà Tuyển Dụng</h4>
                            <a href="#">Đăng tin tuyển dụng</a>
                            <a href="#">Tìm ứng viên</a>
                            <a href="#">Dashboard công ty</a>
                            <a href="#">Bảng giá</a>
                        </div>
                        <div className={s.footerCol}>
                            <h4>Liên Hệ</h4>
                            <a href="mailto:support@jobhunter.com">support@jobhunter.com</a>
                            <a href="tel:+84123456789">+84 123 456 789</a>
                            <span>TP. Hồ Chí Minh, Việt Nam</span>
                        </div>
                    </div>
                </div>
                <div className={s.footerBottom}>
                    <div className={styles['container']}>
                        <span>© 2024 JobHunter. All rights reserved.</span>
                        <div className={s.footerBottomLinks}>
                            <a href="#">Privacy Policy</a>
                            <a href="#">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>

        </div>
    );
};

export default HomePage;
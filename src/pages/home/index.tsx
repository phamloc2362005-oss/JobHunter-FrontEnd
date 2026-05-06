import { ArrowRightOutlined, CodeOutlined, RiseOutlined, ThunderboltOutlined } from '@ant-design/icons';
import SearchClient from '@/components/client/search.client';
import JobCard from '@/components/client/card/job.card';
import CompanyCard from '@/components/client/card/company.card';
import ExpertiseSummary from '@/components/client/expertise-summary';
import { Link } from 'react-router-dom';
import styles from 'styles/client.module.scss';
import homeStyles from './index.module.scss';

const HomePage = () => {
    return (
        <div className={homeStyles.pageShell}>
            <section className={homeStyles.heroSection}>
                <div className={styles["container"]}>
                    <div className={homeStyles.heroGrid}>
                        <div className={homeStyles.heroCopy}>
                            <span className={homeStyles.kicker}>JOBHUNTER · IT CAREER PLATFORM</span>
                            <h1 className={homeStyles.heroTitle}>Find IT jobs that match your stack, team, and ambition.</h1>
                            <p className={homeStyles.heroDescription}>
                                Search by skills, companies, expertise, and location from one polished homepage built for faster decisions.
                            </p>

                            <div className={homeStyles.heroActions}>
                                <Link to="/skills" className={homeStyles.heroAction}>
                                    <CodeOutlined />
                                    Browse skills
                                </Link>
                                <Link to="/expertise" className={homeStyles.heroAction}>
                                    <ThunderboltOutlined />
                                    Browse expertise
                                </Link>
                                <Link to="/company" className={homeStyles.heroAction}>
                                    <RiseOutlined />
                                    Top companies
                                </Link>
                            </div>

                            <div className={homeStyles.statGrid}>
                                <div className={homeStyles.statCard}>
                                    <strong>Fast search</strong>
                                    <span>Filter by multiple criteria in one place</span>
                                </div>
                                <div className={homeStyles.statCard}>
                                    <strong>Fresh listings</strong>
                                    <span>Updated jobs and companies on the fly</span>
                                </div>
                                <div className={homeStyles.statCard}>
                                    <strong>IT focused</strong>
                                    <span>Designed for developers and tech roles</span>
                                </div>
                            </div>
                        </div>

                        <div className={homeStyles.searchShell}>
                            <div className={homeStyles.searchGlow} />
                            <SearchClient />
                        </div>
                    </div>
                </div>
            </section>

            <section className={`${styles["container"]} ${homeStyles.contentSection}`}>
                <div className={homeStyles.sectionHeader}>
                    <div>
                        <span className={homeStyles.sectionKicker}>Quick paths</span>
                        <h2>Jump straight to what you need</h2>
                    </div>
                    <p>Built for people who already know whether they want a skill, an expertise path, or a target company.</p>
                </div>

                <div className={homeStyles.featureGrid}>
                    <Link to="/skills" className={homeStyles.featureCard}>
                        <span className={homeStyles.featureIcon}><CodeOutlined /></span>
                        <span className={homeStyles.featureText}>
                            <strong>Skills</strong>
                            <span>Browse the full skills catalog</span>
                        </span>
                        <ArrowRightOutlined className={homeStyles.featureArrow} />
                    </Link>
                    <Link to="/expertise" className={homeStyles.featureCard}>
                        <span className={homeStyles.featureIcon}><ThunderboltOutlined /></span>
                        <span className={homeStyles.featureText}>
                            <strong>Expertise</strong>
                            <span>Explore every expertise path</span>
                        </span>
                        <ArrowRightOutlined className={homeStyles.featureArrow} />
                    </Link>
                    <Link to="/company" className={homeStyles.featureCard}>
                        <span className={homeStyles.featureIcon}><RiseOutlined /></span>
                        <span className={homeStyles.featureText}>
                            <strong>Companies</strong>
                            <span>See the strongest IT employers</span>
                        </span>
                        <ArrowRightOutlined className={homeStyles.featureArrow} />
                    </Link>
                </div>
            </section>

            <section className={`${styles["container"]} ${homeStyles.contentSection} ${homeStyles.marketContainer}`}>
                <div className={homeStyles.sectionHeader}>
                    <div>
                        <span className={homeStyles.sectionKicker}>Market pulse</span>
                        <h2>Top companies and latest jobs</h2>
                    </div>
                    <p>A quick scan of the market, with recruiters and jobs presented as two focused editorial blocks.</p>
                </div>

                <div className={homeStyles.marketStack}>
                    <section className={homeStyles.marketSectionCompany}>
                        <div className={homeStyles.marketHeader}>
                            <div>
                                <span className={homeStyles.marketTagCompany}>Companies</span>
                                <h3>Top tuyển dụng nổi bật</h3>
                                <p>Khám phá các nhà tuyển dụng IT đang hoạt động nổi bật trên hệ thống.</p>
                            </div>
                            <Link to="/company" className={homeStyles.marketAction}>
                                Xem tất cả
                            </Link>
                        </div>
                        <div className={homeStyles.marketSurface}>
                            <CompanyCard />
                        </div>
                    </section>

                    <section className={homeStyles.marketSectionJob}>
                        <div className={homeStyles.marketHeader}>
                            <div>
                                <span className={homeStyles.marketTagJob}>Jobs</span>
                                <h3>Việc làm mới nhất</h3>
                                <p>Các job vừa cập nhật được đẩy lên đầu để bạn scan nhanh hơn.</p>
                            </div>
                            <Link to="/job" className={homeStyles.marketAction}>
                                Xem tất cả
                            </Link>
                        </div>
                        <div className={homeStyles.marketSurface}>
                            <JobCard />
                        </div>
                    </section>
                </div>
            </section>

            <section className={`${styles["container"]} ${homeStyles.contentSection} ${homeStyles.marketContainer}`}>
                <div className={homeStyles.surfaceCard}>
                    <ExpertiseSummary />
                </div>
            </section>

            <div className={`${styles["footer-section"]} ${homeStyles.footerShell}`}>
                <div className={`${styles["container"]}`}>
                    <div className={styles["footer-content"]}>
                        <div className={styles["footer-column"]}>
                            <h3>About JobHunter</h3>
                            <p>Find your dream job and grow your career with JobHunter, the leading job platform for IT professionals.</p>
                        </div>
                        <div className={styles["footer-column"]}>
                            <h3>Quick Links</h3>
                            <ul>
                                <li><a href="/">Home</a></li>
                                <li><a href="/job">Jobs</a></li>
                                <li><a href="/company">Companies</a></li>
                                <li><a href="/skills">Skills</a></li>
                            </ul>
                        </div>
                        <div className={styles["footer-column"]}>
                            <h3>For Employers</h3>
                            <ul>
                                <li><a href="#">Post a Job</a></li>
                                <li><a href="#">Browse Candidates</a></li>
                                <li><a href="#">Pricing</a></li>
                                <li><a href="#">Company Dashboard</a></li>
                            </ul>
                        </div>
                        <div className={styles["footer-column"]}>
                            <h3>Contact</h3>
                            <p>Email: support@jobhunter.com</p>
                            <p>Phone: +84 123 456 789</p>
                            <p>Address: Ho Chi Minh City, Vietnam</p>
                        </div>
                    </div>
                    <div className={styles["footer-bottom"]}>
                        <p>&copy; 2024 JobHunter. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomePage;
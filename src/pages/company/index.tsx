import { Col, Row, Input } from 'antd';
import { CodeOutlined, SearchOutlined, EnvironmentOutlined } from '@ant-design/icons';
import styles from 'styles/client.module.scss';
import CompanyCard from '@/components/client/card/company.card';
import s from './index.module.scss';
import homeStyles from '@/pages/home/index.module.scss';

const ClientCompanyPage = (props: any) => {
    return (
        <div className={s.page}>
            {/* ── HERO ── */}
            <section className={s.hero}>
                <div className={`${styles['container']} ${s.heroInner}`}>
                    <div className={s.heroText}>
                        <div className={s.heroKicker}>
                            🏆 &nbsp;VIETNAM BEST IT COMPANIES 2024
                        </div>
                        <h1 className={s.heroTitle}>
                            The leading community for<br />
                            <span className={s.heroHighlight}>Quality IT Employers</span>
                        </h1>
                        <p className={s.heroSubtitle}>
                            Discover 1,200+ growing tech companies — from startups to enterprises, all recruiting now.
                        </p>

                        {/* Stats row */}
                        <div className={s.heroStats}>
                            <div className={s.heroStat}>
                                <strong>1,200+</strong>
                               <span>Partner Companies</span>
                            </div>
                            <div className={s.heroDivider} />
                            <div className={s.heroStat}>
                                <strong>15,000+</strong>
                                <span>IT Jobs</span>
                            </div>
                            <div className={s.heroDivider} />
                            <div className={s.heroStat}>
                                <strong>500K+</strong>
                                <span>Registered Candidates</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── COMPANY LIST ── */}
            <section className={s.listSection}>
                <div className={`${styles['container']}`}>
                    <Row gutter={[20, 20]}>
                        <Col span={24}>
                            <CompanyCard showPagination={true} variant="catalog" />
                        </Col>
                    </Row>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className={homeStyles.footer}>
                <div className={`${styles['container']} ${homeStyles.footerInner}`}>
                    <div className={homeStyles.footerBrand}>
                        <div className={homeStyles.footerLogo}>
                            <CodeOutlined />
                        </div>
                        <strong>JobHunter</strong>
                        <p>Leading IT recruitment platform in Vietnam. Built for developers, by developers.</p>
                    </div>

                    <div className={homeStyles.footerLinks}>
                        <div className={homeStyles.footerCol}>
                            <h4>Platform</h4>
                            <a href="/">Home</a>
                            <a href="/job">Jobs</a>
                            <a href="/company">Companies</a>
                            <a href="/skills">Skills</a>
                        </div>
                        <div className={homeStyles.footerCol}>
                            <h4>For Employers</h4>
                            <a href="#">Post a Job</a>
                            <a href="#">Find Candidates</a>
                            <a href="#">Employer Dashboard</a>
                            <a href="#">Pricing</a>
                        </div>
                        <div className={homeStyles.footerCol}>
                            <h4>Contact</h4>
                            <a href="mailto:support@jobhunter.com">support@jobhunter.com</a>
                            <a href="tel:+84123456789">+84 123 456 789</a>
                            <span>Ho Chi Minh City, Vietnam</span>
                        </div>
                    </div>
                </div>
                <div className={homeStyles.footerBottom}>
                    <div className={styles['container']}>
                        <span>© 2024 JobHunter. All rights reserved.</span>
                        <div className={homeStyles.footerBottomLinks}>
                            <a href="#">Privacy Policy</a>
                            <a href="#">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ClientCompanyPage;
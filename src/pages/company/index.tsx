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
                            Cộng đồng nhà tuyển dụng<br />
                            <span className={s.heroHighlight}>IT chất lượng</span> hàng đầu
                        </h1>
                        <p className={s.heroSubtitle}>
                            Khám phá hơn 1,200 công ty công nghệ đang tăng trưởng — từ startup đến enterprise, tất cả đang tuyển dụng.
                        </p>

                        {/* Stats row */}
                        <div className={s.heroStats}>
                            <div className={s.heroStat}>
                                <strong>1,200+</strong>
                                <span>Công ty đối tác</span>
                            </div>
                            <div className={s.heroDivider} />
                            <div className={s.heroStat}>
                                <strong>15,000+</strong>
                                <span>Việc làm IT</span>
                            </div>
                            <div className={s.heroDivider} />
                            <div className={s.heroStat}>
                                <strong>500K+</strong>
                                <span>Ứng viên đăng ký</span>
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
                        <p>Platform tuyển dụng IT hàng đầu Việt Nam. Built for developers, by developers.</p>
                    </div>

                    <div className={homeStyles.footerLinks}>
                        <div className={homeStyles.footerCol}>
                            <h4>Platform</h4>
                            <a href="/">Trang Chủ</a>
                            <a href="/job">Việc Làm</a>
                            <a href="/company">Công Ty</a>
                            <a href="/skills">Kỹ Năng</a>
                        </div>
                        <div className={homeStyles.footerCol}>
                            <h4>Nhà Tuyển Dụng</h4>
                            <a href="#">Đăng tin tuyển dụng</a>
                            <a href="#">Tìm ứng viên</a>
                            <a href="#">Dashboard công ty</a>
                            <a href="#">Bảng giá</a>
                        </div>
                        <div className={homeStyles.footerCol}>
                            <h4>Liên Hệ</h4>
                            <a href="mailto:support@jobhunter.com">support@jobhunter.com</a>
                            <a href="tel:+84123456789">+84 123 456 789</a>
                            <span>TP. Hồ Chí Minh, Việt Nam</span>
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
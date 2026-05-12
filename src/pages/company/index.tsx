import { Col, Row } from 'antd';
import styles from 'styles/client.module.scss';
import CompanyCard from '@/components/client/card/company.card';
import s from './index.module.scss';

const ClientCompanyPage = (props: any) => {
    return (
        <div className={s.page}>
            <section className={s.hero}>
                <div className={`${styles["container"]} ${s.heroInner}`}>
                    <div>
                        <div className={s.heroKicker}>TOP EMPLOYERS</div>
                        <h1 className={s.heroTitle}>Cộng đồng nhà tuyển dụng IT chất lượng</h1>
                        <p className={s.heroSubtitle}>
                            Khám phá các công ty công nghệ đang tăng trưởng nhanh, văn hoá tốt và tuyển dụng liên tục.
                        </p>
                        <div className={s.heroStats}>
                            <div className={s.heroStat}>
                                <strong>1,200+</strong>
                                <span>Doanh nghiệp đối tác</span>
                            </div>
                            <div className={s.heroStat}>
                                <strong>65%</strong>
                                <span>Đăng job mỗi tuần</span>
                            </div>
                            <div className={s.heroStat}>
                                <strong>Top 5</strong>
                                <span>Ngành tuyển mạnh nhất</span>
                            </div>
                        </div>
                    </div>
                    <div className={s.heroPanel}>
                        <h3>Vì sao ứng viên chọn JobHunter?</h3>
                        <p>Chúng tôi giúp bạn đọc nhanh hồ sơ công ty, lọc đúng stack và nắm job mới nhất.</p>
                        <ul>
                            <li>• Thông tin rõ ràng về tech stack</li>
                            <li>• Tốc độ cập nhật job theo ngày</li>
                            <li>• Ưu tiên công ty có feedback tốt</li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className={s.listSection}>
                <div className={`${styles["container"]} ${s.listShell}`}>
                    <Row gutter={[20, 20]}>
                        <Col span={24}>
                            <CompanyCard showPagination={true} variant="catalog" />
                        </Col>
                    </Row>
                </div>
            </section>
        </div>
    )
}

export default ClientCompanyPage;
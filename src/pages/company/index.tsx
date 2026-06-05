import { Col, Row } from 'antd';
import {
    BuildOutlined,
    TeamOutlined,
    RocketOutlined,
    TrophyOutlined,
} from '@ant-design/icons';
import styles from 'styles/client.module.scss';
import CompanyCard from '@/components/client/card/company.card';
import s from './index.module.scss';
import ThreeBackground from '@/components/client/ThreeBackground';

/* ── KPI Dashboard data ── */
const KPI_CARDS = [
    {
        icon: <BuildOutlined />,
        iconClass: 'teal',
        value: '1,200+',
        label: 'Partner Companies',
        trend: '+18%',
        trendClass: 'up',
    },
    {
        icon: <TeamOutlined />,
        iconClass: 'blue',
        value: '500K+',
        label: 'Registered Candidates',
        trend: '+24%',
        trendClass: 'up',
    },
    {
        icon: <RocketOutlined />,
        iconClass: 'purple',
        value: '15,000+',
        label: 'Active IT Jobs',
        trend: '+11%',
        trendClass: 'up',
    },
    {
        icon: <TrophyOutlined />,
        iconClass: 'orange',
        value: '95%',
        label: 'Employer Satisfaction',
        trend: '+5%',
        trendClass: 'up',
    },
];

const ClientCompanyPage = (props: any) => {
    return (
        <div className={s.page}>

            {/* ═══ Hero — 3D Canvas ═══ */}
            <section className={s.hero}>
                {/* Real 3D canvas background */}
                <ThreeBackground />

                <div className={`${styles['container']}`}>
                    <div className={s.heroInner}>
                        <div className={s.heroKicker}>
                            VIETNAM BEST IT COMPANIES 2024
                        </div>

                        <h1 className={s.heroTitle}>
                            The leading community for<br />
                            <span className={s.heroHighlight}>Quality IT Employers</span>
                        </h1>

                        <p className={s.heroSubtitle}>
                            Discover 1,200+ growing tech companies — from startups to enterprises, all recruiting now.
                        </p>

                        {/* Stats mini-cards */}
                        <div className={s.heroStats}>
                            <div className={s.heroStat}>
                                <strong>1,200+</strong>
                                <span>Partner Companies</span>
                            </div>
                            <div className={s.heroStat}>
                                <strong>15,000+</strong>
                                <span>IT Jobs</span>
                            </div>
                            <div className={s.heroStat}>
                                <strong>500K+</strong>
                                <span>Registered Candidates</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ KPI Stats Bar (light) ═══ */}
            <div className={s.statsBar}>
                <div className={styles['container']}>
                    <div className={s.statsGrid}>
                        {KPI_CARDS.map((card, i) => (
                            <div key={i} className={s.statCard}>
                                <div className={`${s.statCardIcon} ${s[card.iconClass]}`}>
                                    {card.icon}
                                </div>
                                <div className={s.statCardInfo}>
                                    <div className={s.statCardVal}>{card.value}</div>
                                    <div className={s.statCardLabel}>{card.label}</div>
                                </div>
                                <div className={`${s.statCardTrend} ${s[card.trendClass]}`}>
                                    {card.trend}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══ Company List (light) ═══ */}
            <section className={s.listSection}>
                <div className={`${styles['container']}`}>
                    <Row gutter={[20, 20]}>
                        <Col span={24}>
                            <CompanyCard showPagination={true} variant="catalog" />
                        </Col>
                    </Row>
                </div>
            </section>

        </div>
    );
};

export default ClientCompanyPage;
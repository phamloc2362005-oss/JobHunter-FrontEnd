import JobListCompact from '@/components/client/card/job-list-compact';
import JobDetailPanel from '@/components/client/card/job-detail-panel';
import { IJob } from '@/types/backend';
import { useState, useCallback, useEffect } from 'react';
import { Col, Row, Select, Button } from 'antd';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    EnvironmentOutlined,
    SearchOutlined,
    CloseOutlined,
    ThunderboltOutlined,
    ApartmentOutlined,
    RocketOutlined,
    FireOutlined,
    TeamOutlined,
    TrophyOutlined,
    CodeOutlined,
} from '@ant-design/icons';
import { LOCATION_LIST } from '@/config/utils';
import { callFetchAllSkill } from '@/config/api';
import layoutStyles from 'styles/client.module.scss';
import styles from './index.module.scss';
import ThreeBackground from '@/components/client/ThreeBackground';

const LEVEL_OPTIONS = [
    { label: 'Intern', value: 'INTERN' },
    { label: 'Fresher', value: 'FRESHER' },
    { label: 'Junior', value: 'JUNIOR' },
    { label: 'Middle', value: 'MIDDLE' },
    { label: 'Senior', value: 'SENIOR' },
];

const getLocationLabel = (v: string) =>
    LOCATION_LIST.find(l => l.value === v)?.label ?? v;

const DASHBOARD_CARDS = [
    { icon: <FireOutlined />, iconClass: 'blue', colorClass: 'color-blue', value: '2,847', label: 'Active Jobs', trend: '+12%', trendClass: 'up' },
    { icon: <TeamOutlined />, iconClass: 'purple', colorClass: 'color-purple', value: '384', label: 'IT Companies', trend: '+8%', trendClass: 'up' },
    { icon: <RocketOutlined />, iconClass: 'green', colorClass: 'color-green', value: '91%', label: 'Placement Rate', trend: '+3%', trendClass: 'up' },
    { icon: <TrophyOutlined />, iconClass: 'pink', colorClass: 'color-pink', value: '₫35M', label: 'Avg Senior Salary', trend: '+15%', trendClass: 'up' },
];

const ClientJobPage = () => {
    const [selectedJob, setSelectedJob] = useState<IJob | undefined>();
    const [total, setTotal] = useState<number | null>(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [skillOptions, setSkillOptions] = useState<{ label: string; value: string }[]>([]);
    useEffect(() => {
        callFetchAllSkill('page=1&size=100&sort=createdAt,desc').then((res: any) => {
            const list: any[] = res?.data?.result ?? [];
            setSkillOptions(list.map(s => ({ label: s.name as string, value: String(s.id) })));
        });
    }, []);

    const [localLocation, setLocalLocation] = useState<string[]>([]);
    const [localSkills, setLocalSkills] = useState<string[]>([]);
    const [localLevel, setLocalLevel] = useState<string | null>(null);

    useEffect(() => {
        const loc = searchParams.get('location');
        const sk = searchParams.get('skills');
        const lv = searchParams.get('level');
        if (loc) setLocalLocation(loc.split(','));
        if (sk) setLocalSkills(sk.split(','));
        if (lv) setLocalLevel(lv);
    }, []);

    const applySearch = () => {
        const params = new URLSearchParams();
        if (localLocation.length) params.set('location', localLocation.join(','));
        if (localSkills.length) params.set('skills', localSkills.join(','));
        if (localLevel) params.set('level', localLevel);
        const qs = params.toString();
        navigate(qs ? `/job?${qs}` : '/job');
    };

    const clearAll = () => {
        setLocalLocation([]);
        setLocalSkills([]);
        setLocalLevel(null);
        navigate('/job');
    };

    const urlLocation = searchParams.get('location');
    const urlLevel = searchParams.get('level');
    const hasFilters = !!(urlLocation || searchParams.get('skills') || urlLevel || searchParams.get('companyIds'));

    const handleTotalChange = useCallback((n: number) => setTotal(n), []);

    const buildHeading = () => {
        if (total === null) return '';
        const urlSkills = searchParams.get('skills');
        const skillLabels = urlSkills
            ? urlSkills.split(',').map(id => skillOptions.find(s => s.value === id)?.label ?? id).join(', ')
            : '';
        const locLabels = urlLocation
            ? urlLocation.split(',').map(getLocationLabel).join(', ')
            : '';
        const lvl = urlLevel ? ` • ${urlLevel}` : '';

        if (skillLabels && locLabels) return `${skillLabels} jobs in ${locLabels}${lvl}`;
        if (skillLabels) return `${skillLabels} jobs${lvl}`;
        if (locLabels) return `jobs in ${locLabels}${lvl}`;
        return `IT jobs${lvl}`;
    };

    return (
        <div className={styles.page}>

            {/* ═══ Hero với canvas 3D nền ═══ */}
            <div className={styles.hero}>
                {/* Canvas 3D background */}
                <ThreeBackground />

                <div className={layoutStyles['container']}>
                    <div className={styles.heroInner}>

                        {/* Left */}
                        <div className={styles.heroCopy}>
                            <div className={styles.heroKicker}>
                                <ApartmentOutlined /> IT JOB DASHBOARD
                            </div>

                            <h1 className={styles.heroTitle}>
                                Find the perfect<br />IT job for you
                            </h1>

                            <p className={styles.heroSub}>
                                Hàng nghìn cơ hội từ các công ty tech hàng đầu Việt Nam.
                                Khám phá, lọc và ứng tuyển ngay hôm nay.
                            </p>

                            <div className={styles.statsRow}>
                                <div className={styles.statCard}>
                                    <div className={styles.statIcon}>🚀</div>
                                    <div className={styles.statN}>500+</div>
                                    <div className={styles.statL}>Active Jobs</div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statIcon}>🏢</div>
                                    <div className={styles.statN}>150+</div>
                                    <div className={styles.statL}>IT Companies</div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statIcon}>⚡</div>
                                    <div className={styles.statN}>Daily</div>
                                    <div className={styles.statL}>New Updates</div>
                                </div>
                            </div>
                        </div>

                        {/* Right — search card */}
                        <div className={styles.searchCard}>
                            <div className={styles.searchCardTitle}>
                                <SearchOutlined /> Search jobs now
                            </div>

                            <Select
                                mode="multiple"
                                allowClear
                                placeholder={<><EnvironmentOutlined /> Location...</>}
                                options={LOCATION_LIST}
                                value={localLocation}
                                onChange={setLocalLocation}
                                className={styles.searchSelect}
                                maxTagCount="responsive"
                                suffixIcon={<EnvironmentOutlined style={{ color: '#64748b' }} />}
                            />

                            <Select
                                mode="multiple"
                                allowClear
                                showSearch
                                placeholder={<><CodeOutlined /> Skills (Java, React...)</>}
                                options={skillOptions}
                                value={localSkills}
                                onChange={setLocalSkills}
                                className={styles.searchSelect}
                                maxTagCount="responsive"
                                filterOption={(input, option) =>
                                    (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                                }
                                suffixIcon={null}
                            />

                            <div className={styles.levelRow}>
                                <span className={styles.levelLabel}>
                                    <ThunderboltOutlined /> Level
                                </span>
                                <div className={styles.pills}>
                                    {LEVEL_OPTIONS.map(lv => (
                                        <button
                                            key={lv.value}
                                            className={`${styles.pill} ${localLevel === lv.value ? styles.pillOn : ''}`}
                                            onClick={() => setLocalLevel(localLevel === lv.value ? null : lv.value)}
                                            type="button"
                                        >
                                            {lv.label}
                                            {localLevel === lv.value && <CloseOutlined style={{ fontSize: 9, marginLeft: 3 }} />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.actionRow}>
                                <Button
                                    type="primary"
                                    icon={<SearchOutlined />}
                                    className={styles.searchBtn}
                                    onClick={applySearch}
                                    block
                                >
                                    Tìm kiếm
                                </Button>
                                {(localLocation.length || localSkills.length || localLevel) && (
                                    <button className={styles.clearBtn} onClick={clearAll} type="button">
                                        <CloseOutlined /> Clear
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ KPI Dashboard Bar ═══ */}
            <div className={styles.dashboardBar}>
                <div className={layoutStyles['container']}>
                    <div className={styles.dashboardGrid}>
                        {DASHBOARD_CARDS.map((card, i) => (
                            <div key={i} className={styles.dashCard}>
                                <div className={`${styles.dashCardIcon} ${styles[card.iconClass]}`}>
                                    {card.icon}
                                </div>
                                <div className={styles.dashCardInfo}>
                                    <div className={styles.dashCardVal}>{card.value}</div>
                                    <div className={styles.dashCardLabel}>{card.label}</div>
                                </div>
                                <div className={`${styles.dashCardTrend} ${styles[card.trendClass]}`}>
                                    {card.trend}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══ Main Content ═══ */}
            <div className={`${layoutStyles['container']} ${styles.main}`}>
                <div className={styles.resultRow}>
                    <h2 className={styles.resultHeading}>
                        {total !== null && <span>{total.toLocaleString()} </span>}
                        {buildHeading()}
                    </h2>
                    {hasFilters && (
                        <button className={styles.resetLink} onClick={clearAll} type="button">
                            View all →
                        </button>
                    )}
                </div>

                <Row gutter={[20, 0]} style={{ alignItems: 'flex-start' }}>
                    <Col span={24} md={10}>
                        <JobListCompact
                            onSelectJob={setSelectedJob}
                            selectedJobId={selectedJob?.id}
                            onTotalChange={handleTotalChange}
                        />
                    </Col>
                    <Col span={24} md={14} className={styles.colRight}>
                        <div className={styles.detailPanel}>
                            <JobDetailPanel job={selectedJob} />
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default ClientJobPage;
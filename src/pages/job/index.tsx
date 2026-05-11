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
} from '@ant-design/icons';
import { LOCATION_LIST } from '@/config/utils';
import { callFetchAllSkill } from '@/config/api';
import layoutStyles from 'styles/client.module.scss';
import styles from './index.module.scss';

const LEVEL_OPTIONS = [
    { label: 'Intern',   value: 'INTERN'   },
    { label: 'Fresher',  value: 'FRESHER'  },
    { label: 'Junior',   value: 'JUNIOR'   },
    { label: 'Middle',   value: 'MIDDLE'   },
    { label: 'Senior',   value: 'SENIOR'   },
];

const getLocationLabel = (v: string) =>
    LOCATION_LIST.find(l => l.value === v)?.label ?? v;

const ClientJobPage = () => {
    const [selectedJob, setSelectedJob]   = useState<IJob | undefined>();
    const [total, setTotal]               = useState<number | null>(null);
    const [searchParams]                  = useSearchParams();
    const navigate                        = useNavigate();

    /* ── Skill options from API ── */
    const [skillOptions, setSkillOptions] = useState<{ label: string; value: string }[]>([]);
    useEffect(() => {
        callFetchAllSkill('page=1&size=100&sort=createdAt,desc').then((res: any) => {
            const list: any[] = res?.data?.result ?? [];
            setSkillOptions(list.map(s => ({
                label: s.name as string,
                value: String(s.id),
            })));
        });
    }, []);

    /* ── Local form state (not bound to URL directly) ── */
    const [localLocation, setLocalLocation] = useState<string[]>([]);
    const [localSkills,   setLocalSkills]   = useState<string[]>([]);
    const [localLevel,    setLocalLevel]    = useState<string | null>(null);

    /* Initialise from URL on first load */
    useEffect(() => {
        const loc = searchParams.get('location');
        const sk  = searchParams.get('skills');
        const lv  = searchParams.get('level');
        if (loc) setLocalLocation(loc.split(','));
        if (sk)  setLocalSkills(sk.split(','));
        if (lv)  setLocalLevel(lv);
    }, []); // run once on mount

    /* ── Apply = navigate with all collected params ── */
    const applySearch = () => {
        const params = new URLSearchParams();
        if (localLocation.length) params.set('location', localLocation.join(','));
        if (localSkills.length)   params.set('skills', localSkills.join(','));
        if (localLevel)           params.set('level', localLevel);
        const qs = params.toString();
        navigate(qs ? `/job?${qs}` : '/job');
    };

    const clearAll = () => {
        setLocalLocation([]);
        setLocalSkills([]);
        setLocalLevel(null);
        navigate('/job');
    };

    /* Active URL params (for result heading + "Xem tất cả" link) */
    const urlLocation = searchParams.get('location');
    const urlLevel    = searchParams.get('level');
    const hasFilters  = !!(urlLocation || searchParams.get('skills') || urlLevel || searchParams.get('companyIds'));

    const handleTotalChange = useCallback((n: number) => setTotal(n), []);

    const buildHeading = () => {
        if (total === null) return 'Đang tải...';

        const urlSkills = searchParams.get('skills');

        // Map skill IDs → labels (e.g. "1,3" → "Java, Spring Boot")
        const skillLabels = urlSkills
            ? urlSkills.split(',')
                .map(id => skillOptions.find(s => s.value === id)?.label ?? id)
                .join(', ')
            : '';

        // Map location values → labels
        const locLabels = urlLocation
            ? urlLocation.split(',').map(getLocationLabel).join(', ')
            : '';

        const lvl = urlLevel ? ` • ${urlLevel}` : '';

        // Build human-readable heading
        if (skillLabels && locLabels) {
            return `${total.toLocaleString()} việc làm ${skillLabels} tại ${locLabels}${lvl}`;
        }
        if (skillLabels) {
            return `${total.toLocaleString()} việc làm ${skillLabels}${lvl}`;
        }
        if (locLabels) {
            return `${total.toLocaleString()} việc làm tại ${locLabels}${lvl}`;
        }
        return `${total.toLocaleString()} việc làm IT${lvl}`;
    };


    return (
        <div className={styles.page}>

            {/* ════ Hero Banner ════ */}
            <div className={styles.hero}>
                <div className={layoutStyles['container']}>
                    <div className={styles.heroInner}>

                        {/* Left copy */}
                        <div className={styles.heroCopy}>
                            <div className={styles.heroKicker}>
                                <ApartmentOutlined /> IT JOB BOARD
                            </div>
                            <h1 className={styles.heroTitle}>
                                Khám phá việc làm<br />IT phù hợp với bạn
                            </h1>
                            <p className={styles.heroSub}>
                                Hàng trăm cơ hội từ các công ty công nghệ hàng đầu Việt Nam.
                            </p>
                            <div className={styles.statsRow}>
                                <div className={styles.statChip}>
                                    <span className={styles.statN}>500+</span>
                                    <span className={styles.statL}>Việc làm</span>
                                </div>
                                <div className={styles.statDot} />
                                <div className={styles.statChip}>
                                    <span className={styles.statN}>150+</span>
                                    <span className={styles.statL}>Công ty IT</span>
                                </div>
                                <div className={styles.statDot} />
                                <div className={styles.statChip}>
                                    <span className={styles.statN}>Mỗi ngày</span>
                                    <span className={styles.statL}>Cập nhật mới</span>
                                </div>
                            </div>
                        </div>

                        {/* Right search card — collect all, then search */}
                        <div className={styles.searchCard}>
                            <div className={styles.searchCardTitle}>
                                <SearchOutlined /> Tìm việc ngay
                            </div>

                            {/* Location */}
                            <Select
                                mode="multiple"
                                allowClear
                                placeholder={<><EnvironmentOutlined /> Địa điểm...</>}
                                options={LOCATION_LIST}
                                value={localLocation}
                                onChange={setLocalLocation}
                                className={styles.searchSelect}
                                maxTagCount="responsive"
                                suffixIcon={<EnvironmentOutlined style={{ color: '#9ca3af' }} />}
                            />

                            {/* Skills — multi-select dropdown */}
                            <Select
                                mode="multiple"
                                allowClear
                                showSearch
                                placeholder={<><SearchOutlined /> Kỹ năng (Java, React...)</>}
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

                            {/* Level pills */}
                            <div className={styles.levelRow}>
                                <span className={styles.levelLabel}>
                                    <ThunderboltOutlined /> Cấp bậc
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

                            {/* Action buttons */}
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
                                        <CloseOutlined /> Xóa
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ════ Main Content ════ */}
            <div className={`${layoutStyles['container']} ${styles.main}`}>

                <div className={styles.resultRow}>
                    <h2 className={styles.resultHeading}>{buildHeading()}</h2>
                    {hasFilters && (
                        <button className={styles.resetLink} onClick={clearAll} type="button">
                            Xem tất cả →
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
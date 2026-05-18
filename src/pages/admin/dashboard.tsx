import { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Table, Tag, Spin, message } from "antd";
import {
    UserOutlined,
    RocketOutlined,
    BankOutlined,
    FileTextOutlined,
    AppstoreOutlined,
    FireOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
} from "@ant-design/icons";
import CountUp from 'react-countup';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { callFetchDashboard } from "@/config/api";
import { IDashboardStats } from "@/types/backend";
import styles from 'styles/admin.module.scss';

const RESUME_COLORS: Record<string, string> = {
    PENDING: '#faad14',
    REVIEWING: '#1890ff',
    APPROVED: '#52c41a',
    REJECTED: '#ff4d4f',
};

const RESUME_LABELS: Record<string, string> = {
    PENDING: 'Pending',
    REVIEWING: 'Reviewing',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
};

const SKILL_COLORS = ['#4078ff', '#36cfc9', '#f5794d', '#9254de', '#faad14', '#ff85c0'];

const DashboardPage = () => {
    const [stats, setStats] = useState<IDashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await callFetchDashboard();
                if (res?.data) {
                    setStats(res.data as any);
                }
            } catch (err) {
                message.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatter = (value: number | string) => (
        <CountUp end={Number(value)} separator="," duration={1.5} />
    );

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <Spin size="large" tip="Loading data..." />
            </div>
        );
    }

    if (!stats) {
        return <div>No data available</div>;
    }

    // Prepare chart data
    const resumePieData = stats.resumeByStatus
        ? Object.entries(stats.resumeByStatus)
            .filter(([_, v]) => v > 0)
            .map(([key, value]) => ({
                name: RESUME_LABELS[key] || key,
                value,
                status: key,
            }))
        : [];

    const skillBarData = stats.topSkills
        ? stats.topSkills.map((s, i) => ({
            name: s.name,
            count: s.count,
            fill: SKILL_COLORS[i % SKILL_COLORS.length],
        }))
        : [];

    // Table columns for recent jobs
    const jobColumns = [
        {
            title: 'Position',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
            render: (text: string) => <span style={{ fontWeight: 600 }}>{text}</span>,
        },
        {
            title: 'Company',
            dataIndex: 'companyName',
            key: 'companyName',
            ellipsis: true,
        },
        {
            title: 'Location',
            dataIndex: 'location',
            key: 'location',
            ellipsis: true,
        },
        {
            title: 'Salary',
            dataIndex: 'salary',
            key: 'salary',
            render: (salary: number) => salary ? `${(salary / 1_000_000).toFixed(0)}M` : 'N/A',
        },
        {
            title: 'Level',
            dataIndex: 'level',
            key: 'level',
            render: (level: string) => {
                const colorMap: Record<string, string> = {
                    INTERN: 'cyan', JUNIOR: 'blue', MIDDLE: 'geekblue', SENIOR: 'purple',
                };
                return <Tag color={colorMap[level] || 'default'}>{level}</Tag>;
            },
        },
        {
            title: 'Status',
            dataIndex: 'active',
            key: 'active',
            render: (active: boolean) => active
                ? <Tag color="success" icon={<CheckCircleOutlined />}>Active</Tag>
                : <Tag color="default">Inactive</Tag>,
        },
    ];

    const kpiCards = [
        {
            title: 'TOTAL USERS',
            value: stats.totalUsers,
            icon: <UserOutlined />,
            color: '#e53935',
            bgGradient: 'linear-gradient(135deg, #e53935 0%, #ef9a9a 100%)',
        },
        {
            title: 'ACTIVE JOBS',
            value: stats.totalActiveJobs,
            icon: <RocketOutlined />,
            color: '#52c41a',
            bgGradient: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
            suffix: ` / ${stats.totalJobs}`,
        },
        {
            title: 'COMPANIES',
            value: stats.totalCompanies,
            icon: <BankOutlined />,
            color: '#722ed1',
            bgGradient: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
        },
        {
            title: 'APPLICATIONS',
            value: stats.totalResumes,
            icon: <FileTextOutlined />,
            color: '#fa8c16',
            bgGradient: 'linear-gradient(135deg, #fa8c16 0%, #ffa940 100%)',
        },
    ];

    return (
        <div>
            {/* Title Card */}
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col span={24}>
                    <Card className={styles["admin-title-card"]}>
                        <Row gutter={20} align="middle">
                            <Col xs={24} sm="auto">
                                <div className={styles["card-icon"]}>
                                    <AppstoreOutlined />
                                </div>
                            </Col>
                            <Col xs={24} sm="auto" flex={1}>
                                <div>
                                    <h2 className={styles["card-title"]}>Admin Dashboard</h2>
                                    <p className={styles["card-subtitle"]}>System overview — real-time data from the database.</p>
                                </div>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>

            {/* KPI Cards */}
            <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
                {kpiCards.map((kpi, idx) => (
                    <Col xs={24} sm={12} lg={6} key={idx}>
                        <Card
                            className={styles["dashboard-kpi-card"]}
                            bordered={false}
                        >
                            <div className={styles["kpi-icon-wrapper"]} style={{ background: kpi.bgGradient }}>
                                {kpi.icon}
                            </div>
                            <Statistic
                                title={kpi.title}
                                value={kpi.value}
                                formatter={formatter}
                                valueStyle={{ color: kpi.color, fontSize: 28, fontWeight: 700 }}
                                suffix={kpi.suffix && <span style={{ fontSize: 16, color: '#8c8c8c', fontWeight: 400 }}>{kpi.suffix}</span>}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Charts Row */}
            <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
                {/* Resume Pie Chart */}
                <Col xs={24} lg={10}>
                    <Card
                        title={
                            <span>
                                <FileTextOutlined style={{ marginRight: 8, color: '#e53935' }} />
                                Resume by Status
                            </span>
                        }
                        className={styles["dashboard-chart-card"]}
                        bordered={false}
                    >
                        {resumePieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={resumePieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={4}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                    >
                                        {resumePieData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={RESUME_COLORS[entry.status] || '#8884d8'}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: any) => [`${value} resumes`, '']}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ textAlign: 'center', padding: 60, color: '#8c8c8c' }}>
                                No resumes yet
                            </div>
                        )}
                    </Card>
                </Col>

                {/* Top Skills Bar Chart */}
                <Col xs={24} lg={14}>
                    <Card
                        title={
                            <span>
                                <FireOutlined style={{ marginRight: 8, color: '#f5794d' }} />
                                Top Most Required Skills
                            </span>
                        }
                        className={styles["dashboard-chart-card"]}
                        bordered={false}
                    >
                        {skillBarData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={skillBarData} layout="vertical" margin={{ left: 20, right: 30 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis type="number" allowDecimals={false} />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        width={120}
                                        tick={{ fontSize: 13, fontWeight: 500 }}
                                    />
                                    <Tooltip
                                        formatter={(value: any) => [`${value} jobs`, 'Count']}
                                    />
                                    <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={28}>
                                        {skillBarData.map((entry, index) => (
                                            <Cell key={`bar-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ textAlign: 'center', padding: 60, color: '#8c8c8c' }}>
                                No skill data yet
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Recent Jobs Table */}
            <Row>
                <Col span={24}>
                    <Card
                        title={
                            <span>
                                <ClockCircleOutlined style={{ marginRight: 8, color: '#e53935' }} />
                                Latest Jobs
                            </span>
                        }
                        className={styles["dashboard-chart-card"]}
                        bordered={false}
                    >
                        <Table
                            columns={jobColumns}
                            dataSource={stats.recentJobs}
                            rowKey="id"
                            pagination={false}
                            size="middle"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardPage;
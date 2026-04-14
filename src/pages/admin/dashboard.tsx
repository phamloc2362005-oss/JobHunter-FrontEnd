import { Card, Col, Row, Statistic } from "antd";
import CountUp from 'react-countup';
import styles from 'styles/admin.module.scss';
import { AppstoreOutlined } from "@ant-design/icons";

const DashboardPage = () => {
    const formatter = (value: number | string) => {
        return (
            <CountUp end={Number(value)} separator="," />
        );
    };

    return (
        <div>
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={16}>
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
                                    <p className={styles["card-subtitle"]}>Tổng quan hệ thống, theo dõi số liệu và truy cập nhanh các chức năng quản trị.</p>
                                </div>
                            </Col>
                        </Row>
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card className={styles["stat-card"]} style={{ borderLeft: '4px solid #4078ff' }}>
                        <Statistic
                            title="TỔNG TRUY CẬP"
                            value={112893}
                            formatter={formatter}
                            prefix={<AppstoreOutlined style={{ marginRight: 8 }} />}
                            valueStyle={{ color: '#4078ff', fontSize: 32, fontWeight: 700 }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[20, 20]}>
                <Col span={24} md={8}>
                    <Card bordered={false}>
                        <Statistic title="Active Users" value={112893} formatter={formatter} />
                    </Card>
                </Col>
                <Col span={24} md={8}>
                    <Card bordered={false}>
                        <Statistic title="Jobs" value={893} formatter={formatter} />
                    </Card>
                </Col>
                <Col span={24} md={8}>
                    <Card bordered={false}>
                        <Statistic title="Companies" value={1240} formatter={formatter} />
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default DashboardPage;
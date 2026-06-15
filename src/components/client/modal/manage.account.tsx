import { Alert, Button, Card, Col, Divider, Form, Modal, Popconfirm, Row, Select, Space, Spin, Switch, Table, Tabs, Tag, Tooltip, Typography, message, notification, Input } from "antd";
import { isMobile } from "react-device-detect";
import type { TabsProps } from 'antd';
import { IExpertise, IJob, IResume, ISubscribers, ISkill, ICvDraft } from "@/types/backend";
import { useState, useEffect, useRef } from 'react';
import { callCreateSubscriber, callFetchAllSkill, callFetchExpertise, callFetchResumeByUser, callGetSubscriberSkills, callUpdateSubscriber, callChangePassword, callUpdateUserRecommendationProfile, callGetUserRecommendationProfile, callFetchFavoriteJobs, callFetchAccount, callUpdateUserProfile, callFetchMyCvDrafts, callDeleteCvDraft } from "@/config/api";
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { BellOutlined, CheckCircleFilled, ExclamationCircleOutlined, MailOutlined, MonitorOutlined, ThunderboltOutlined, SaveOutlined, DeleteOutlined, EyeOutlined, CalendarOutlined, FileTextOutlined, PlusOutlined, PrinterOutlined } from "@ant-design/icons";
import { useAppSelector } from "@/redux/hooks";
import { useNavigate } from "react-router-dom";
import { convertSlug } from "@/config/utils";
import { DebounceSelect } from "../../admin/user/debouce.select";
import { useReactToPrint } from 'react-to-print';
import { CV_TEMPLATES } from '@/pages/cv-builder/cvTemplates';
import styles from '@/pages/my-cvs/index.module.scss';

interface IProps {
    open: boolean;
    onClose: (v: boolean) => void;
}

const UserResume = (props: any) => {
    const [listCV, setListCV] = useState<IResume[]>([]);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [openFeedbackModal, setOpenFeedbackModal] = useState<boolean>(false);
    const [selectedResume, setSelectedResume] = useState<IResume | null>(null);

    useEffect(() => {
        const init = async () => {
            setIsFetching(true);
            const res = await callFetchResumeByUser();
            if (res && res.data) {
                setListCV(res.data.result as IResume[])
            }
            setIsFetching(false);
        }
        init();
    }, [])

    const columns: ColumnsType<IResume> = [
        {
            title: 'No.',
            key: 'index',
            width: 50,
            align: "center",
            render: (text, record, index) => {
                return (
                    <>
                        {(index + 1)}
                    </>)
            }
        },
        {
            title: 'Company',
            dataIndex: ["job", "company", "name"],
            render: (companyName: string, record: any) => {
                // Backend /by-user trả về raw entity: job.company.name
                const name = companyName
                    || record?.job?.company?.name
                    || (record?.companyId && typeof record.companyId === 'object' ? record.companyId.name : null)
                    || record?.companyName;
                return <>{name || '—'}</>;
            },
        },
        {
            title: 'Job title',
            dataIndex: ["job", "name"],

        },
        {
            title: 'Status',
            dataIndex: "status",
        },
        {
            title: 'AI Score',
            dataIndex: 'aiScore',
            align: 'center' as const,
            width: 120,
            render: (text, record) => {
                const score = record.aiScore || 0;
                if (!score) {
                    return (
                        <Tag color="default" style={{ margin: 0, padding: '2px 8px', borderRadius: 4 }}>
                            Analyzing...
                        </Tag>
                    );
                }
                const color = score >= 70 ? 'success' : score >= 50 ? 'warning' : 'error';
                return (
                    <Tag color={color} style={{ margin: 0, padding: '2px 8px', borderRadius: 4, fontWeight: 'bold' }}>
                        {score}% Match
                    </Tag>
                );
            }
        },
        {
            title: 'AI Advice',
            key: 'ai-advice',
            align: 'center' as const,
            width: 120,
            render: (text, record) => {
                return (
                    <Button 
                        type="link" 
                        size="small"
                        icon={<ThunderboltOutlined />}
                        onClick={() => {
                            setSelectedResume(record);
                            setOpenFeedbackModal(true);
                        }}
                    >
                        Review
                    </Button>
                )
            }
        },
        {
            title: 'Date Applied',
            dataIndex: "createdAt",
            render(value, record, index) {
                return (
                    <>{dayjs(record.createdAt).format('DD-MM-YYYY HH:mm:ss')}</>
                )
            },
        },
        {
            title: '',
            dataIndex: "",
            render(value, record, index) {
                return (
                    <a
                        href={`${import.meta.env.VITE_BACKEND_URL}/storage/resume/${record?.url}`}
                        target="_blank"
                    >View</a>
                )
            },
        },
    ];

    return (
        <div>
            <Table<IResume>
                columns={columns}
                dataSource={listCV}
                loading={isFetching}
                pagination={false}
            />

            <Modal
                title={
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <ThunderboltOutlined style={{ color: "#1677ff", fontSize: 20 }} />
                        <span>AI Resume Assistant & Feedback</span>
                    </div>
                }
                open={openFeedbackModal}
                onCancel={() => {
                    setOpenFeedbackModal(false);
                    setSelectedResume(null);
                }}
                footer={[
                    <Button key="close" type="primary" onClick={() => setOpenFeedbackModal(false)}>
                        Got it!
                    </Button>
                ]}
                destroyOnClose
                width={600}
                centered
            >
                {selectedResume && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingTop: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f0f7ff", padding: "16px 20px", borderRadius: 12, border: "1px solid #bae0ff" }}>
                            <div>
                                <div style={{ fontSize: 12, color: "#8c8c8c" }}>Position Applied</div>
                                <div style={{ fontSize: 16, fontWeight: 600, color: "#262626", marginTop: 4 }}>
                                    {selectedResume.jobId && typeof selectedResume.jobId === 'object' ? selectedResume.jobId.name : selectedResume.jobId}
                                </div>
                                <div style={{ fontSize: 13, color: "#595959", marginTop: 2 }}>{selectedResume.companyName}</div>
                            </div>
                            
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 12, color: "#8c8c8c", marginBottom: 4 }}>Match Score</div>
                                <div style={{ 
                                    fontSize: 28, 
                                    fontWeight: 700, 
                                    color: (selectedResume.aiScore || 0) >= 70 ? "#52c41a" : (selectedResume.aiScore || 0) >= 50 ? "#faad14" : "#ff4d4f"
                                }}>
                                    {selectedResume.aiScore ? `${selectedResume.aiScore}%` : "—"}
                                </div>
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: 15, fontWeight: 600, color: "#262626", marginBottom: 8 }}>
                                💡 AI Analysis & Suggestions
                            </div>
                            <div style={{ 
                                whiteSpace: 'pre-wrap', 
                                backgroundColor: '#f9f9f9', 
                                padding: '16px', 
                                borderRadius: '12px', 
                                border: '1px solid #f0f0f0',
                                color: '#434343',
                                fontSize: 14,
                                lineHeight: '1.6'
                            }}>
                                {selectedResume.aiFeedback || "Our AI is currently analyzing your resume for this position. Please check back in a few moments!"}
                            </div>
                        </div>

                        <Alert
                            message="How to use this feedback?"
                            description="You can use these tailored suggestions to edit your profile and optimize your CV in our CV Builder tab to increase your matching score next time!"
                            type="info"
                            showIcon
                        />
                    </div>
                )}
            </Modal>
        </div>
    )
}

const UserUpdateInfo = ({ open }: { open: boolean }) => {
    const [form] = Form.useForm();
    const user = useAppSelector(state => state.account.user);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [allSkills, setAllSkills] = useState<any[]>([]);
    const [allExpertises, setAllExpertises] = useState<any[]>([]);


    const levelOptions = [
        { label: "Intern", value: "INTERN" },
        { label: "Junior - Fresher", value: "JUNIOR" },
        { label: "Middle - Experienced", value: "MIDDLE" },
        { label: "Senior", value: "SENIOR" },
    ];



    const fetchSkillList = async (name: string): Promise<any[]> => {
        if (name === "" && allSkills.length > 0) {
            return allSkills;
        }
        const res = await callFetchAllSkill(`page=1&size=100&name ~ '${name}'`);
        const result = res?.data?.result?.map((item: ISkill) => ({
            label: item.name ?? "",
            value: String(item.id),
        })) ?? [];
        if (name === "") {
            setAllSkills(result);
        }
        return result;
    };

    const fetchExpertiseList = async (name: string): Promise<any[]> => {
        if (name === "" && allExpertises.length > 0) {
            return allExpertises;
        }
        const res = await callFetchExpertise(`page=1&size=100&name ~ '${name}'`);
        const result = res?.data?.result?.map((item: IExpertise) => ({
            label: item.name ?? "",
            value: String(item.id),
        })) ?? [];
        if (name === "") {
            setAllExpertises(result);
        }
        return result;
    };

    const loadData = async () => {
        setIsSubmitting(true);
        try {
            const [accRes, profileRes] = await Promise.all([
                callFetchAccount(),
                callGetUserRecommendationProfile(),
                fetchSkillList(""),
                fetchExpertiseList("")
            ]);

            const formData: any = {};

            if (accRes.data) {
                const userData = (accRes.data as any).user;
                formData.name = userData.name;
                formData.email = userData.email;
                formData.age = userData.age;
                formData.gender = userData.gender;
                formData.address = userData.address;
            }

            if (profileRes.data) {
                const profile = profileRes.data;

                // 1. Handle Skills
                let skillsData: any[] = [];
                if (profile.skillDetails && profile.skillDetails.length > 0) {
                    skillsData = profile.skillDetails.map((item: any) => ({
                        label: item.label,
                        value: String(item.value)
                    }));
                } else if (profile.skillIds && profile.skillIds.length > 0) {
                    // Fallback to IDs if details are missing
                    skillsData = profile.skillIds.map((id: any) => ({
                        label: `Skill ID: ${id}`,
                        value: String(id)
                    }));
                }
                formData.skillIds = skillsData;

                // 2. Handle Level
                formData.level = profile.level;

                // 3. Handle Expertise
                let expertiseData = undefined;
                if (profile.expertiseDetail) {
                    expertiseData = {
                        label: profile.expertiseDetail.label,
                        value: String(profile.expertiseDetail.value)
                    };
                } else if (profile.expertiseId) {
                    // Fallback to ID
                    expertiseData = {
                        label: `Expertise ID: ${profile.expertiseId}`,
                        value: String(profile.expertiseId)
                    };
                }
                formData.expertiseId = expertiseData;
            }

            if (Object.keys(formData).length > 0) {
                // Use setTimeout to ensure form is ready and prevent rendering race conditions
                setTimeout(() => {
                    form.setFieldsValue(formData);
                }, 0);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (open) {
            loadData();
        }
    }, [open]);

    const onFinish = async (values: any) => {
        setIsSubmitting(true);

        // 1. Update basic info
        const userUpdateRes = await callUpdateUserProfile({
            id: user.id,
            name: values.name,
            age: values.age,
            gender: values.gender,
            address: values.address,
            email: values.email
        } as any);

        // 2. Update recommendation profile
        const skillIds = values.skillIds?.map((item: any) =>
            typeof item === 'object' ? Number(item.value) : Number(item)
        ) ?? [];
        const expertiseId = values.expertiseId ?
            (typeof values.expertiseId === 'object' ? Number(values.expertiseId.value) : Number(values.expertiseId))
            : null;

        const profileRes = await callUpdateUserRecommendationProfile({
            skillIds,
            level: values.level,
            expertiseId,
        });

        setIsSubmitting(false);

        if (userUpdateRes.data && profileRes?.statusCode === 200) {
            message.success("Personal information updated successfully.");
            await loadData();
            return;
        }

        notification.error({
            message: "An error occurred",
            description: "Could not update personal information",
        });
    };

    return (
        <div style={{ display: "grid", gap: 16 }}>
            <Card
                bodyStyle={{ padding: 18 }}
                style={{ borderRadius: 18, border: "1px solid rgba(22, 119, 255, 0.12)", background: "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)" }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
                    <div>
                        <Typography.Title level={4} style={{ margin: 0 }}>Job Recommendation Profile</Typography.Title>
                        <Typography.Paragraph style={{ margin: "8px 0 0", color: "#64748b" }}>
                            Update these criteria to help the system suggest jobs that fit you better.
                        </Typography.Paragraph>
                    </div>
                    <Tag color="geekblue" icon={<ThunderboltOutlined />}>Hello {user?.name || "there"}</Tag>
                </div>

                <Alert
                    showIcon
                    type="info"
                    icon={<ExclamationCircleOutlined />}
                    style={{ marginTop: 16, marginBottom: 18 }}
                    message="Tip"
                    description="Choosing the right skills, level, and expertise helps match jobs closer to your profile."
                />

                <Form
                    layout="vertical"
                    form={form}
                    onFinish={onFinish}
                    initialValues={{
                        skillIds: [],
                        level: undefined,
                        expertiseId: undefined,
                        gender: 'OTHER'
                    }}
                >
                    <Row gutter={[16, 8]}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Email"
                                name="email"
                            >
                                <Input disabled />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Full Name"
                                name="name"
                                rules={[{ required: true, message: "Please enter your full name" }]}
                            >
                                <Input placeholder="Enter your full name" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item
                                label="Age"
                                name="age"
                                rules={[{ required: true, message: "Please enter your age" }]}
                            >
                                <Input type="number" placeholder="Enter age" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item
                                label="Gender"
                                name="gender"
                                rules={[{ required: true, message: "Please select gender" }]}
                            >
                                <Select
                                    options={[
                                        { label: "Male", value: "MALE" },
                                        { label: "Female", value: "FEMALE" },
                                        { label: "Other", value: "OTHER" },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item
                                label="Address"
                                name="address"
                                rules={[{ required: true, message: "Please enter your address" }]}
                            >
                                <Input placeholder="Enter address" />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Divider orientation="left" style={{ margin: "12px 0" }}>Professional Profile</Divider>
                        </Col>

                        <Col xs={24}>
                            <Form.Item
                                label="Skills"
                                name="skillIds"
                                rules={[{ required: true, message: "Please select at least 1 skill" }]}
                            >
                                <DebounceSelect
                                    mode="multiple"
                                    allowClear
                                    showSearch
                                    placeholder="Select your skills"
                                    fetchOptions={fetchSkillList}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Level"
                                name="level"
                                rules={[{ required: true, message: "Please select your level" }]}
                            >
                                <Select
                                    allowClear
                                    placeholder="Select experience level"
                                    options={levelOptions}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Expertise"
                                name="expertiseId"
                            >
                                <DebounceSelect
                                    allowClear
                                    showSearch
                                    placeholder="Select primary expertise"
                                    fetchOptions={fetchExpertiseList}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Divider style={{ margin: "4px 0 12px" }} />
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                                <Typography.Text type="secondary">
                                    This data is used exclusively for our recommendation engine.
                                </Typography.Text>
                                <Button type="primary" htmlType="submit" loading={isSubmitting}>
                                    Update Profile
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Form>
            </Card>
        </div>
    );
}

const JobByEmail = (props: any) => {
    const [form] = Form.useForm();
    const user = useAppSelector(state => state.account.user);
    const [skills, setSkills] = useState<{ label: string; value: string }[]>([]);
    const [subscriber, setSubscriber] = useState<ISubscribers | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);

    const fetchSkillList = async (name: string): Promise<any[]> => {
        const res = await callFetchAllSkill(`page=1&size=100&name ~ '${name}'`);
        return res?.data?.result?.map((item: ISkill) => ({
            label: item.name ?? "",
            value: String(item.id),
        })) ?? [];
    };

    useEffect(() => {
        const init = async () => {
            const res = await callGetSubscriberSkills();
            if (res && res.data) {
                setSubscriber(res.data);
                setIsSubscribed(true);
                const d = res.data.skills;
                const arr = d.map((item: any) => ({
                    label: item.name as string,
                    value: item.id + "" as string
                }));
                setSkills(arr);
                form.setFieldValue("skills", arr);
            }
        }
        init();
    }, [])

    const onFinish = async (values: any) => {
        setIsSubmitting(true);
        const { skills } = values;

        const arr = skills?.map((item: any) => {
            if (item?.id) return { id: item.id };
            return { id: item.value ?? item };
        });

        if (!subscriber?.id) {
            const data = { email: user.email, name: user.name, skills: arr };
            const res = await callCreateSubscriber(data);
            if (res.data) {
                message.success("✅ Subscribed! You'll receive job alerts matching your skills.");
                setSubscriber(res.data);
                setIsSubscribed(true);
            } else {
                notification.error({ message: 'An error occurred', description: res.message });
            }
        } else {
            const res = await callUpdateSubscriber({ id: subscriber?.id, skills: arr });
            if (res.data) {
                message.success("✅ Job alert preferences updated!");
                setSubscriber(res.data);
            } else {
                notification.error({ message: 'An error occurred', description: res.message });
            }
        }
        setIsSubmitting(false);
    };

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            {/* Header Card */}
            <Card
                bodyStyle={{ padding: 0, overflow: 'hidden' }}
                style={{ borderRadius: 18, border: 'none', boxShadow: '0 4px 24px rgba(22,119,255,0.10)' }}
            >
                {/* Gradient Banner */}
                <div style={{
                    background: 'linear-gradient(135deg, #1677ff 0%, #0050b3 100%)',
                    padding: '28px 32px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 20,
                }}>
                    <div style={{
                        width: 56, height: 56,
                        background: 'rgba(255,255,255,0.18)',
                        borderRadius: 16,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(8px)',
                        flexShrink: 0,
                    }}>
                        <BellOutlined style={{ fontSize: 28, color: '#fff' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <Typography.Title level={4} style={{ margin: 0, color: '#fff', fontWeight: 700 }}>
                            Job Alert by Email
                        </Typography.Title>
                        <Typography.Text style={{ color: 'rgba(255,255,255,0.82)', fontSize: 14 }}>
                            Get notified instantly when a new job matches your skills.
                        </Typography.Text>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                        <Switch
                            checked={isSubscribed}
                            onChange={(checked) => setIsSubscribed(checked)}
                            style={isSubscribed ? { backgroundColor: '#52c41a' } : {}}
                        />
                        <span style={{ fontSize: 12, color: isSubscribed ? '#b7eb8f' : 'rgba(255,255,255,0.6)' }}>
                            {isSubscribed ? 'Active' : 'Off'}
                        </span>
                    </div>
                </div>

                {/* Status Bar */}
                {isSubscribed && (
                    <div style={{
                        background: '#f6ffed',
                        borderTop: '1px solid #b7eb8f',
                        padding: '10px 32px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                    }}>
                        <CheckCircleFilled style={{ color: '#52c41a', fontSize: 15 }} />
                        <Typography.Text style={{ color: '#389e0d', fontSize: 13, fontWeight: 500 }}>
                            You are subscribed · Emails will be sent to <strong>{user.email}</strong>
                        </Typography.Text>
                    </div>
                )}
            </Card>

            {/* Skill Selector Card */}
            <Card
                bodyStyle={{ padding: '24px 28px' }}
                style={{ borderRadius: 18, border: '1px solid rgba(22,119,255,0.12)', background: 'linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div style={{
                        width: 36, height: 36,
                        background: '#e6f4ff',
                        borderRadius: 10,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <MailOutlined style={{ color: '#1677ff', fontSize: 17 }} />
                    </div>
                    <div>
                        <Typography.Title level={5} style={{ margin: 0 }}>Alert Preferences</Typography.Title>
                        <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                            Choose skills you want to receive job alerts for.
                        </Typography.Text>
                    </div>
                </div>

                <Alert
                    type="info"
                    showIcon
                    icon={<ExclamationCircleOutlined />}
                    message="How it works"
                    description="When admin creates a new job matching any of your selected skills, you'll receive an email notification automatically."
                    style={{ marginBottom: 20, borderRadius: 10 }}
                />

                <Form onFinish={onFinish} form={form} layout="vertical">
                    <Form.Item
                        label={<span style={{ fontWeight: 600 }}>Skills to watch</span>}
                        name="skills"
                        rules={[{ required: true, message: 'Please select at least 1 skill!' }]}
                    >
                        <DebounceSelect
                            mode="multiple"
                            allowClear
                            showSearch
                            placeholder="e.g. Java, React, Node.js..."
                            fetchOptions={fetchSkillList}
                            value={skills}
                            onChange={(val: any) => setSkills(val)}
                        />
                    </Form.Item>

                    <Divider style={{ margin: '8px 0 16px' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                        <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                            {subscriber?.id
                                ? `Last updated: ${subscriber.updatedAt ? new Date(subscriber.updatedAt as any).toLocaleDateString('vi-VN') : 'N/A'}`
                                : 'Not subscribed yet — save to activate alerts.'}
                        </Typography.Text>
                        <Space>
                            {subscriber?.id && (
                                <Tag color="success" icon={<CheckCircleFilled />} style={{ padding: '4px 10px', borderRadius: 20 }}>
                                    Subscribed
                                </Tag>
                            )}
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={isSubmitting}
                                icon={<BellOutlined />}
                                style={{
                                    background: 'linear-gradient(135deg, #1677ff, #0050b3)',
                                    border: 'none',
                                    borderRadius: 10,
                                    fontWeight: 600,
                                    height: 40,
                                }}
                            >
                                {subscriber?.id ? 'Update Alerts' : 'Subscribe to Alerts'}
                            </Button>
                        </Space>
                    </div>
                </Form>
            </Card>
        </div>
    );
}

// Cập nhật mật khẩu 
const ChangePasswordTab = (props: any) => {
    const { onClose } = props;
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const onFinish = async (values: any) => {
        setIsLoading(true);
        const res = await callChangePassword(values.currentPassword, values.newPassword);
        setIsLoading(false);

        if (res?.statusCode === 200) {
            message.success("Password changed successfully!");
            form.resetFields();
            onClose(false);
            navigate('/');
        } else {
            notification.error({
                message: "An error occurred",
                description: res?.message || "Could not change password"
            });
        }
    };

    return (
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 480 }}>
            <Form.Item
                label="Current Password"
                name="currentPassword"
                rules={[{ required: true, message: "Please enter your current password" }]}
            >
                <Input.Password placeholder="Enter old password" autoComplete="current-password" />
            </Form.Item>
            <Form.Item
                label="New Password"
                name="newPassword"
                rules={[
                    { required: true, message: "Please enter new password" },
                    { min: 6, message: "Password must be at least 6 characters" },
                ]}
            >
                <Input.Password placeholder="New password" autoComplete="new-password" />
            </Form.Item>
            <Form.Item
                label="Confirm New Password"
                name="confirmPassword"
                dependencies={["newPassword"]}
                rules={[
                    { required: true, message: "Please confirm your new password" },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue("newPassword") === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error("Passwords do not match"));
                        },
                    }),
                ]}
            >
                <Input.Password placeholder="Confirm new password" autoComplete="new-password" />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" loading={isLoading}>
                    Update Password
                </Button>
            </Form.Item>
        </Form>
    );
};

const FavoriteJobsTab = ({ onClose }: { onClose: (v: boolean) => void }) => {
    const [listJob, setListJob] = useState<IJob[]>([]);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        const init = async () => {
            setIsFetching(true);
            const res = await callFetchFavoriteJobs();
            if (res && res.data) {
                setListJob(res.data as IJob[]);
            }
            setIsFetching(false);
        }
        init();
    }, []);

    const columns: ColumnsType<IJob> = [
        {
            title: 'No.',
            key: 'index',
            width: 50,
            align: "center",
            render: (text, record, index) => {
                return (
                    <>
                        {(index + 1)}
                    </>)
            }
        },
        {
            title: 'Job title',
            dataIndex: "name",
        },
        {
            title: 'Company',
            dataIndex: ["company", "name"],
        },
        {
            title: 'Location',
            dataIndex: "location",
        },
        {
            title: 'Last Updated',
            dataIndex: "updatedAt",
            render(value, record) {
                const time = record.updatedAt || record.createdAt;
                return time ? <>{dayjs(time).format('DD-MM-YYYY HH:mm:ss')}</> : <>—</>;
            },
        },
        {
            title: '',
            dataIndex: "",
            render(value, record) {
                const slug = convertSlug(record.name || "job");
                return (
                    <Button
                        type="link"
                        onClick={() => {
                            onClose(false);
                            navigate(`/job/${encodeURIComponent(slug)}?id=${record.id}`);
                        }}
                    >
                        View Details
                    </Button>
                )
            },
        },
    ];

    return (
        <div>
            <Table<IJob>
                columns={columns}
                dataSource={listJob}
                loading={isFetching}
                pagination={false}
                rowKey={(record) => `${record.id}`}
            />
        </div>
    );
};

// Re-use the same CV interfaces from builder
interface IPersonalInfo { dob: string; gender: string; phone: string; email: string; address: string; }
interface ICvSkill { name: string; level: number; }
interface IEducation { timeRange: string; major: string; school: string; desc: string; }
interface IExperience { timeRange: string; title: string; company: string; bullets: string[]; }
interface ICvResult {
    name: string; jobTitle: string; personalInfo: IPersonalInfo;
    careerObjective: string; skills: ICvSkill[]; interests: string[];
    education: IEducation[]; experiences: IExperience[];
}

// ===== Tab CV của tôi =====
const MyCvsTab = ({ onClose }: { onClose: (v: boolean) => void }) => {
    const navigate = useNavigate();
    const [drafts, setDrafts] = useState<ICvDraft[]>([]);
    const [loading, setLoading] = useState(false);

    // Preview modal state
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewDraft, setPreviewDraft] = useState<ICvDraft | null>(null);
    const [previewResult, setPreviewResult] = useState<ICvResult | null>(null);
    const cvRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: cvRef,
        documentTitle: `CV_${previewResult?.name || 'MyCV'}`,
    });

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                // Lấy tối đa 20 CV
                const res: any = await callFetchMyCvDrafts(1, 20);
                if (res?.data) {
                    setDrafts(res.data.result || []);
                }
            } catch { /* empty */ }
            setLoading(false);
        };
        init();
    }, []);

    const handleDelete = async (id: string | number) => {
        try {
            await callDeleteCvDraft(id);
            message.success('Đã xóa CV!');
            setDrafts(prev => prev.filter(d => String(d.id) !== String(id)));
        } catch { message.error('Xóa thất bại!'); }
    };

    const handlePreview = (draft: ICvDraft) => {
        try {
            const parsed = JSON.parse(draft.cvJsonData) as ICvResult;
            setPreviewResult(parsed);
            setPreviewDraft(draft);
            setPreviewOpen(true);
        } catch {
            message.error('Không thể đọc dữ liệu CV!');
        }
    };

    const getTemplate = (templateId: string) => {
        return CV_TEMPLATES.find(t => t.id === templateId) || null;
    };

    const getTemplateVars = (templateId: string): React.CSSProperties => {
        const tpl = getTemplate(templateId);
        if (!tpl) return {};
        return {
            '--sidebar-bg': tpl.colorScheme.sidebar,
            '--accent-color': tpl.colorScheme.accent,
            '--accent-light': tpl.colorScheme.accentLight,
        } as React.CSSProperties;
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spin size="large" /></div>;

    if (drafts.length === 0) return (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <SaveOutlined style={{ fontSize: 48, color: '#c7d2fe', marginBottom: 16 }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: '#475569', margin: 0 }}>Bạn chưa lưu CV nào</p>
            <p style={{ color: '#94a3b8', marginBottom: 16 }}>Tạo CV với AI và nhấn "Lưu CV" để xem lại tại đây</p>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { onClose(false); navigate('/cv-builder'); }}>
                Tạo CV ngay
            </Button>
        </div>
    );

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, padding: '4px 0 16px' }}>
                {drafts.map(draft => (
                    <Card
                        key={draft.id}
                        hoverable
                        bodyStyle={{ padding: 0 }}
                        style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0' }}
                    >
                        {/* Thumbnail */}
                        <div style={{
                            height: 90,
                            background: getTemplate(draft.templateId) ? `linear-gradient(135deg, ${getTemplate(draft.templateId)?.colorScheme.sidebar}, ${getTemplate(draft.templateId)?.colorScheme.accent})` : 'linear-gradient(135deg, #2c3e50, #1abc9c)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
                        }}>
                            <FileTextOutlined style={{ fontSize: 36, color: 'rgba(255,255,255,0.85)' }} />
                            {getTemplate(draft.templateId) && (
                                <div style={{ position: 'absolute', bottom: 6, right: 8, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 4 }}>
                                    {getTemplate(draft.templateId)?.name}
                                </div>
                            )}
                        </div>
                        {/* Info */}
                        <div style={{ padding: '10px 12px 6px' }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 4,
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                title={draft.title}
                            >
                                {draft.title}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#94a3b8' }}>
                                <CalendarOutlined />
                                <span>{formatDate(draft.createdAt)}</span>
                            </div>
                        </div>
                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 6, padding: '6px 12px 10px' }}>
                            <Button
                                size="small" type="primary" icon={<EyeOutlined />}
                                style={{ flex: 1, fontSize: 12, background: 'linear-gradient(135deg,#6c63ff,#0ea5e9)', border: 'none' }}
                                onClick={() => handlePreview(draft)}
                            >
                                Xem lại
                            </Button>
                            <Popconfirm
                                title="Xóa CV này?"
                                onConfirm={() => handleDelete(draft.id!)}
                                okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}
                            >
                                <Button size="small" danger icon={<DeleteOutlined />} />
                            </Popconfirm>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Preview Modal */}
            <Modal
                open={previewOpen}
                onCancel={() => setPreviewOpen(false)}
                width={900}
                footer={[
                    <Button key="close" onClick={() => setPreviewOpen(false)}>Đóng</Button>,
                    <Button
                        key="print"
                        type="primary"
                        icon={<PrinterOutlined />}
                        onClick={() => handlePrint()}
                        style={{ background: 'linear-gradient(135deg, #1677ff, #0050b3)', border: 'none' }}
                    >
                        Tải PDF
                    </Button>,
                ]}
                title={
                    <span style={{ fontWeight: 700 }}>
                        <FileTextOutlined style={{ marginRight: 8, color: '#6c63ff' }} />
                        {previewDraft?.title}
                    </span>
                }
                style={{ top: 20 }}
            >
                {previewResult && previewDraft && (
                    <div style={{ maxHeight: '75vh', overflowY: 'auto', padding: '16px 0' }}>
                        <div
                            className={`${styles.cvResult} ${
                                getTemplate(previewDraft.templateId)?.layout === 'right-sidebar' ? styles.layoutRight :
                                getTemplate(previewDraft.templateId)?.layout === 'top-header' ? styles.layoutTop :
                                getTemplate(previewDraft.templateId)?.layout === 'split-header' ? styles.layoutSplit :
                                getTemplate(previewDraft.templateId)?.layout === 'no-sidebar' ? styles.layoutClean : ''
                            }`}
                            ref={cvRef}
                            style={getTemplateVars(previewDraft.templateId)}
                        >
                            {/* Sidebar */}
                            <aside className={styles.cvSidebar}>
                                <div className={styles.avatarBox}>
                                    {previewDraft.avatarUrl ? (
                                        <img src={previewDraft.avatarUrl} alt="avatar" className={styles.avatarImg} />
                                    ) : (
                                        <div className={styles.avatarPlaceholder}>
                                            <span style={{ fontSize: 36, opacity: 0.5 }}>👤</span>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.sidebarSection}>
                                    <div className={styles.sidebarTitle}>Thông tin</div>
                                    <div className={styles.contactList}>
                                        {previewResult.personalInfo?.dob && <div className={styles.contactItem}><span>Ngày sinh:</span>{previewResult.personalInfo.dob}</div>}
                                        {previewResult.personalInfo?.phone && <div className={styles.contactItem}><span>SĐT:</span>{previewResult.personalInfo.phone}</div>}
                                        {previewResult.personalInfo?.email && <div className={styles.contactItem}><span>Email:</span>{previewResult.personalInfo.email}</div>}
                                        {previewResult.personalInfo?.address && <div className={styles.contactItem}><span>Địa chỉ:</span>{previewResult.personalInfo.address}</div>}
                                    </div>
                                </div>

                                <div className={styles.sidebarSection}>
                                    <div className={styles.sidebarTitle}>Kỹ năng</div>
                                    <div className={styles.skillList}>
                                        {previewResult.skills?.map((skill, idx) => (
                                            <div key={idx} className={styles.skillItem}>
                                                <div className={styles.skillName}>{skill.name}</div>
                                                <div className={styles.skillBarWrapper}>
                                                    <div className={styles.skillBarFill} style={{ width: `${skill.level}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {previewResult.interests?.length > 0 && (
                                    <div className={styles.sidebarSection}>
                                        <div className={styles.sidebarTitle}>Sở thích</div>
                                        <div className={styles.skillTags}>
                                            {previewResult.interests.map((interest, idx) => (
                                                <span key={idx} className={styles.skillTag}>{interest}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </aside>

                            {/* Main */}
                            <main className={styles.cvMain}>
                                <header className={styles.cvHeader}>
                                    <h1 className={styles.cvName}>{previewResult.name}</h1>
                                    <p className={styles.cvJobTitle}>{previewResult.jobTitle}</p>
                                </header>

                                <div className={styles.cvSection}>
                                    <div className={styles.cvSectionTitle}>Mục tiêu nghề nghiệp</div>
                                    <p className={styles.summaryText}>{previewResult.careerObjective}</p>
                                </div>

                                {previewResult.education?.length > 0 && (
                                    <div className={styles.cvSection}>
                                        <div className={styles.cvSectionTitle}>Học vấn</div>
                                        {previewResult.education.map((edu, idx) => (
                                            <div key={idx} className={styles.entryBlock}>
                                                <div className={styles.entryHeader}>
                                                    <span className={styles.entryTitle}>{edu.major}</span>
                                                    <span className={styles.entryTime}>{edu.timeRange}</span>
                                                </div>
                                                <div className={styles.entrySub}>{edu.school}</div>
                                                <div className={styles.entryDesc}>{edu.desc}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {previewResult.experiences?.length > 0 && (
                                    <div className={styles.cvSection}>
                                        <div className={styles.cvSectionTitle}>Kinh nghiệm làm việc</div>
                                        {previewResult.experiences.map((exp, idx) => (
                                            <div key={idx} className={styles.entryBlock}>
                                                <div className={styles.entryHeader}>
                                                    <span className={styles.entryTitle}>{exp.title}</span>
                                                    <span className={styles.entryTime}>{exp.timeRange}</span>
                                                </div>
                                                <div className={styles.entrySub}>{exp.company}</div>
                                                <ul className={styles.expBullets}>
                                                    {exp.bullets.map((b, bi) => <li key={bi}>{b}</li>)}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </main>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

const ManageAccount = (props: IProps) => {
    const { open, onClose } = props;

    const onChange = (key: string) => {
        // console.log(key);
    };

    const items: TabsProps['items'] = [
        {
            key: 'user-resume',
            label: `My Applications`,
            children: <UserResume />,
        },
        {
            key: 'favorite-jobs',
            label: `Favorite Jobs`,
            children: <FavoriteJobsTab onClose={onClose} />,
        },
        {
            key: 'my-cvs',
            label: `My CV`,
            children: <MyCvsTab onClose={onClose} />,
        },
        {
            key: 'job-by-email',
            label: `Job Alerts`,
            children: <JobByEmail />,
        },
        {
            key: 'user-update-info',
            label: `Update Profile`,
            children: <UserUpdateInfo open={open} />,
        },
        {
            key: 'user-password',
            label: `Change Password`,
            children: <ChangePasswordTab onClose={onClose} />,
        },
    ];


    return (
        <>
            <Modal
                title="Account Management"
                open={open}
                onCancel={() => onClose(false)}
                maskClosable={false}
                footer={null}
                destroyOnClose={true}
                width={isMobile ? "100%" : "1000px"}
            >

                <div style={{ minHeight: 400 }}>
                    <Tabs
                        defaultActiveKey="user-resume"
                        items={items}
                        onChange={onChange}
                    />
                </div>

            </Modal>
        </>
    )
}

export default ManageAccount;
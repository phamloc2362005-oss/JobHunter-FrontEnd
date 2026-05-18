import { Alert, Button, Card, Col, Divider, Form, Modal, Row, Select, Table, Tabs, Tag, Typography, message, notification, Input } from "antd";
import { isMobile } from "react-device-detect";
import type { TabsProps } from 'antd';
import { IExpertise, IJob, IResume, ISubscribers, ISkill } from "@/types/backend";
import { useState, useEffect } from 'react';
import { callCreateSubscriber, callFetchAllSkill, callFetchExpertise, callFetchResumeByUser, callGetSubscriberSkills, callUpdateSubscriber, callChangePassword, callUpdateUserRecommendationProfile, callGetUserRecommendationProfile, callFetchFavoriteJobs, callFetchAccount, callUpdateUser } from "@/config/api";
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { ExclamationCircleOutlined, MonitorOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { useAppSelector } from "@/redux/hooks";
import { useNavigate } from "react-router-dom";
import { convertSlug } from "@/config/utils";
import { DebounceSelect } from "../../admin/user/debouce.select";

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
            dataIndex: "companyName",

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
        const userUpdateRes = await callUpdateUser({
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
                const d = res.data.skills;
                const arr = d.map((item: any) => {
                    return {
                        label: item.name as string,
                        value: item.id + "" as string
                    }
                });
                setSkills(arr);
                form.setFieldValue("skills", arr);
            }
        }
        init();
    }, [])

    const onFinish = async (values: any) => {
        const { skills } = values;

        const arr = skills?.map((item: any) => {
            if (item?.id) return { id: item.id };
            return { id: item }
        });

        if (!subscriber?.id) {
            //create subscriber
            const data = {
                email: user.email,
                name: user.name,
                skills: arr
            }

            const res = await callCreateSubscriber(data);
            if (res.data) {
                message.success("Settings updated successfully");
                setSubscriber(res.data);
            } else {
                notification.error({
                    message: 'An error occurred',
                    description: res.message
                });
            }


        } else {
            //update subscriber
            const res = await callUpdateSubscriber({
                id: subscriber?.id,
                skills: arr
            });
            if (res.data) {
                message.success("Settings updated successfully");
                setSubscriber(res.data);
            } else {
                notification.error({
                    message: 'An error occurred',
                    description: res.message
                });
            }
        }


    }

    return (
        <>
            <Form
                onFinish={onFinish}
                form={form}
            >
                <Row gutter={[20, 20]}>
                    <Col span={24}>
                        <Form.Item
                            label={"Skills"}
                            name={"skills"}
                            rules={[{ required: true, message: 'Please select at least 1 skill!' }]}

                        >
                            <DebounceSelect
                                mode="multiple"
                                allowClear
                                showSearch
                                placeholder="Select your skills"
                                fetchOptions={fetchSkillList}
                                value={skills}
                                onChange={(val: any) => setSkills(val)}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Button onClick={() => form.submit()}>Update</Button>
                    </Col>
                </Row>
            </Form>
        </>
    )
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
            key: 'email-by-skills',
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
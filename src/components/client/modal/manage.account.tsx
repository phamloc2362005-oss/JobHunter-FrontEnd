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
            title: 'STT',
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
            title: 'Công Ty',
            dataIndex: "companyName",

        },
        {
            title: 'Job title',
            dataIndex: ["job", "name"],

        },
        {
            title: 'Trạng thái',
            dataIndex: "status",
        },
        {
            title: 'Ngày rải CV',
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
                    >Chi tiết</a>
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
        { label: "Intern - Thực tập", value: "INTERN" },
        { label: "Junior - Fresher", value: "JUNIOR" },
        { label: "Middle - Có kinh nghiệm", value: "MIDDLE" },
        { label: "Senior - Dày dạn", value: "SENIOR" },
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
                let skillsData = [];
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
            message.success("Cập nhật thông tin thành công.");
            await loadData();
            return;
        }

        notification.error({
            message: "Có lỗi xảy ra",
            description: "Không thể cập nhật thông tin cá nhân",
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
                        <Typography.Title level={4} style={{ margin: 0 }}>Hồ sơ gợi ý việc làm</Typography.Title>
                        <Typography.Paragraph style={{ margin: "8px 0 0", color: "#64748b" }}>
                            Cập nhật các tiêu chí này để hệ thống đẩy job phù hợp hơn với bạn.
                        </Typography.Paragraph>
                    </div>
                    <Tag color="geekblue" icon={<ThunderboltOutlined />}>Xin chào {user?.name || "bạn"}</Tag>
                </div>

                <Alert
                    showIcon
                    type="info"
                    icon={<ExclamationCircleOutlined />}
                    style={{ marginTop: 16, marginBottom: 18 }}
                    message="Tip"
                    description="Càng chọn đúng kỹ năng, level và chuyên môn, danh sách job phù hợp càng sát với hồ sơ của bạn."
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
                                label="Họ tên"
                                name="name"
                                rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                            >
                                <Input placeholder="Nhập họ tên" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item
                                label="Tuổi"
                                name="age"
                                rules={[{ required: true, message: "Vui lòng nhập tuổi" }]}
                            >
                                <Input type="number" placeholder="Nhập tuổi" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item
                                label="Giới tính"
                                name="gender"
                                rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
                            >
                                <Select
                                    options={[
                                        { label: "Nam", value: "MALE" },
                                        { label: "Nữ", value: "FEMALE" },
                                        { label: "Khác", value: "OTHER" },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item
                                label="Địa chỉ"
                                name="address"
                                rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                            >
                                <Input placeholder="Nhập địa chỉ" />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Divider orientation="left" style={{ margin: "12px 0" }}>Hồ sơ nghề nghiệp</Divider>
                        </Col>

                        <Col xs={24}>
                            <Form.Item
                                label="Kỹ năng"
                                name="skillIds"
                                rules={[{ required: true, message: "Vui lòng chọn ít nhất 1 kỹ năng" }]}
                            >
                                <DebounceSelect
                                    mode="multiple"
                                    allowClear
                                    showSearch
                                    placeholder="Chọn kỹ năng bạn đang có"
                                    fetchOptions={fetchSkillList}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Level"
                                name="level"
                                rules={[{ required: true, message: "Vui lòng chọn level" }]}
                            >
                                <Select
                                    allowClear
                                    placeholder="Chọn level kinh nghiệm"
                                    options={levelOptions}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Chuyên môn"
                                name="expertiseId"
                            >
                                <DebounceSelect
                                    allowClear
                                    showSearch
                                    placeholder="Chọn chuyên môn chính"
                                    fetchOptions={fetchExpertiseList}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Divider style={{ margin: "4px 0 12px" }} />
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                                <Typography.Text type="secondary">
                                    Dữ liệu này chỉ dùng cho recommendation engine.
                                </Typography.Text>
                                <Button type="primary" htmlType="submit" loading={isSubmitting}>
                                    Cập nhật thông tin
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
                message.success("Cập nhật thông tin thành công");
                setSubscriber(res.data);
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
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
                message.success("Cập nhật thông tin thành công");
                setSubscriber(res.data);
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
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
                            label={"Kỹ năng"}
                            name={"skills"}
                            rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 skill!' }]}

                        >
                            <DebounceSelect
                                mode="multiple"
                                allowClear
                                showSearch
                                placeholder="Chọn kỹ năng bạn đang có"
                                fetchOptions={fetchSkillList}
                                value={skills}
                                onChange={(val: any) => setSkills(val)}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Button onClick={() => form.submit()}>Cập nhật</Button>
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
            message.success("Đổi mật khẩu thành công!");
            form.resetFields();
            onClose(false);
            navigate('/');
        } else {
            notification.error({
                message: "Có lỗi xảy ra",
                description: res?.message || "Không thể đổi mật khẩu"
            });
        }
    };

    return (
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 480 }}>
            <Form.Item
                label="Mật khẩu hiện tại"
                name="currentPassword"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại" }]}
            >
                <Input.Password placeholder="Nhập mật khẩu cũ" autoComplete="current-password" />
            </Form.Item>
            <Form.Item
                label="Mật khẩu mới"
                name="newPassword"
                rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu mới" },
                    { min: 6, message: "Mật khẩu tối thiểu 6 ký tự" },
                ]}
            >
                <Input.Password placeholder="Mật khẩu mới" autoComplete="new-password" />
            </Form.Item>
            <Form.Item
                label="Nhập lại mật khẩu mới"
                name="confirmPassword"
                dependencies={["newPassword"]}
                rules={[
                    { required: true, message: "Vui lòng nhập lại mật khẩu mới" },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue("newPassword") === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
                        },
                    }),
                ]}
            >
                <Input.Password placeholder="Nhập lại mật khẩu mới" autoComplete="new-password" />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" loading={isLoading}>
                    Cập nhật mật khẩu
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
            title: 'STT',
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
            title: 'Công Ty',
            dataIndex: ["company", "name"],
        },
        {
            title: 'Địa điểm',
            dataIndex: "location",
        },
        {
            title: 'Cập nhật',
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
                        Xem chi tiết
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
            label: `Rải CV`,
            children: <UserResume />,
        },
        {
            key: 'favorite-jobs',
            label: `Job yêu thích`,
            children: <FavoriteJobsTab onClose={onClose} />,
        },
        {
            key: 'email-by-skills',
            label: `Nhận Jobs qua Email`,
            children: <JobByEmail />,
        },
        {
            key: 'user-update-info',
            label: `Cập nhật thông tin`,
            children: <UserUpdateInfo open={open} />,
        },
        {
            key: 'user-password',
            label: `Thay đổi mật khẩu`,
            children: <ChangePasswordTab onClose={onClose} />,
        },
    ];


    return (
        <>
            <Modal
                title="Quản lý tài khoản"
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
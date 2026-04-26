import { Breadcrumb, Col, ConfigProvider, Divider, Form, Row, message, notification } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { DebounceSelect } from "../user/debouce.select";
import { FooterToolbar, ProForm, ProFormDatePicker, ProFormDigit, ProFormSelect, ProFormSwitch, ProFormText } from "@ant-design/pro-components";
import styles from 'styles/admin.module.scss';
import { LOCATION_LIST } from "@/config/utils";
import { ICompanySelect } from "../user/modal.user";
import { useState, useEffect, useCallback } from 'react';
import { callCreateJob, callFetchAdminJobById, callFetchAllSkill, callFetchCompany, callFetchExpertise, callUpdateJob } from "@/config/api";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { CheckSquareOutlined } from "@ant-design/icons";
import enUS from 'antd/lib/locale/en_US';
import dayjs from 'dayjs';
import { IExpertise, IJob, ISkill } from "@/types/backend";

// Type cho options của Select
interface ISkillOption {
    label: string;
    value: string;
    key?: string;
}

interface IExpertiseOption {
    label: string;
    value: string;
    key?: string;
}

// Type cho raw expertise từ backend (string - tên expertise)
type RawExpertise = string | IExpertise | { id?: number; name?: string } | null | undefined;

// Type cho job response từ API (định nghĩa rõ ràng)
interface IJobResponse {
    id: string | number;
    name: string;
    skills: ISkill[];
    expertise: RawExpertise;
    company?: {
        id: string | number;
        name: string;
        logo?: string;
    };
    location: string;
    salary: number;
    quantity: number;
    level: string;
    description: string;
    required?: string;
    benefit?: string;
    startDate: string | Date;
    endDate: string | Date;
    active: boolean;
}

const JOB_RICH_TEXT_MODULES = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "link"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["clean"],
    ],
};

const isQuillEmpty = (html?: string) => {
    if (!html) return true;
    const text = html.replace(/<[^>]+>/g, "").replace(/&nbsp;/gi, " ").trim();
    return text.length === 0;
};

// Helper: Normalize string (trim + lowercase)
const normalizeString = (str: string | undefined | null): string => {
    return str?.trim().toLowerCase() ?? '';
};

// Helper: Convert ISkill[] → ISkillOption[]
const mapSkillsToOptions = (skills: ISkill[]): ISkillOption[] => {
    return skills.map((item) => ({
        label: item.name,
        value: String(item.id),
        key: item.id,
    }));
};

// Helper: Convert IExpertise[] → IExpertiseOption[]
const mapExpertisesToOptions = (expertises: IExpertise[]): IExpertiseOption[] => {
    return expertises.map((item) => ({
        label: item.name,
        value: String(item.id),
        key: item.id,
    }));
};

// Helper: Tìm expertise option từ raw expertise (string name từ backend)
const findExpertiseOptionByName = (
    rawExpertise: RawExpertise,
    options: IExpertiseOption[]
): IExpertiseOption | undefined => {
    if (!rawExpertise) return undefined;

    // Trường hợp backend trả về string (tên expertise)
    if (typeof rawExpertise === 'string') {
        const searchName = normalizeString(rawExpertise);
        return options.find((opt) => normalizeString(opt.label) === searchName);
    }

    // Trường hợp backend trả về object { name: string }
    if (typeof rawExpertise === 'object' && 'name' in rawExpertise) {
        const searchName = normalizeString(rawExpertise.name);
        return options.find((opt) => normalizeString(opt.label) === searchName);
    }

    return undefined;
};

// Helper: Normalize rich text fields
const normalizeTextField = (value: unknown): string => {
    if (!value) return "";
    if (Array.isArray(value)) return value.map((item) => `${item}`.trim()).filter(Boolean).join("\n");
    return `${value}`;
};

const ViewUpsertJob = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [form] = Form.useForm();

    // State cho form data
    const [value, setValue] = useState<string>("");
    const [dataUpdate, setDataUpdate] = useState<IJob | null>(null);
    const [companies, setCompanies] = useState<ICompanySelect[]>([]);

    // State cho dropdown options
    const [skillOptions, setSkillOptions] = useState<ISkillOption[]>([]);
    const [expertiseOptions, setExpertiseOptions] = useState<IExpertiseOption[]>([]);
    const [isLoadingOptions, setIsLoadingOptions] = useState(false);

    // Lấy job id từ URL
    const jobId = new URLSearchParams(location.search).get("id");

    // Effect 1: Load dropdown options (skills & expertises)
    useEffect(() => {
        const loadDropdownOptions = async () => {
            setIsLoadingOptions(true);
            try {
                const [skillsRes, expertisesRes] = await Promise.all([
                    callFetchAllSkill("page=1&size=100"),
                    callFetchExpertise("page=1&size=1000&sort=name,asc"),
                ]);

                if (skillsRes?.data?.result) {
                    setSkillOptions(mapSkillsToOptions(skillsRes.data.result));
                }

                if (expertisesRes?.data?.result) {
                    setExpertiseOptions(mapExpertisesToOptions(expertisesRes.data.result));
                }
            } catch (error) {
                console.error("Error loading dropdown options:", error);
            } finally {
                setIsLoadingOptions(false);
            }
        };

        loadDropdownOptions();
    }, []);

    // Effect 2: Load job data khi có jobId VÀ options đã load xong
    useEffect(() => {
        const loadJobData = async () => {
            if (!jobId || expertiseOptions.length === 0) return;

            try {
                const res = await callFetchAdminJobById(jobId);
                if (res?.data) {
                    const job = res.data as IJobResponse;

                    // Set form data
                    setDataUpdate(job);
                    setValue(job.description ?? "");

                    // Set companies
                    if (job.company) {
                        setCompanies([{
                            label: job.company.name,
                            value: `${job.company.id}@#$${job.company.logo ?? ''}`,
                            key: job.company.id,
                        }]);
                    }

                    // Map skills
                    const skillOpts = mapSkillsToOptions(job.skills ?? []);

                    // Map expertise - tìm option từ tên expertise
                    const expertiseOpt = findExpertiseOptionByName(job.expertise, expertiseOptions);

                    // Set form values
                    form.setFieldsValue({
                        name: job.name,
                        location: job.location,
                        salary: job.salary,
                        quantity: job.quantity,
                        level: job.level,
                        description: job.description ?? "",
                        skills: skillOpts,
                        expertises: expertiseOpt?.value,
                        company: job.company ? {
                            label: job.company.name,
                            value: `${job.company.id}@#$${job.company.logo ?? ''}`,
                            key: job.company.id,
                        } : undefined,
                        startDate: job.startDate ? dayjs(job.startDate) : undefined,
                        endDate: job.endDate ? dayjs(job.endDate) : undefined,
                        active: job.active,
                        required: normalizeTextField(job.required),
                        benefit: normalizeTextField(job.benefit),
                    });
                }
            } catch (error) {
                console.error("Error loading job data:", error);
                notification.error({
                    message: "Lỗi",
                    description: "Không thể tải thông tin job",
                });
            }
        };

        loadJobData();

        return () => {
            form.resetFields();
        };
    }, [jobId, expertiseOptions, form]);

    // Fetch company list cho DebounceSelect
    const fetchCompanyList = useCallback(async (name: string): Promise<ICompanySelect[]> => {
        const res = await callFetchCompany(`page=1&size=100&name ~ '${name}'`);
        if (res?.data?.result) {
            return res.data.result.map((item) => ({
                label: item.name,
                value: `${item.id}@#$${item.logo ?? ''}`,
            }));
        }
        return [];
    }, []);

    // Submit form
    const onFinish = async (values: Record<string, unknown>) => {
        try {
            // Map skills
            const skills = (values.skills as ISkillOption[] | string[] | undefined)?.map((item) => ({
                id: typeof item === 'object' ? Number((item as ISkillOption).value) : Number(item),
            })) ?? [];

            // Map expertise
            const expertiseValue = values.expertises;
            const expertise = expertiseValue
                ? { id: typeof expertiseValue === 'object' ? Number((expertiseValue as IExpertiseOption).value) : Number(expertiseValue) }
                : null;

            // Map company
            const companyValue = values.company as ICompanySelect | undefined;
            const companyParts = companyValue?.value?.split('@#$') ?? [];

            const jobData: Record<string, unknown> = {
                name: values.name,
                location: values.location,
                salary: values.salary,
                quantity: values.quantity,
                level: values.level,
                skills,
                expertise,
                description: value,
                required: values.required,
                benefit: values.benefit,
                active: values.active,
                startDate: dayjs(values.startDate as string).toDate(),
                endDate: dayjs(values.endDate as string).toDate(),
            };

            // Thêm company & id nếu là update
            if (dataUpdate?.id) {
                jobData.id = Number(dataUpdate.id);
                jobData.company = {
                    id: companyParts[0] ? Number(companyParts[0]) : 0,
                    name: companyValue?.label ?? '',
                    logo: companyParts[1] ?? '',
                };
            } else {
                jobData.company = {
                    id: companyParts[0] ?? '',
                    name: companyValue?.label ?? '',
                    logo: companyParts[1] ?? '',
                };
            }

            // Gọi API
            const res = dataUpdate?.id
                ? await callUpdateJob(jobData as Parameters<typeof callUpdateJob>[0])
                : await callCreateJob(jobData as Parameters<typeof callCreateJob>[0]);

            if (res?.data) {
                message.success(dataUpdate?.id ? "Cập nhật job thành công" : "Tạo mới job thành công");
                navigate('/admin/job');
            } else {
                notification.error({
                    message: "Có lỗi xảy ra",
                    description: res?.message ?? "Vui lòng thử lại",
                });
            }
        } catch (error) {
            console.error("Error submitting job:", error);
            notification.error({
                message: "Có lỗi xảy ra",
                description: "Vui lòng thử lại sau",
            });
        }
    };

    return (
        <div className={styles["upsert-job-container"]}>
            <div className={styles["title"]}>
                <Breadcrumb
                    separator=">"
                    items={[
                        { title: <Link to="/admin/job">Manage Job</Link> },
                        { title: jobId ? "Update Job" : "Create Job" },
                    ]}
                />
            </div>

            <ConfigProvider locale={enUS}>
                <ProForm
                    form={form}
                    onFinish={onFinish}
                    submitter={{
                        searchConfig: {
                            resetText: "Hủy",
                            submitText: jobId ? "Cập nhật Job" : "Tạo mới Job",
                        },
                        onReset: () => navigate('/admin/job'),
                        render: (_: unknown, dom: unknown[]) => <FooterToolbar>{dom}</FooterToolbar>,
                        submitButtonProps: { icon: <CheckSquareOutlined /> },
                    }}
                >
                    <Row gutter={[20, 20]}>
                        {/* Tên Job */}
                        <Col span={24} md={12}>
                            <ProFormText
                                label="Tên Job"
                                name="name"
                                rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                placeholder="Nhập tên job"
                            />
                        </Col>

                        {/* Kỹ năng */}
                        <Col span={24} md={6}>
                            <ProFormSelect
                                name="skills"
                                label="Kỹ năng yêu cầu"
                                options={skillOptions}
                                placeholder="Chọn kỹ năng"
                                rules={[{ required: true, message: 'Vui lòng chọn kỹ năng!' }]}
                                allowClear
                                mode="multiple"
                                fieldProps={{ suffixIcon: null }}
                            />
                        </Col>

                        {/* Chuyên môn */}
                        <Col span={24} md={6}>
                            <ProFormSelect
                                name="expertises"
                                label="Chuyên môn"
                                options={expertiseOptions}
                                placeholder="Chọn chuyên môn"
                                rules={[{ required: true, message: 'Vui lòng chọn chuyên môn!' }]}
                                allowClear
                                fieldProps={{ suffixIcon: null }}
                            />
                        </Col>

                        {/* Địa điểm */}
                        <Col span={24} md={6}>
                            <ProFormSelect
                                name="location"
                                label="Địa điểm"
                                options={LOCATION_LIST.filter(item => item.value !== 'ALL')}
                                placeholder="Chọn địa điểm"
                                rules={[{ required: true, message: 'Vui lòng chọn địa điểm!' }]}
                            />
                        </Col>

                        {/* Mức lương */}
                        <Col span={24} md={6}>
                            <ProFormDigit
                                label="Mức lương"
                                name="salary"
                                rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                placeholder="Nhập mức lương"
                                fieldProps={{
                                    addonAfter: " đ",
                                    formatter: (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                                    parser: (value) => +(value || '').replace(/\$\s?|(,*)/g, ''),
                                }}
                            />
                        </Col>

                        {/* Số lượng */}
                        <Col span={24} md={6}>
                            <ProFormDigit
                                label="Số lượng"
                                name="quantity"
                                rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                placeholder="Nhập số lượng"
                            />
                        </Col>

                        {/* Trình độ */}
                        <Col span={24} md={6}>
                            <ProFormSelect
                                name="level"
                                label="Trình độ"
                                valueEnum={{
                                    INTERN: 'INTERN',
                                    FRESHER: 'FRESHER',
                                    JUNIOR: 'JUNIOR',
                                    MIDDLE: 'MIDDLE',
                                    SENIOR: 'SENIOR',
                                }}
                                placeholder="Chọn trình độ"
                                rules={[{ required: true, message: 'Vui lòng chọn trình độ!' }]}
                            />
                        </Col>

                        {/* Công ty */}
                        {(!jobId || dataUpdate?.id) && (
                            <Col span={24} md={6}>
                                <ProForm.Item
                                    name="company"
                                    label="Thuộc Công Ty"
                                    rules={[{ required: true, message: 'Vui lòng chọn công ty!' }]}
                                >
                                    <DebounceSelect
                                        allowClear
                                        showSearch
                                        value={companies}
                                        placeholder="Chọn công ty"
                                        fetchOptions={fetchCompanyList}
                                        onChange={(newValue) => {
                                            if (Array.isArray(newValue) && (newValue.length === 0 || newValue.length === 1)) {
                                                setCompanies(newValue as ICompanySelect[]);
                                            }
                                        }}
                                        style={{ width: '100%' }}
                                    />
                                </ProForm.Item>
                            </Col>
                        )}
                    </Row>

                    <Row gutter={[20, 20]}>
                        {/* Ngày bắt đầu */}
                        <Col span={24} md={6}>
                            <ProFormDatePicker
                                label="Ngày bắt đầu"
                                name="startDate"
                                normalize={(value) => value && dayjs(value, 'DD/MM/YYYY')}
                                fieldProps={{ format: 'DD/MM/YYYY' }}
                                rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
                                placeholder="dd/mm/yyyy"
                            />
                        </Col>

                        {/* Ngày kết thúc */}
                        <Col span={24} md={6}>
                            <ProFormDatePicker
                                label="Ngày kết thúc"
                                name="endDate"
                                normalize={(value) => value && dayjs(value, 'DD/MM/YYYY')}
                                fieldProps={{ format: 'DD/MM/YYYY' }}
                                rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}
                                placeholder="dd/mm/yyyy"
                            />
                        </Col>

                        {/* Trạng thái */}
                        <Col span={24} md={6}>
                            <ProFormSwitch
                                label="Trạng thái"
                                name="active"
                                checkedChildren="ACTIVE"
                                unCheckedChildren="INACTIVE"
                                initialValue={true}
                                fieldProps={{ defaultChecked: true }}
                            />
                        </Col>

                        {/* Miêu tả job */}
                        <Col span={24}>
                            <ProForm.Item
                                name="description"
                                label="Miêu tả job"
                                rules={[{ required: true, message: 'Vui lòng nhập miêu tả job!' }]}
                            >
                                <ReactQuill
                                    theme="snow"
                                    modules={JOB_RICH_TEXT_MODULES}
                                    value={value}
                                    onChange={(content) => {
                                        setValue(content);
                                        form.setFieldValue('description', content);
                                    }}
                                />
                            </ProForm.Item>
                        </Col>

                        {/* Yêu cầu công việc */}
                        <Col span={24} md={12}>
                            <ProForm.Item
                                name="required"
                                label="Yêu cầu công việc"
                                rules={[
                                    {
                                        validator: (_, val: string) =>
                                            isQuillEmpty(val)
                                                ? Promise.reject(new Error("Vui lòng nhập yêu cầu công việc"))
                                                : Promise.resolve(),
                                    },
                                ]}
                            >
                                <ReactQuill
                                    theme="snow"
                                    modules={JOB_RICH_TEXT_MODULES}
                                    placeholder="Nhập yêu cầu..."
                                />
                            </ProForm.Item>
                        </Col>

                        {/* Quyền lợi */}
                        <Col span={24} md={12}>
                            <ProForm.Item
                                name="benefit"
                                label="Quyền lợi"
                                rules={[
                                    {
                                        validator: (_, val: string) =>
                                            isQuillEmpty(val)
                                                ? Promise.reject(new Error("Vui lòng nhập quyền lợi"))
                                                : Promise.resolve(),
                                    },
                                ]}
                            >
                                <ReactQuill
                                    theme="snow"
                                    modules={JOB_RICH_TEXT_MODULES}
                                    placeholder="Nhập quyền lợi..."
                                />
                            </ProForm.Item>
                        </Col>
                    </Row>
                    <Divider />
                </ProForm>
            </ConfigProvider>
        </div>
    );
};

export default ViewUpsertJob;

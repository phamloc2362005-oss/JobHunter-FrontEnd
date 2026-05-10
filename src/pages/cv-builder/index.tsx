import { useState, useRef, useMemo } from 'react';
import { Button, Input, Tag, Spin, message, Tooltip, Form, Steps, Card, Pagination, Upload } from 'antd';
import {
    RobotOutlined,
    CopyOutlined,
    BulbOutlined,
    CheckCircleOutlined,
    UserOutlined,
    ThunderboltOutlined,
    StarOutlined,
    PrinterOutlined,
    PlusOutlined,
    MinusCircleOutlined,
    ArrowLeftOutlined,
    ArrowRightOutlined,
    CameraOutlined,
} from '@ant-design/icons';
import { callGenerateCv, callUploadSingleFile } from '@/config/api';
import styles from './index.module.scss';
import { useReactToPrint } from 'react-to-print';
import { CV_TEMPLATES, ICvTemplate } from './cvTemplates';

const { TextArea } = Input;

// ===== INTERFACES =====
interface IPersonalInfo {
    dob: string;
    gender: string;
    phone: string;
    email: string;
    address: string;
}
interface ISkill {
    name: string;
    level: number;
}
interface IEducation {
    timeRange: string;
    major: string;
    school: string;
    desc: string;
}
interface IExperience {
    timeRange: string;
    title: string;
    company: string;
    bullets: string[];
}
interface ICvResult {
    name: string;
    jobTitle: string;
    personalInfo: IPersonalInfo;
    careerObjective: string;
    skills: ISkill[];
    interests: string[];
    education: IEducation[];
    experiences: IExperience[];
}

// ===== FORM DATA =====
interface IFormExperience {
    company: string;
    title: string;
    timeRange: string;
    description: string;
}
interface ICvFormData {
    name: string;
    jobTitle: string;
    phone: string;
    email: string;
    address: string;
    dob: string;
    careerObjective: string;
    experiences: IFormExperience[];
    skills: string[];
    eduSchool: string;
    eduMajor: string;
    eduTime: string;
    eduDesc: string;
    interests: string;
}

const CvBuilderPage = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedTemplate, setSelectedTemplate] = useState<ICvTemplate | null>(null);
    const [templatePage, setTemplatePage] = useState(1);
    const TEMPLATES_PER_PAGE = 6;
    const [formData, setFormData] = useState<ICvFormData>({
        name: '', jobTitle: '', phone: '', email: '', address: '', dob: '',
        careerObjective: '',
        experiences: [{ company: '', title: '', timeRange: '', description: '' }],
        skills: [''],
        eduSchool: '', eduMajor: '', eduTime: '', eduDesc: '',
        interests: '',
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ICvResult | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string>('');
    const cvRef = useRef<HTMLDivElement>(null);

    // ===== Avatar Upload =====
    const handleAvatarUpload = async (file: any) => {
        try {
            const res: any = await callUploadSingleFile(file, 'avatar');
            console.log('Full upload response:', res);
            
            // Check both possible structures depending on axios interceptor
            const fileName = res?.data?.fileName || res?.fileName;
            
            if (fileName) {
                // Use relative path which will be proxied or relative to the same origin
                const url = `/storage/avatar/${fileName}`;
                setAvatarUrl(url);
                message.success('Upload ảnh thành công!');
            } else {
                console.error('No filename in response:', res);
                message.error('Không tìm thấy tên file trong phản hồi!');
            }
        } catch (err) {
            console.error('Upload error details:', err);
            message.error('Lỗi khi upload ảnh, vui lòng thử lại!');
        }
        return false; // prevent default upload
    };

    const handlePrint = useReactToPrint({
        contentRef: cvRef,
        documentTitle: `CV_${result?.name || 'TopCV'}`,
    });

    // ===== STEP 1: Chọn Template =====
    const handleSelectTemplate = (template: ICvTemplate) => {
        setSelectedTemplate(template);
    };

    // ===== STEP 2: Form Helpers =====
    const updateField = (field: keyof ICvFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addExperience = () => {
        setFormData(prev => ({
            ...prev,
            experiences: [...prev.experiences, { company: '', title: '', timeRange: '', description: '' }]
        }));
    };
    const removeExperience = (idx: number) => {
        setFormData(prev => ({
            ...prev,
            experiences: prev.experiences.filter((_, i) => i !== idx)
        }));
    };
    const updateExperience = (idx: number, field: keyof IFormExperience, value: string) => {
        setFormData(prev => {
            const exps = [...prev.experiences];
            exps[idx] = { ...exps[idx], [field]: value };
            return { ...prev, experiences: exps };
        });
    };

    const addSkill = () => {
        setFormData(prev => ({ ...prev, skills: [...prev.skills, ''] }));
    };
    const removeSkill = (idx: number) => {
        setFormData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== idx) }));
    };
    const updateSkill = (idx: number, value: string) => {
        setFormData(prev => {
            const skills = [...prev.skills];
            skills[idx] = value;
            return { ...prev, skills };
        });
    };

    // ===== STEP 2 → STEP 3: Validate & Generate =====
    const validateAndGenerate = async () => {
        if (!formData.name.trim()) return message.error('Vui lòng nhập họ tên!');
        if (!formData.jobTitle.trim()) return message.error('Vui lòng nhập vị trí ứng tuyển!');
        if (!formData.phone.trim()) return message.error('Vui lòng nhập số điện thoại!');
        if (!formData.email.trim()) return message.error('Vui lòng nhập email!');
        const validSkills = formData.skills.filter(s => s.trim());
        if (validSkills.length < 3) return message.error('Vui lòng nhập ít nhất 3 kỹ năng!');
        const validExps = formData.experiences.filter(e => e.company.trim() && e.title.trim());
        if (validExps.length === 0) return message.error('Vui lòng nhập ít nhất 1 kinh nghiệm!');

        // Serialize form data to text for AI
        const rawInput = `
Tên: ${formData.name}
Vị trí ứng tuyển: ${formData.jobTitle}
SĐT: ${formData.phone}
Email: ${formData.email}
Địa chỉ: ${formData.address}
Ngày sinh: ${formData.dob}

Mục tiêu nghề nghiệp: ${formData.careerObjective}

Kinh nghiệm:
${formData.experiences.map(e => `- ${e.title} tại ${e.company} (${e.timeRange}): ${e.description}`).join('\n')}

Kỹ năng: ${validSkills.join(', ')}

Học vấn: ${formData.eduMajor} tại ${formData.eduSchool} (${formData.eduTime}). ${formData.eduDesc}

Sở thích: ${formData.interests}
        `.trim();

        setLoading(true);
        setResult(null);
        try {
            const res: any = await callGenerateCv(rawInput);
            if (res && res.data) {
                const cvData = res.data.data ? res.data.data : res.data;
                setResult(cvData as ICvResult);
                setCurrentStep(2);
                message.success('AI đã tạo CV thành công!');
            } else {
                message.error('AI không thể tạo CV. Vui lòng thử lại!');
            }
        } catch (err) {
            console.error('Lỗi gọi AI:', err);
            message.error('Có lỗi xảy ra, vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    // ===== CSS Variables from selected template =====
    const templateVars = selectedTemplate ? {
        '--sidebar-bg': selectedTemplate.colorScheme.sidebar,
        '--accent-color': selectedTemplate.colorScheme.accent,
        '--accent-light': selectedTemplate.colorScheme.accentLight,
    } as React.CSSProperties : {};

    return (
        <div className={styles.pageShell}>
            {/* Hero */}
            <section className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <div className={styles.heroIcon}>
                        <RobotOutlined />
                    </div>
                    <span className={styles.kicker}>AI CV GENERATOR</span>
                    <h1 className={styles.heroTitle}>
                        Tạo CV chuyên nghiệp{' '}
                        <span className={styles.heroHighlight}>bằng trí tuệ nhân tạo</span>
                    </h1>
                    <p className={styles.heroDesc}>
                        Chọn mẫu → Nhập thông tin → AI tự động tạo CV chuẩn TopCV trong vài giây.
                    </p>
                </div>
            </section>

            {/* Steps */}
            <section className={styles.mainSection}>
                <Steps
                    current={currentStep}
                    className={styles.stepsBar}
                    items={[
                        { title: 'Chọn mẫu CV' },
                        { title: 'Nhập thông tin' },
                        { title: 'Xem & Tải PDF' },
                    ]}
                />

                {/* ========== STEP 1: Template Gallery ========== */}
                {currentStep === 0 && (
                    <div className={styles.gallerySection}>
                        <h2 className={styles.stepTitle}>Chọn một mẫu CV bạn thích ({CV_TEMPLATES.length} mẫu)</h2>
                        <div className={styles.templateGrid}>
                            {CV_TEMPLATES.slice((templatePage - 1) * TEMPLATES_PER_PAGE, templatePage * TEMPLATES_PER_PAGE).map(t => (
                                <div
                                    key={t.id}
                                    className={`${styles.templateCard} ${selectedTemplate?.id === t.id ? styles.templateCardSelected : ''}`}
                                    onClick={() => handleSelectTemplate(t)}
                                >
                                    <div className={styles.templatePreview}>
                                        <img src={t.previewImage} alt={t.name} />
                                        <span className={styles.layoutBadge}>
                                            {t.layout === 'left-sidebar' ? '◧ Sidebar trái' : t.layout === 'right-sidebar' ? '◨ Sidebar phải' : t.layout === 'top-header' ? '▬ Header ngang' : t.layout === 'split-header' ? '⊞ Chia đôi' : '☰ Tối giản'}
                                        </span>
                                    </div>
                                    <div className={styles.templateName}>{t.name}</div>
                                    <div className={styles.templateColors}>
                                        <span style={{ background: t.colorScheme.sidebar }}></span>
                                        <span style={{ background: t.colorScheme.accent }}></span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {CV_TEMPLATES.length > TEMPLATES_PER_PAGE && (
                            <div className={styles.paginationWrap}>
                                <Pagination
                                    current={templatePage}
                                    pageSize={TEMPLATES_PER_PAGE}
                                    total={CV_TEMPLATES.length}
                                    onChange={setTemplatePage}
                                    simple
                                />
                            </div>
                        )}
                        <div className={styles.stepActions}>
                            <Button
                                type="primary"
                                size="large"
                                icon={<ArrowRightOutlined />}
                                disabled={!selectedTemplate}
                                onClick={() => setCurrentStep(1)}
                                className={styles.generateBtn}
                            >
                                Tiếp tục
                            </Button>
                        </div>
                    </div>
                )}

                {/* ========== STEP 2: Structured Form ========== */}
                {currentStep === 1 && (
                    <div className={styles.formSection}>
                        <h2 className={styles.stepTitle}>Nhập thông tin của bạn</h2>

                        {/* Avatar Upload */}
                        <div className={styles.formGroup}>
                            <h3 className={styles.formGroupTitle}><CameraOutlined /> Ảnh đại diện</h3>
                            <div className={styles.avatarUploadArea}>
                                <Upload
                                    showUploadList={false}
                                    beforeUpload={handleAvatarUpload}
                                    accept="image/*"
                                >
                                    {avatarUrl ? (
                                        <div className={styles.avatarPreview}>
                                            <img src={avatarUrl} alt="avatar" />
                                            <span>Đổi ảnh</span>
                                        </div>
                                    ) : (
                                        <div className={styles.avatarUploadBtn}>
                                            <CameraOutlined style={{ fontSize: 28 }} />
                                            <span>Tải ảnh lên</span>
                                        </div>
                                    )}
                                </Upload>
                            </div>
                        </div>

                        {/* Thông tin cá nhân */}
                        <div className={styles.formGroup}>
                            <h3 className={styles.formGroupTitle}><UserOutlined /> Thông tin cá nhân</h3>
                            <div className={styles.formRow}>
                                <div className={styles.formField}>
                                    <label>Họ và tên <span className={styles.required}>*</span></label>
                                    <Input value={formData.name} onChange={e => updateField('name', e.target.value)} placeholder="Nguyễn Văn A" />
                                </div>
                                <div className={styles.formField}>
                                    <label>Vị trí ứng tuyển <span className={styles.required}>*</span></label>
                                    <Input value={formData.jobTitle} onChange={e => updateField('jobTitle', e.target.value)} placeholder="Backend Developer" />
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formField}>
                                    <label>Số điện thoại <span className={styles.required}>*</span></label>
                                    <Input value={formData.phone} onChange={e => updateField('phone', e.target.value)} placeholder="0912 345 678" />
                                </div>
                                <div className={styles.formField}>
                                    <label>Email <span className={styles.required}>*</span></label>
                                    <Input value={formData.email} onChange={e => updateField('email', e.target.value)} placeholder="ten@gmail.com" />
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formField}>
                                    <label>Địa chỉ</label>
                                    <Input value={formData.address} onChange={e => updateField('address', e.target.value)} placeholder="Quận 1, TP.HCM" />
                                </div>
                                <div className={styles.formField}>
                                    <label>Ngày sinh</label>
                                    <Input value={formData.dob} onChange={e => updateField('dob', e.target.value)} placeholder="15/06/1999" />
                                </div>
                            </div>
                        </div>

                        {/* Mục tiêu */}
                        <div className={styles.formGroup}>
                            <h3 className={styles.formGroupTitle}><StarOutlined /> Mục tiêu nghề nghiệp</h3>
                            <TextArea
                                rows={3}
                                value={formData.careerObjective}
                                onChange={e => updateField('careerObjective', e.target.value)}
                                placeholder="Ví dụ: Với 2 năm kinh nghiệm về Java Spring Boot, tôi mong muốn..."
                            />
                        </div>

                        {/* Kinh nghiệm */}
                        <div className={styles.formGroup}>
                            <h3 className={styles.formGroupTitle}><ThunderboltOutlined /> Kinh nghiệm làm việc</h3>
                            {formData.experiences.map((exp, idx) => (
                                <div key={idx} className={styles.dynamicEntry}>
                                    <div className={styles.formRow}>
                                        <div className={styles.formField}>
                                            <label>Vị trí <span className={styles.required}>*</span></label>
                                            <Input value={exp.title} onChange={e => updateExperience(idx, 'title', e.target.value)} placeholder="Java Developer" />
                                        </div>
                                        <div className={styles.formField}>
                                            <label>Công ty <span className={styles.required}>*</span></label>
                                            <Input value={exp.company} onChange={e => updateExperience(idx, 'company', e.target.value)} placeholder="FPT Software" />
                                        </div>
                                        <div className={styles.formField}>
                                            <label>Thời gian</label>
                                            <Input value={exp.timeRange} onChange={e => updateExperience(idx, 'timeRange', e.target.value)} placeholder="03/2022 - Hiện tại" />
                                        </div>
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Mô tả công việc</label>
                                        <TextArea rows={2} value={exp.description} onChange={e => updateExperience(idx, 'description', e.target.value)} placeholder="Phát triển REST API, viết unit test, tối ưu truy vấn SQL..." />
                                    </div>
                                    {formData.experiences.length > 1 && (
                                        <Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => removeExperience(idx)} className={styles.removeBtn}>Xóa</Button>
                                    )}
                                </div>
                            ))}
                            <Button type="dashed" icon={<PlusOutlined />} onClick={addExperience} block>Thêm kinh nghiệm</Button>
                        </div>

                        {/* Kỹ năng */}
                        <div className={styles.formGroup}>
                            <h3 className={styles.formGroupTitle}><BulbOutlined /> Kỹ năng <span className={styles.required}>(tối thiểu 3)</span></h3>
                            <div className={styles.skillsGrid}>
                                {formData.skills.map((skill, idx) => (
                                    <div key={idx} className={styles.skillInputRow}>
                                        <Input value={skill} onChange={e => updateSkill(idx, e.target.value)} placeholder={`Kỹ năng ${idx + 1}`} />
                                        {formData.skills.length > 1 && (
                                            <Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => removeSkill(idx)} size="small" />
                                        )}
                                    </div>
                                ))}
                            </div>
                            <Button type="dashed" icon={<PlusOutlined />} onClick={addSkill} style={{ marginTop: 8 }}>Thêm kỹ năng</Button>
                        </div>

                        {/* Học vấn */}
                        <div className={styles.formGroup}>
                            <h3 className={styles.formGroupTitle}><CheckCircleOutlined /> Học vấn</h3>
                            <div className={styles.formRow}>
                                <div className={styles.formField}>
                                    <label>Trường <span className={styles.required}>*</span></label>
                                    <Input value={formData.eduSchool} onChange={e => updateField('eduSchool', e.target.value)} placeholder="ĐH Bách Khoa TP.HCM" />
                                </div>
                                <div className={styles.formField}>
                                    <label>Ngành <span className={styles.required}>*</span></label>
                                    <Input value={formData.eduMajor} onChange={e => updateField('eduMajor', e.target.value)} placeholder="Kỹ thuật Phần mềm" />
                                </div>
                                <div className={styles.formField}>
                                    <label>Thời gian</label>
                                    <Input value={formData.eduTime} onChange={e => updateField('eduTime', e.target.value)} placeholder="2017 - 2021" />
                                </div>
                            </div>
                            <div className={styles.formField}>
                                <label>Mô tả</label>
                                <Input value={formData.eduDesc} onChange={e => updateField('eduDesc', e.target.value)} placeholder="Tốt nghiệp loại Giỏi, GPA 3.2/4.0" />
                            </div>
                        </div>

                        {/* Sở thích */}
                        <div className={styles.formGroup}>
                            <h3 className={styles.formGroupTitle}><StarOutlined /> Sở thích</h3>
                            <Input value={formData.interests} onChange={e => updateField('interests', e.target.value)} placeholder="Đọc sách, chạy bộ, nghiên cứu công nghệ (cách nhau bởi dấu phẩy)" />
                        </div>

                        {/* Actions */}
                        <div className={styles.stepActions}>
                            <Button size="large" icon={<ArrowLeftOutlined />} onClick={() => setCurrentStep(0)}>Quay lại</Button>
                            <Button
                                type="primary"
                                size="large"
                                icon={<RobotOutlined />}
                                loading={loading}
                                onClick={validateAndGenerate}
                                className={styles.generateBtn}
                            >
                                {loading ? 'AI đang tạo CV...' : 'Tạo CV bằng AI'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* ========== STEP 3: Preview + PDF ========== */}
                {currentStep === 2 && result && (
                    <div className={styles.previewSection}>
                        <div className={styles.previewActions}>
                            <Button size="large" icon={<ArrowLeftOutlined />} onClick={() => setCurrentStep(1)}>Chỉnh sửa lại</Button>
                            <Button size="large" icon={<PrinterOutlined />} onClick={handlePrint} type="primary" className={styles.generateBtn}>Tải PDF</Button>
                        </div>

                        <div
                            className={`${styles.cvResult} ${selectedTemplate?.layout === 'right-sidebar' ? styles.layoutRight : ''} ${selectedTemplate?.layout === 'top-header' ? styles.layoutTop : ''} ${selectedTemplate?.layout === 'split-header' ? styles.layoutSplit : ''} ${selectedTemplate?.layout === 'no-sidebar' ? styles.layoutClean : ''}`}
                            id="cv-result" ref={cvRef} style={templateVars}
                        >
                            {/* Cột trái (Sidebar) */}
                            <aside className={styles.cvSidebar}>
                                <div className={styles.avatarBox}>
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="avatar" className={styles.avatarImg} />
                                    ) : (
                                        <div className={styles.avatarPlaceholder}>
                                            <UserOutlined />
                                        </div>
                                    )}
                                </div>

                                <div className={styles.sidebarSection}>
                                    <div className={styles.sidebarTitle}>Thông tin liên hệ</div>
                                    <div className={styles.contactList}>
                                        {result.personalInfo?.dob && <div className={styles.contactItem}><span>Ngày sinh:</span> {result.personalInfo.dob}</div>}
                                        {result.personalInfo?.phone && <div className={styles.contactItem}><span>Điện thoại:</span> {result.personalInfo.phone}</div>}
                                        {result.personalInfo?.email && <div className={styles.contactItem}><span>Email:</span> {result.personalInfo.email}</div>}
                                        {result.personalInfo?.address && <div className={styles.contactItem}><span>Địa chỉ:</span> {result.personalInfo.address}</div>}
                                    </div>
                                </div>

                                <div className={styles.sidebarSection}>
                                    <div className={styles.sidebarTitle}>Kỹ năng</div>
                                    <div className={styles.skillList}>
                                        {result.skills?.map((skill, idx) => (
                                            <div key={idx} className={styles.skillItem}>
                                                <div className={styles.skillName}>{skill.name}</div>
                                                <div className={styles.skillBarWrapper}>
                                                    <div className={styles.skillBarFill} style={{ width: `${skill.level}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {result.interests && result.interests.length > 0 && (
                                    <div className={styles.sidebarSection}>
                                        <div className={styles.sidebarTitle}>Sở thích</div>
                                        <div className={styles.skillTags}>
                                            {result.interests.map((interest, idx) => (
                                                <Tag key={idx} className={styles.skillTag}>{interest}</Tag>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </aside>

                            {/* Cột phải (Main) */}
                            <main className={styles.cvMain}>
                                <header className={styles.cvHeader}>
                                    <h1 className={styles.cvName}>{result.name}</h1>
                                    <p className={styles.cvJobTitle}>{result.jobTitle}</p>
                                </header>

                                <div className={styles.cvSection}>
                                    <div className={styles.cvSectionTitle}>Mục tiêu nghề nghiệp</div>
                                    <p className={styles.summaryText}>{result.careerObjective}</p>
                                </div>

                                {result.education && result.education.length > 0 && (
                                    <div className={styles.cvSection}>
                                        <div className={styles.cvSectionTitle}>Học vấn</div>
                                        {result.education.map((edu, idx) => (
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

                                {result.experiences && result.experiences.length > 0 && (
                                    <div className={styles.cvSection}>
                                        <div className={styles.cvSectionTitle}>Kinh nghiệm làm việc</div>
                                        {result.experiences.map((exp, idx) => (
                                            <div key={idx} className={styles.entryBlock}>
                                                <div className={styles.entryHeader}>
                                                    <span className={styles.entryTitle}>{exp.title}</span>
                                                    <span className={styles.entryTime}>{exp.timeRange}</span>
                                                </div>
                                                <div className={styles.entrySub}>{exp.company}</div>
                                                <ul className={styles.expBullets}>
                                                    {exp.bullets.map((bullet, bIdx) => (
                                                        <li key={bIdx}>{bullet}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </main>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};

export default CvBuilderPage;

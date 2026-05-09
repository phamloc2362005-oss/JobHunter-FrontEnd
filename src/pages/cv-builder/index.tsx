import { useState, useRef } from 'react';
import { Button, Input, Tag, Spin, message, Tooltip } from 'antd';
import {
    RobotOutlined,
    CopyOutlined,
    BulbOutlined,
    CheckCircleOutlined,
    UserOutlined,
    ThunderboltOutlined,
    StarOutlined,
    PrinterOutlined,
} from '@ant-design/icons';
import { callGenerateCv } from '@/config/api';
import styles from './index.module.scss';
import { useReactToPrint } from 'react-to-print';

const { TextArea } = Input;

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

const CvBuilderPage = () => {
    const [rawInput, setRawInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ICvResult | null>(null);
    const [copied, setCopied] = useState(false);
    const cvRef = useRef<HTMLDivElement>(null);

    const placeholder = `Nhập thông tin thô về bản thân vào đây. Ví dụ:

Tên: Nguyễn Văn A
Vị trí muốn ứng tuyển: Backend Developer

Kinh nghiệm:
- Làm dev Java Spring Boot 2 năm tại FPT Software. Chủ yếu làm REST API, fix bug, viết unit test. Được khen hoàn thành đúng deadline.
- Thực tập 6 tháng tại TMA Solutions. Làm web ReactJS, được mentor hướng dẫn.

Kỹ năng: Java, Spring Boot, MySQL, Docker, Git, ReactJS

Học vấn: Đại học Bách Khoa TP.HCM, ngành CNTT, tốt nghiệp 2023.`;

    const handleGenerate = async () => {
        if (!rawInput.trim()) {
            message.warning('Vui lòng nhập thông tin CV trước khi tạo!');
            return;
        }
        setLoading(true);
        setResult(null);
        try {
            const res: any = await callGenerateCv(rawInput);
            // Kiểm tra xem dữ liệu nằm ở res.data hay res.data.data
            if (res && res.data) {
                const cvData = res.data.data ? res.data.data : res.data;
                setResult(cvData as ICvResult);
                message.success('Đã chuẩn hóa CV thành công!');
            } else {
                message.error('AI không thể tạo CV. Vui lòng thử lại!');
            }
        } catch (err) {
            console.error('Lỗi gọi AI:', err);
            message.error('Có lỗi xảy ra khi gọi AI, vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!result) return;
        const text = `TÓM TẮT BẢN THÂN\n${result.careerObjective}\n\nKINH NGHIỆM LÀM VIỆC\n${result.experiences.map(e =>
            `${e.title} | ${e.company} | ${e.timeRange}\n${e.bullets.map(b => `• ${b}`).join('\n')}`
        ).join('\n\n')}\n\nKỸ NĂNG\n${result.skills.map(s => s.name).join(' • ')}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        message.success('Đã sao chép nội dung CV!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePrint = useReactToPrint({
        contentRef: cvRef,
        documentTitle: `CV_${result?.name || 'TopCV'}`,
    });

    return (
        <div className={styles.pageShell}>
            {/* Hero */}
            <section className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <div className={styles.heroIcon}>
                        <RobotOutlined />
                    </div>
                    <span className={styles.kicker}>AI RESUME BUILDER</span>
                    <h1 className={styles.heroTitle}>
                        Chuẩn hóa CV của bạn<br />
                        <span className={styles.heroHighlight}>bằng trí tuệ nhân tạo</span>
                    </h1>
                    <p className={styles.heroDesc}>
                        Chỉ cần nhập thông tin thô — AI Gemini sẽ tự động bóc tách và viết lại thành một bản CV IT chuyên nghiệp, 
                        súc tích, vừa khít trong một trang A4 duy nhất.
                    </p>
                    <div className={styles.heroBadges}>
                        <span className={styles.badge}><ThunderboltOutlined /> Chỉ vài giây</span>
                        <span className={styles.badge}><StarOutlined /> Chuẩn IT industry</span>
                        <span className={styles.badge}><PrinterOutlined /> Vừa khít 1 trang A4</span>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className={styles.mainSection}>
                <div className={styles.twoCol}>
                    {/* Input Panel */}
                    <div className={styles.inputPanel}>
                        <div className={styles.panelHeader}>
                            <UserOutlined className={styles.panelIcon} />
                            <div>
                                <h2 className={styles.panelTitle}>Thông tin của bạn</h2>
                                <p className={styles.panelDesc}>Nhập tự nhiên, không cần theo form cứng nhắc</p>
                            </div>
                        </div>
                        <TextArea
                            id="cv-raw-input"
                            className={styles.textarea}
                            value={rawInput}
                            onChange={(e) => setRawInput(e.target.value)}
                            placeholder={placeholder}
                            rows={18}
                            maxLength={3000}
                            showCount
                        />
                        <Button
                            id="generate-cv-btn"
                            type="primary"
                            size="large"
                            block
                            loading={loading}
                            onClick={handleGenerate}
                            className={styles.generateBtn}
                            icon={<RobotOutlined />}
                        >
                            {loading ? 'AI đang xử lý...' : '✨ Chuẩn hóa bằng AI'}
                        </Button>
                    </div>

                    {/* Result Panel */}
                    <div className={styles.resultPanel}>
                        <div className={styles.panelHeader}>
                            <RobotOutlined className={styles.panelIcon} style={{ color: '#0ea5e9' }} />
                            <div>
                                <h2 className={styles.panelTitle}>Kết quả từ AI</h2>
                                <p className={styles.panelDesc}>Nội dung đã được chuẩn hóa chuyên nghiệp</p>
                            </div>
                            {result && (
                                <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                                    <Tooltip title={copied ? 'Đã sao chép!' : 'Sao chép toàn bộ'}>
                                        <Button
                                            id="copy-cv-btn"
                                            icon={copied ? <CheckCircleOutlined /> : <CopyOutlined />}
                                            onClick={handleCopy}
                                            className={styles.copyBtn}
                                            type={copied ? 'primary' : 'default'}
                                        >
                                            {copied ? 'Đã sao chép' : 'Sao chép'}
                                        </Button>
                                    </Tooltip>
                                    <Tooltip title="Tải xuống dạng PDF">
                                        <Button
                                            id="download-pdf-btn"
                                            icon={<PrinterOutlined />}
                                            onClick={handlePrint}
                                            className={styles.printBtn}
                                        >
                                            Tải PDF
                                        </Button>
                                    </Tooltip>
                                </div>
                            )}
                        </div>

                        {loading && (
                            <div className={styles.loadingBox}>
                                <Spin size="large" />
                                <p>AI đang đọc và chuẩn hóa CV của bạn...</p>
                            </div>
                        )}

                        {!loading && !result && (
                            <div className={styles.emptyBox}>
                                <RobotOutlined className={styles.emptyIcon} />
                                <p>Kết quả sẽ hiển thị ở đây sau khi bạn nhấn "Chuẩn hóa bằng AI"</p>
                            </div>
                        )}

                        {!loading && result && (
                            <div className={styles.cvResult} id="cv-result" ref={cvRef}>
                                {/* Cột trái (Sidebar) */}
                                <aside className={styles.cvSidebar}>
                                    <div className={styles.avatarBox}>
                                        <div className={styles.avatarPlaceholder}>
                                            <UserOutlined />
                                        </div>
                                    </div>
                                    
                                    {/* THÔNG TIN LIÊN HỆ */}
                                    <div className={styles.sidebarSection}>
                                        <div className={styles.sidebarTitle}>
                                            <UserOutlined /> Thông tin liên hệ
                                        </div>
                                        <div className={styles.contactList}>
                                            {result.personalInfo?.dob && <div className={styles.contactItem}><span>Ngày sinh:</span> {result.personalInfo.dob}</div>}
                                            {result.personalInfo?.gender && <div className={styles.contactItem}><span>Giới tính:</span> {result.personalInfo.gender}</div>}
                                            {result.personalInfo?.phone && <div className={styles.contactItem}><span>Điện thoại:</span> {result.personalInfo.phone}</div>}
                                            {result.personalInfo?.email && <div className={styles.contactItem}><span>Email:</span> {result.personalInfo.email}</div>}
                                            {result.personalInfo?.address && <div className={styles.contactItem}><span>Địa chỉ:</span> {result.personalInfo.address}</div>}
                                        </div>
                                    </div>



                                    {/* KỸ NĂNG (PROGRESS BAR) */}
                                    <div className={styles.sidebarSection}>
                                        <div className={styles.sidebarTitle}>
                                            <BulbOutlined /> Kỹ năng
                                        </div>
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

                                    {/* SỞ THÍCH */}
                                    {result.interests && result.interests.length > 0 && (
                                        <div className={styles.sidebarSection}>
                                            <div className={styles.sidebarTitle}>
                                                <CheckCircleOutlined /> Sở thích
                                            </div>
                                            <div className={styles.skillTags}>
                                                {result.interests.map((interest, idx) => (
                                                    <Tag key={idx} className={styles.skillTag}>{interest}</Tag>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </aside>

                                {/* Cột phải (Main Content) */}
                                <main className={styles.cvMain}>
                                    <header className={styles.cvHeader}>
                                        <h1 className={styles.cvName}>{result.name}</h1>
                                        <p className={styles.cvJobTitle}>{result.jobTitle}</p>
                                    </header>

                                    {/* MỤC TIÊU NGHỀ NGHIỆP */}
                                    <div className={styles.cvSection}>
                                        <div className={styles.cvSectionTitle}>
                                            <StarOutlined /> Mục tiêu nghề nghiệp
                                        </div>
                                        <p className={styles.summaryText}>{result.careerObjective}</p>
                                    </div>

                                    {/* HỌC VẤN */}
                                    {result.education && result.education.length > 0 && (
                                        <div className={styles.cvSection}>
                                            <div className={styles.cvSectionTitle}>
                                                <StarOutlined /> Học vấn
                                            </div>
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

                                    {/* KINH NGHIỆM */}
                                    {result.experiences && result.experiences.length > 0 && (
                                        <div className={styles.cvSection}>
                                            <div className={styles.cvSectionTitle}>
                                                <ThunderboltOutlined /> Kinh nghiệm làm việc
                                            </div>
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
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CvBuilderPage;

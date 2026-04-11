import { useEffect, useState } from 'react';
import type { IJob } from '@/types/backend';
import JobDetailBulletSection from './job-detail-bullet-section';
import styles from './job-detail-highlights.module.scss';

export type JobHighlightsData = {
    skills: string[];
    benefits: string[];
    /** HTML từ rich text editor (Quill); ưu tiên hiển thị thay cho danh sách bullet. */
    skillsRichHtml: string | null;
    benefitsRichHtml: string | null;
};

type JobDetailHighlightsProps = {
    /** Job đã load từ API ở trang detail (tránh gọi API trùng). */
    job: IJob | null;
};

const SECTION_SKILLS = 'Your skills and experience';
const SECTION_BENEFITS = "Why you'll love working here";

const shouldRenderAsRichHtml = (value: unknown): value is string => {
    if (typeof value !== "string") return false;
    const t = value.trim();
    if (!t || !t.includes("<")) return false;
    return /<(p|ul|ol|h[1-6]|div)\b/i.test(t);
};

/**
 * Maps job API payload to { skills, benefits } bullet lists.
 * Hỗ trợ thêm field từ API sau này: skillRequirementLines / benefitLines hoặc skills/benefits là string[].
 * (Không dùng skills: ISkill[] làm bullet — chỉ khi phần tử là string.)
 */
export function mapJobToHighlights(job: IJob): JobHighlightsData {
    const parseTextToBullets = (value: unknown): string[] => {
        if (!value) return [];

        if (Array.isArray(value)) {
            return value
                .map((item) => `${item}`.trim())
                .filter(Boolean);
        }

        if (typeof value !== "string") return [];
        const text = value.trim();
        if (!text) return [];

        // Support JSON string array from backend: ["a","b"]
        if (text.startsWith("[") && text.endsWith("]")) {
            try {
                const parsed = JSON.parse(text);
                if (Array.isArray(parsed)) {
                    return parsed
                        .map((item) => `${item}`.trim())
                        .filter(Boolean);
                }
            } catch {
                // fallback to normal split below
            }
        }

        // Support html content from backend (<li>, <p>, etc.)
        if (/<[^>]+>/i.test(text)) {
            const normalized = text
                .replace(/<\/(p|div|li|br)\s*>/gi, "\n")
                .replace(/<[^>]+>/g, " ")
                .replace(/&nbsp;/gi, " ");
            return normalized
                .split(/\r?\n|;/)
                .map((item) => item.trim())
                .filter(Boolean);
        }

        // Support html list content from backend
        if (/<li[\s>]/i.test(text)) {
            return text
                .split(/<li[^>]*>|<\/li>/gi)
                .map((item) => item.replace(/<[^>]+>/g, "").trim())
                .filter(Boolean);
        }

        return text
            .split(/\r?\n|;/)
            .map((item) => item.trim())
            .filter(Boolean);
    };

    const rawJob = job as unknown as Record<string, unknown>;
    const rawRequired =
        job.required
        ?? rawJob.requireds
        ?? rawJob.requirements
        ?? rawJob.skillRequirements
        ?? rawJob.skillRequirementLines;
    const rawBenefit =
        job.benefit
        ?? rawJob.benefits
        ?? rawJob.welfare
        ?? rawJob.benefitLines;

    const skillsRichHtml = shouldRenderAsRichHtml(rawRequired) ? rawRequired.trim() : null;
    const benefitsRichHtml = shouldRenderAsRichHtml(rawBenefit) ? rawBenefit.trim() : null;

    const skills = skillsRichHtml ? [] : parseTextToBullets(rawRequired);
    const benefits = benefitsRichHtml ? [] : parseTextToBullets(rawBenefit);

    return { skills, benefits, skillsRichHtml, benefitsRichHtml };
}

/**
 * Đồng bộ bullet sections từ dữ liệu job (đã lấy bằng API ở parent).
 */
const JobDetailHighlights = ({ job }: JobDetailHighlightsProps) => {
    const [data, setData] = useState<JobHighlightsData | null>(null);

    useEffect(() => {
        if (!job?.id) {
            setData(null);
            return;
        }
        setData(mapJobToHighlights(job));
    }, [job]);

    if (!job?.id) {
        return null;
    }

    if (!data) {
        return null;
    }

    return (
        <div className={styles.root}>
            <JobDetailBulletSection
                sectionId="skills"
                title={SECTION_SKILLS}
                items={data.skills}
                richHtml={data.skillsRichHtml}
            />
            <JobDetailBulletSection
                sectionId="benefits"
                title={SECTION_BENEFITS}
                items={data.benefits}
                richHtml={data.benefitsRichHtml}
            />
        </div>
    );
};

export default JobDetailHighlights;

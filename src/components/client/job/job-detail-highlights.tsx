import { useEffect, useState } from 'react';
import type { IJob } from '@/types/backend';
import JobDetailBulletSection from './job-detail-bullet-section';
import styles from './job-detail-highlights.module.scss';

export type JobHighlightsData = {
    skills: string[];
    benefits: string[];
};

type JobDetailHighlightsProps = {
    /** Job đã load từ API ở trang detail (tránh gọi API trùng). */
    job: IJob | null;
};

const SECTION_SKILLS = 'Your skills and experience';
const SECTION_BENEFITS = "Why you'll love working here";

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
    const skills = parseTextToBullets(
        job.required
        ?? rawJob.requireds
        ?? rawJob.requirements
        ?? rawJob.skillRequirements
        ?? rawJob.skillRequirementLines
    );
    const benefits = parseTextToBullets(
        job.benefit
        ?? rawJob.benefits
        ?? rawJob.welfare
        ?? rawJob.benefitLines
    );

    return { skills, benefits };
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
            <JobDetailBulletSection sectionId="skills" title={SECTION_SKILLS} items={data.skills} />
            <JobDetailBulletSection sectionId="benefits" title={SECTION_BENEFITS} items={data.benefits} />
        </div>
    );
};

export default JobDetailHighlights;

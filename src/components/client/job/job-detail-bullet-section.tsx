import styles from './job-detail-highlights.module.scss';

type JobDetailBulletSectionProps = {
    sectionId: string;
    title: string;
    items: string[];
    emptyText?: string;
};

/**
 * Single titled section with a simple bullet list.
 */
const JobDetailBulletSection = ({ sectionId, title, items, emptyText = "Chưa cập nhật" }: JobDetailBulletSectionProps) => {
    const headingId = `job-detail-${sectionId}`;

    return (
        <section className={styles.section} aria-labelledby={headingId}>
            <h2 id={headingId} className={styles.sectionTitle}>
                {title}
            </h2>
            {items?.length ? (
                <ul className={styles.bulletList}>
                    {items.map((text, index) => (
                        <li key={`${sectionId}-${index}-${text.slice(0, 24)}`} className={styles.bulletItem}>
                            {text}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className={styles.muted}>{emptyText}</p>
            )}
        </section>
    );
};

export default JobDetailBulletSection;

import { useState, useEffect } from 'react';
import { Spin, Empty, Row, Col } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { callFetchExpertiseCategories, callFetchExpertiseByCategory } from '@/config/api';
import { IExpertise, IExpertiseCategory } from '@/types/backend';
import { useNavigate } from 'react-router-dom';
import styles from './expertise-summary.module.scss';

const ExpertiseSummary = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<IExpertiseCategory[]>([]);
    const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
    const [expertises, setExpertises] = useState<{ [key: string]: IExpertise[] }>({});
    const [loadingCategories, setLoadingCategories] = useState<{ [key: string]: boolean }>({});
    const [isLoadingInitial, setIsLoadingInitial] = useState(true);

    // Load categories on mount
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await callFetchExpertiseCategories();
                const categoryResult = Array.isArray(res?.data?.result) ? res.data.result : [];
                if (categoryResult.length) {
                    setCategories(categoryResult);
                }
            } catch (error) {
                console.error('Error loading expertise categories:', error);
            } finally {
                setIsLoadingInitial(false);
            }
        };

        loadCategories();
    }, []);

    // Load expertise data for specific category
    const loadExpertiseData = async (categoryId: string) => {
        setLoadingCategories(prev => ({ ...prev, [categoryId]: true }));

        try {
            const res = await callFetchExpertiseByCategory(categoryId);
            const expertiseResult = Array.isArray(res?.data?.result) ? res.data.result : [];
            if (Array.isArray(expertiseResult)) {
                setExpertises(prev => ({
                    ...prev,
                    [categoryId]: expertiseResult
                }));
            }
        } catch (error) {
            console.error(`Error loading expertise for category ${categoryId}:`, error);
        } finally {
            setLoadingCategories(prev => ({ ...prev, [categoryId]: false }));
        }
    };

    // Handle toggle category
    const handleToggle = async (categoryId: string) => {
        if (expandedCategoryId === categoryId) {
            // Collapse
            setExpandedCategoryId(null);
        } else {
            // Expand
            setExpandedCategoryId(categoryId);

            // Lazy load expertise if not cached
            if (!expertises[categoryId]) {
                await loadExpertiseData(categoryId);
            }
        }
    };

    // Render category item
    const renderCategoryItem = (category: IExpertiseCategory) => {
        const categoryId = category.id ?? "";
        const isExpanded = expandedCategoryId === categoryId;
        const categoryExpertises = expertises[categoryId] || [];
        const isLoading = loadingCategories[categoryId] || false;

        return (
            <div key={categoryId} className={styles.categoryCard}>
                <button
                    type="button"
                    className={styles.categoryButton}
                    onClick={() => categoryId && handleToggle(categoryId)}
                >
                    <div>
                        <h4 className={styles.categoryName}>{category.name}</h4>
                        <div className={styles.categoryMeta}>
                            {categoryExpertises.length} chuyên môn
                        </div>
                    </div>
                    <span className={styles.toggleIcon}>
                        {isExpanded ? <MinusOutlined /> : <PlusOutlined />}
                    </span>
                </button>

                {isExpanded && (
                    <div className={styles.expandedPanel}>
                        <Spin spinning={isLoading}>
                            {categoryExpertises.length === 0 && !isLoading ? (
                                <div className={styles.emptyBlock}>
                                    <Empty description="No expertise available" />
                                </div>
                            ) : (
                                <div className={styles.expertiseGrid}>
                                    {categoryExpertises.map((expertise: IExpertise) => (
                                        <span
                                            key={expertise.id}
                                            className={styles.expertiseChip}
                                            onClick={() => {
                                                if (expertise.id) {
                                                    navigate(`/job?expertiseId=${encodeURIComponent(expertise.id)}`);
                                                }
                                            }}
                                        >
                                            {expertise.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </Spin>
                    </div>
                )}
            </div>
        );
    };

    // Split categories into 2 columns
    const midPoint = Math.ceil(categories.length / 2);
    const leftCategories = categories.slice(0, midPoint);
    const rightCategories = categories.slice(midPoint);

    if (isLoadingInitial) {
        return (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <Spin />
            </div>
        );
    }

    return (
        <div className={styles.summaryShell}>
            <div className={styles.summaryHeader}>
                <div>
                    <span className={styles.kicker}>Career maps</span>
                    <h2 className={styles.title}>IT Expertise Summary</h2>
                    <p className={styles.subtitle}>
                        Khám phá các nhóm chuyên môn để đi thẳng đến những job phù hợp nhất.
                    </p>
                </div>
            </div>

            <Row gutter={[20, 20]}>
                {/* Left Column */}
                <Col xs={24} lg={12}>
                    <div className={styles.columnWrap}>
                        {leftCategories.map(category => renderCategoryItem(category))}
                    </div>
                </Col>

                {/* Right Column */}
                <Col xs={24} lg={12}>
                    <div className={styles.columnWrap}>
                        {rightCategories.map(category => renderCategoryItem(category))}
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default ExpertiseSummary;


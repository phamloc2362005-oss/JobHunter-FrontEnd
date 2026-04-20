import { useState, useEffect } from 'react';
import { Spin, Empty, Row, Col } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { callFetchExpertiseCategories, callFetchExpertiseByCategory } from '@/config/api';
import styles from 'styles/client.module.scss';
import { IExpertise, IExpertiseCategory } from '@/types/backend';
import { useNavigate } from 'react-router-dom';

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
            <div key={categoryId} style={{ marginBottom: '12px' }}>
                <div
                    onClick={() => categoryId && handleToggle(categoryId)}
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px',
                        backgroundColor: isExpanded ? '#fafafa' : '#ffffff',
                        border: '1px solid #e8e8e8',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        userSelect: 'none',
                        transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: '#262626' }}>
                        {category.name}
                    </h4>
                    <span style={{ color: '#1890ff', fontSize: '14px' }}>
                        {isExpanded ? <MinusOutlined /> : <PlusOutlined />}
                    </span>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                    <div
                        style={{
                            padding: '16px',
                            backgroundColor: '#fafafa',
                            border: '1px solid #e8e8e8',
                            borderTop: 'none',
                            borderRadius: '0 0 8px 8px',
                            marginTop: '-1px',
                        }}
                    >
                        <Spin spinning={isLoading}>
                            {categoryExpertises.length === 0 && !isLoading ? (
                                <Empty description="No expertise available" style={{ margin: '20px 0' }} />
                            ) : (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {categoryExpertises.map((expertise: IExpertise) => (
                                        <span
                                            key={expertise.id}
                                            style={{
                                                display: 'inline-block',
                                                padding: '6px 12px',
                                                backgroundColor: '#e6f7ff',
                                                border: '1px solid #91d5ff',
                                                borderRadius: '4px',
                                                fontSize: '13px',
                                                color: '#0050b3',
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => {
                                                if (expertise.id) {
                                                    navigate(`/job?expertise=${encodeURIComponent(expertise.id)}&source=expertise-summary`);
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
        <div style={{ padding: '40px 0' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '32px', textAlign: 'center' }}>
                IT Expertise Summary
            </h2>

            <Row gutter={[32, 0]}>
                {/* Left Column */}
                <Col xs={24} lg={12}>
                    <div>
                        {leftCategories.map(category => renderCategoryItem(category))}
                    </div>
                </Col>

                {/* Right Column */}
                <Col xs={24} lg={12}>
                    <div>
                        {rightCategories.map(category => renderCategoryItem(category))}
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default ExpertiseSummary;


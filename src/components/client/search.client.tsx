import { Button, Col, Form, Row, Select } from 'antd';
import { EnvironmentOutlined, MonitorOutlined, SearchOutlined } from '@ant-design/icons';
import { LOCATION_LIST } from '@/config/utils';
import { ProForm } from '@ant-design/pro-components';
import { useEffect, useState } from 'react';
import { callFetchAllSkill, callFetchCompany } from '@/config/api';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ICompany } from '@/types/backend';

const SearchClient = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const optionsLocations = LOCATION_LIST;
    const [form] = Form.useForm();
    const [optionsSkills, setOptionsSkills] = useState<{
        label: string;
        value: string;
    }[]>([]);
    const [optionsCompanies, setOptionsCompanies] = useState<{
        label: string;
        value: string;
    }[]>([]);

    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        if (location.search) {
            const queryLocation = searchParams.get("location");
            const querySkills = searchParams.get("skills")
            const queryCompanyIds = searchParams.get("companyIds")
            if (queryLocation) {
                form.setFieldValue("location", queryLocation.split(","))
            }
            if (querySkills) {
                form.setFieldValue("skills", querySkills.split(","))
            }
            if (queryCompanyIds) {
                form.setFieldValue("companyIds", queryCompanyIds.split(","))
            }
        }
    }, [location.search])

    useEffect(() => {
        fetchSkill();
        fetchCompany();
    }, [])

    const fetchSkill = async () => {
        let query = `page=1&size=100&sort=createdAt,desc`;

        const res = await callFetchAllSkill(query);
        if (res && res.data) {
            const arr = res?.data?.result?.map(item => {
                return {
                    label: item.name as string,
                    value: item.id + "" as string
                }
            }) ?? [];
            setOptionsSkills(arr);
        }
    }

    const fetchCompany = async () => {
        let query = `page=1&size=1000&sort=updatedAt,desc`;

        const res = await callFetchCompany(query);
        if (res && res.data) {
            const arr = res?.data?.result?.map((item: ICompany) => {
                return {
                    label: item.name as string,
                    value: item.id + "" as string
                }
            }) ?? [];
            setOptionsCompanies(arr);
        }
    }

    const onFinish = async (values: any) => {
        let query = "";
        if (values?.location?.length) {
            query = `location=${values?.location?.join(",")}`;
        }
        if (values?.skills?.length) {
            query = values.location?.length ? query + `&skills=${values?.skills?.join(",")}`
                :
                `skills=${values?.skills?.join(",")}`;
        }
        if (values?.companyIds?.length) {
            query = query ? query + `&companyIds=${values?.companyIds?.join(",")}`
                : `companyIds=${values?.companyIds?.join(",")}`;
        }

        if (!query) {
            navigate('/job');
            return;
        }
        navigate(`/job?${query}`);
    }

    return (
        <div className="search-client">
            <h1 style={{ color: '#fff', textAlign: 'center', marginBottom: '8px' }}>Tìm job IT đúng stack, đúng level</h1>
            <p className="search-client-description" style={{ color: 'rgba(255, 255, 255, 0.8)', textAlign: 'center', marginBottom: '32px' }}>
                Chọn kỹ năng, công ty và địa điểm để lọc ra danh sách việc làm sát với profile của bạn.
            </p>
            <ProForm
                form={form}
                onFinish={onFinish}
                submitter={{ render: () => <></> }}
            >
                <Row gutter={[8, 8]} align="middle" className="itviec-search-wrapper">
                    <Col span={24} md={6}>
                        <ProForm.Item name="location" style={{ marginBottom: 0 }}>
                            <Select
                                mode="multiple"
                                allowClear
                                showArrow={false}
                                style={{ width: '100%' }}
                                placeholder={
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <EnvironmentOutlined style={{ color: '#555' }} /> Địa điểm...
                                    </span>
                                }
                                optionLabelProp="label"
                                options={optionsLocations}
                                className="itviec-select"
                            />
                        </ProForm.Item>
                    </Col>
                    <Col span={24} md={14}>
                        <ProForm.Item name="skills" style={{ marginBottom: 0 }}>
                            <Select
                                mode="multiple"
                                allowClear
                                showArrow={false}
                                style={{ width: '100%' }}
                                placeholder="Nhập kỹ năng, kỹ thuật (Java, React, Node.js...)"
                                optionLabelProp="label"
                                options={optionsSkills}
                                className="itviec-select"
                            />
                        </ProForm.Item>
                    </Col>
                    <Col span={24} md={4}>
                        <Button
                            type='primary'
                            icon={<SearchOutlined style={{ fontSize: '18px' }} />}
                            onClick={() => form.submit()}
                            className="itviec-button"
                        >
                            Tìm kiếm
                        </Button>
                    </Col>
                </Row>
            </ProForm>
        </div>
    )
}
export default SearchClient;
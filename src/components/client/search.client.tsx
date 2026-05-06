import { Button, Col, Form, Row, Select, notification } from 'antd';
import { EnvironmentOutlined, MonitorOutlined } from '@ant-design/icons';
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
            notification.error({
                message: 'Có lỗi xảy ra',
                description: "Vui lòng chọn tiêu chí để search"
            });
            return;
        }
        navigate(`/job?${query}`);
    }

    return (
        <div className="search-client">
            <h1>Việc Làm IT Cho Developer "Chất"</h1>
            <ProForm
                form={form}
                onFinish={onFinish}
                submitter={
                    {
                        render: () => <></>
                    }
                }
            >
                <Row gutter={[12, 12]} align="middle">
                    <Col span={24} md={8} style={{ flex: 1 }}>
                        <ProForm.Item
                            name="skills"
                            style={{ marginBottom: 0 }}
                        >
                            <Select
                                mode="multiple"
                                allowClear
                                suffixIcon={null}
                                style={{ width: '100%' }}
                                placeholder={
                                    <>
                                        <MonitorOutlined /> Tìm theo kỹ năng...
                                    </>
                                }
                                optionLabelProp="label"
                                options={optionsSkills}
                            />
                        </ProForm.Item>
                    </Col>
                    <Col span={24} md={8} style={{ flex: 1 }}>
                        <ProForm.Item
                            name="companyIds"
                            style={{ marginBottom: 0 }}
                        >
                            <Select
                                mode="multiple"
                                allowClear
                                suffixIcon={null}
                                style={{ width: '100%' }}
                                placeholder={
                                    <>
                                        <MonitorOutlined /> Công ty...
                                    </>
                                }
                                optionLabelProp="label"
                                options={optionsCompanies}
                            />
                        </ProForm.Item>
                    </Col>
                    <Col span={24} md={8} style={{ flex: 1 }}>
                        <ProForm.Item
                            name="location"
                            style={{ marginBottom: 0 }}
                        >
                            <Select
                                mode="multiple"
                                allowClear
                                suffixIcon={null}
                                style={{ width: '100%' }}
                                placeholder={
                                    <>
                                        <EnvironmentOutlined /> Địa điểm...
                                    </>
                                }
                                optionLabelProp="label"
                                options={optionsLocations}
                            />
                        </ProForm.Item>
                    </Col>
                    <Col span={24} className="search-actions" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button type='primary' onClick={() => form.submit()}>Tìm kiếm</Button>
                    </Col>
                </Row>
            </ProForm>
        </div>
    )
}
export default SearchClient;
import DataTable from "@/components/client/data-table";
import {
    callCreateExpertise,
    callDeleteExpertise,
    callFetchExpertise,
    callFetchExpertiseCategories,
    callUpdateExpertise,
} from "@/config/api";
import { IExpertise, IExpertiseCategory, IModelPaginate } from "@/types/backend";
import { ActionType, ModalForm, ProColumns, ProFormSelect, ProFormText } from "@ant-design/pro-components";
import { DeleteOutlined, EditOutlined, PlusOutlined, TagsOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Popconfirm, Row, Space, Statistic, message, notification } from "antd";
import dayjs from "dayjs";
import queryString from "query-string";
import { sfLike } from "spring-filter-query-builder";
import { useEffect, useMemo, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import styles from "styles/admin.module.scss";

const ExpertisePage = () => {
    const tableRef = useRef<ActionType>();
    const [form] = Form.useForm();
    const [openModal, setOpenModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState<IExpertise[]>([]);
    const [categories, setCategories] = useState<IExpertiseCategory[]>([]);
    const [dataInit, setDataInit] = useState<IExpertise | null>(null);
    const [meta, setMeta] = useState<IModelPaginate<IExpertise>["meta"]>({
        page: 1,
        pageSize: 10,
        pages: 0,
        total: 0,
    });

    const categoryOptions = useMemo(
        () => categories.map((item) => ({ label: item.name, value: item.id })),
        [categories]
    );

    const reloadTable = () => tableRef.current?.reload();

    const loadCategories = async () => {
        const res = await callFetchExpertiseCategories();
        setCategories(res?.data?.result ?? []);
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleReset = () => {
        form.resetFields();
        setDataInit(null);
        setOpenModal(false);
    };

    const buildQuery = (params: any, sort: any) => {
        const q: Record<string, any> = {
            page: params.current,
            size: params.pageSize,
        };

        const filters: string[] = [];
        if (params.name) filters.push(sfLike("name", params.name).toString());
        if (params.categoryId) filters.push(`expertiseCategory.id:${params.categoryId}`);
        if (filters.length) q.filter = filters.join(" and ");

        let temp = queryString.stringify(q);
        let sortBy = "sort=updatedAt,desc";

        if (sort?.name) sortBy = `sort=name,${sort.name === "ascend" ? "asc" : "desc"}`;
        if (sort?.createdAt) sortBy = `sort=createdAt,${sort.createdAt === "ascend" ? "asc" : "desc"}`;
        if (sort?.updatedAt) sortBy = `sort=updatedAt,${sort.updatedAt === "ascend" ? "asc" : "desc"}`;

        return `${temp}&${sortBy}`;
    };

    const fetchExpertises = async (params: any, sort: any) => {
        setLoading(true);
        const query = buildQuery(params, sort);
        try {
            const res = await callFetchExpertise(query);
            const payload = res?.data;

            setDataSource(payload?.result ?? []);
            setMeta(payload?.meta ?? {
                page: 1,
                pageSize: params.pageSize ?? 10,
                pages: 0,
                total: 0,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id?: string) => {
        if (!id) return;

        const res = await callDeleteExpertise(id);
        if (res && +res.statusCode === 200) {
            message.success("Xóa vị trí/kỹ năng thành công");
            reloadTable();
            return;
        }

        notification.error({
            message: "Có lỗi xảy ra",
            description: (res as any)?.error ?? res.message,
        });
    };

    const handleSubmit = async (values: { name: string; categoryId: string }) => {
        setSubmitting(true);
        try {
            const res = dataInit?.id
                ? await callUpdateExpertise(dataInit.id, values.name.trim(), values.categoryId)
                : await callCreateExpertise(values.name.trim(), values.categoryId);

            if (res?.data) {
                message.success(dataInit?.id ? "Cập nhật vị trí/kỹ năng thành công" : "Thêm mới vị trí/kỹ năng thành công");
                handleReset();
                reloadTable();
                return true;
            }

            notification.error({
                message: "Có lỗi xảy ra",
                description: (res as any)?.error ?? res.message,
            });
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    const columns: ProColumns<IExpertise>[] = [
        {
            title: "STT",
            key: "index",
            width: 60,
            align: "center",
            hideInSearch: true,
            render: (_value, _entity, index) => (index + 1) + (meta.page - 1) * meta.pageSize,
        },
        {
            title: "Name",
            dataIndex: "name",
            sorter: true,
        },
        {
            title: "Lĩnh vực",
            dataIndex: "categoryId",
            valueType: "select",
            fieldProps: {
                options: categoryOptions,
                showSearch: true,
                optionFilterProp: "label",
            },
            render: (_value, entity) => entity.expertiseCategory?.name ?? "",
        },
        {
            title: "Người tạo",
            dataIndex: "createdBy",
            hideInSearch: true,
        },
        {
            title: "Người cập nhật",
            dataIndex: "updatedBy",
            hideInSearch: true,
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            sorter: true,
            hideInSearch: true,
            width: 180,
            render: (_, entity) => entity.createdAt ? dayjs(entity.createdAt).format("DD-MM-YYYY HH:mm:ss") : "",
        },
        {
            title: "Ngày cập nhật",
            dataIndex: "updatedAt",
            sorter: true,
            hideInSearch: true,
            width: 180,
            render: (_, entity) => entity.updatedAt ? dayjs(entity.updatedAt).format("DD-MM-YYYY HH:mm:ss") : "",
        },
        {
            title: "Thao tác",
            hideInSearch: true,
            width: 90,
            render: (_value, entity) => (
                <Space>
                    <EditOutlined
                        style={{ fontSize: 18, color: "#faad14" }}
                        onClick={() => {
                            setDataInit(entity);
                            form.setFieldsValue({
                                name: entity.name,
                                categoryId: entity.expertiseCategory?.id,
                            });
                            setOpenModal(true);
                        }}
                    />
                    <Popconfirm
                        placement="leftTop"
                        title="Xác nhận xóa chuyên môn"
                        description="Bạn có chắc chắn muốn xóa chuyên môn này?"
                        onConfirm={() => handleDelete(entity.id)}
                        okText="Xác nhận"
                        cancelText="Hủy"
                    >
                        <DeleteOutlined style={{ fontSize: 18, color: "#ff4d4f" }} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={16}>
                    <Card className={styles["admin-title-card"]}>
                        <Row gutter={20} align="middle">
                            <Col xs={24} sm="auto">
                                <div className={styles["card-icon"]}>
                                    <TagsOutlined />
                                </div>
                            </Col>
                            <Col xs={24} sm="auto" flex={1}>
                                <div>
                                    <h2 className={styles["card-title"]}>Quản lý Vị trí/Kỹ năng IT</h2>
                                    <p className={styles["card-subtitle"]}>Quản lý danh sách vị trí/kỹ năng theo lĩnh vực để dữ liệu hiển thị đồng bộ ở trang IT Expertise Summary.</p>
                                </div>
                            </Col>
                        </Row>
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card className={styles["stat-card"]} style={{ borderLeft: "4px solid #4078ff" }}>
                        <Statistic
                            title="TỔNG VỊ TRÍ/KỸ NĂNG"
                            value={meta.total || 0}
                            prefix={<TagsOutlined style={{ marginRight: 8 }} />}
                            valueStyle={{ color: "#4078ff", fontSize: 32, fontWeight: 700 }}
                        />
                    </Card>
                </Col>
            </Row>

            <DataTable<IExpertise>
                actionRef={tableRef}
                headerTitle="Danh sách Vị trí/Kỹ năng IT"
                rowKey="id"
                loading={loading}
                columns={columns}
                dataSource={dataSource}
                request={async (params, sort) => {
                    await fetchExpertises(params, sort);
                    return { data: [], success: true };
                }}
                scroll={{ x: true }}
                pagination={{
                    current: meta.page,
                    pageSize: meta.pageSize,
                    showSizeChanger: true,
                    total: meta.total,
                    showTotal: (total, range) => <div>{range[0]}-{range[1]} trên {total} bản ghi</div>,
                }}
                rowSelection={false}
                toolBarRender={() => [
                    <Button
                        key="create"
                        icon={<PlusOutlined />}
                        type="primary"
                        onClick={() => {
                            form.resetFields();
                            setDataInit(null);
                            setOpenModal(true);
                        }}
                    >
                        Thêm mới
                    </Button>,
                ]}
            />

            <ModalForm
                title={dataInit?.id ? "Cập nhật vị trí/kỹ năng" : "Tạo mới vị trí/kỹ năng"}
                open={openModal}
                form={form}
                onFinish={handleSubmit}
                submitter={{ submitButtonProps: { loading: submitting } }}
                initialValues={dataInit ? { name: dataInit.name, categoryId: dataInit.expertiseCategory?.id } : {}}
                modalProps={{
                    onCancel: handleReset,
                    afterClose: handleReset,
                    destroyOnClose: true,
                    width: isMobile ? "100%" : 560,
                    keyboard: false,
                    maskClosable: false,
                    okText: dataInit?.id ? "Cập nhật" : "Tạo mới",
                    cancelText: "Hủy",
                }}
            >
                <ProFormText
                    name="name"
                    label="Tên vị trí/kỹ năng"
                    placeholder="Nhập tên vị trí/kỹ năng"
                    rules={[
                        { required: true, message: "Vui lòng nhập tên vị trí/kỹ năng" },
                        { min: 2, message: "Tên vị trí/kỹ năng phải có ít nhất 2 ký tự" },
                        { max: 100, message: "Tên vị trí/kỹ năng không được vượt quá 100 ký tự" },
                    ]}
                />

                <ProFormSelect
                    name="categoryId"
                    label="Lĩnh vực"
                    placeholder="Chọn lĩnh vực"
                    options={categoryOptions}
                    fieldProps={{
                        showSearch: true,
                        optionFilterProp: "label",
                    }}
                    rules={[{ required: true, message: "Vui lòng chọn lĩnh vực" }]}
                />
            </ModalForm>
        </div>
    );
};

export default ExpertisePage;

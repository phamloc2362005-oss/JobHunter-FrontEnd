import DataTable from "@/components/client/data-table";
import { callCreateExpertiseCategory, callDeleteExpertiseCategory, callFetchExpertiseCategory, callUpdateExpertiseCategory } from "@/config/api";
import { IExpertiseCategory, IModelPaginate } from "@/types/backend";
import { ActionType, ModalForm, ProColumns, ProFormText } from "@ant-design/pro-components";
import { ClusterOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Popconfirm, Row, Space, Statistic, message, notification } from "antd";
import dayjs from "dayjs";
import queryString from "query-string";
import { sfLike } from "spring-filter-query-builder";
import { useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import styles from "styles/admin.module.scss";

const ExpertiseCategoryPage = () => {
    const tableRef = useRef<ActionType>();
    const [form] = Form.useForm();
    const [openModal, setOpenModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState<IExpertiseCategory[]>([]);
    const [dataInit, setDataInit] = useState<IExpertiseCategory | null>(null);
    const [meta, setMeta] = useState<IModelPaginate<IExpertiseCategory>["meta"]>({
        page: 1,
        pageSize: 10,
        pages: 0,
        total: 0,
    });

    const reloadTable = () => tableRef.current?.reload();

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

        if (params.name) {
            q.filter = sfLike("name", params.name);
        }

        let temp = queryString.stringify(q);
        let sortBy = "sort=updatedAt,desc";

        if (sort?.name) sortBy = `sort=name,${sort.name === "ascend" ? "asc" : "desc"}`;
        if (sort?.createdAt) sortBy = `sort=createdAt,${sort.createdAt === "ascend" ? "asc" : "desc"}`;
        if (sort?.updatedAt) sortBy = `sort=updatedAt,${sort.updatedAt === "ascend" ? "asc" : "desc"}`;

        return `${temp}&${sortBy}`;
    };

    const fetchCategories = async (params: any, sort: any) => {
        setLoading(true);
        const query = buildQuery(params, sort);
        try {
            const res = await callFetchExpertiseCategory(query);
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

        const res = await callDeleteExpertiseCategory(id);
        if (res && +res.statusCode === 200) {
            message.success("Xóa danh mục thành công");
            reloadTable();
            return;
        }

        notification.error({
            message: "Có lỗi xảy ra",
            description: res.message,
        });
    };

    const handleSubmit = async (values: { name: string }) => {
        setSubmitting(true);
        try {
            const res = dataInit?.id
                ? await callUpdateExpertiseCategory(dataInit.id, values.name.trim())
                : await callCreateExpertiseCategory(values.name.trim());

            if (res?.data) {
                message.success(dataInit?.id ? "Cập nhật danh mục thành công" : "Thêm mới danh mục thành công");
                handleReset();
                reloadTable();
                return true;
            }

            notification.error({
                message: "Có lỗi xảy ra",
                description: res.message,
            });
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    const columns: ProColumns<IExpertiseCategory>[] = [
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
                            form.setFieldsValue({ name: entity.name });
                            setOpenModal(true);
                        }}
                    />
                    <Popconfirm
                        placement="leftTop"
                        title="Xác nhận xóa danh mục"
                        description="Bạn có chắc chắn muốn xóa danh mục này?"
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
                                    <ClusterOutlined />
                                </div>
                            </Col>
                            <Col xs={24} sm="auto" flex={1}>
                                <div>
                                    <h2 className={styles["card-title"]}>Quản lý Nhóm chuyên môn IT</h2>
                                    <p className={styles["card-subtitle"]}>Thêm, chỉnh sửa và xóa nhóm chuyên môn để cập nhật dữ liệu cho IT Expertise Summary.</p>
                                </div>
                            </Col>
                        </Row>
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card className={styles["stat-card"]} style={{ borderLeft: "4px solid #4078ff" }}>
                        <Statistic
                            title="TỔNG DANH MỤC"
                            value={meta.total || 0}
                            prefix={<ClusterOutlined style={{ marginRight: 8 }} />}
                            valueStyle={{ color: "#4078ff", fontSize: 32, fontWeight: 700 }}
                        />
                    </Card>
                </Col>
            </Row>

            <DataTable<IExpertiseCategory>
                actionRef={tableRef}
                headerTitle="Danh sách Nhóm chuyên môn IT"
                rowKey="id"
                loading={loading}
                columns={columns}
                dataSource={dataSource}
                request={async (params, sort) => {
                    await fetchCategories(params, sort);
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
                    <Button key="create" icon={<PlusOutlined />} type="primary" onClick={() => setOpenModal(true)}>
                        Thêm mới
                    </Button>,
                ]}
            />

            <ModalForm
                title={dataInit?.id ? "Cập nhật danh mục" : "Tạo mới danh mục"}
                open={openModal}
                form={form}
                onFinish={handleSubmit}
                submitter={{ submitButtonProps: { loading: submitting } }}
                initialValues={dataInit ?? {}}
                modalProps={{
                    onCancel: handleReset,
                    afterClose: handleReset,
                    destroyOnClose: true,
                    width: isMobile ? "100%" : 520,
                    keyboard: false,
                    maskClosable: false,
                    okText: dataInit?.id ? "Cập nhật" : "Tạo mới",
                    cancelText: "Hủy",
                }}
            >
                <ProFormText
                    name="name"
                    label="Tên danh mục"
                    placeholder="Nhập tên danh mục"
                    rules={[
                        { required: true, message: "Vui lòng nhập tên danh mục" },
                        { min: 2, message: "Tên danh mục phải có ít nhất 2 ký tự" },
                        { max: 100, message: "Tên danh mục không được vượt quá 100 ký tự" },
                    ]}
                />
            </ModalForm>
        </div>
    );
};

export default ExpertiseCategoryPage;

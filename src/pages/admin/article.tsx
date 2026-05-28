import DataTable from "@/components/client/data-table";
import {
    callCreateArticle,
    callDeleteArticle,
    callFetchArticles,
    callUpdateArticle,
    callUploadSingleFile,
} from "@/config/api";
import { IArticle, IModelPaginate } from "@/types/backend";
import {
    ActionType,
    ModalForm,
    ProColumns,
    ProFormSelect,
    ProFormSwitch,
    ProFormText,
    ProFormTextArea,
} from "@ant-design/pro-components";
import {
    DeleteOutlined,
    EditOutlined,
    FileTextOutlined,
    PlusOutlined,
    UploadOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    Form,
    Image,
    Popconfirm,
    Row,
    Space,
    Statistic,
    Tag,
    Upload,
    message,
    notification,
} from "antd";
import type { UploadFile, UploadProps } from "antd";
import dayjs from "dayjs";
import queryString from "query-string";
import { sfLike } from "spring-filter-query-builder";
import { useEffect, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import styles from "styles/admin.module.scss";

const CATEGORY_OPTIONS = [
    { label: "Career Tips", value: "Career Tips" },
    { label: "Tech News", value: "Tech News" },
    { label: "Salary Report", value: "Salary Report" },
    { label: "IT Market", value: "IT Market" },
    { label: "Interview Tips", value: "Interview Tips" },
    { label: "Company Culture", value: "Company Culture" },
    { label: "Other", value: "Other" },
];

const ArticlePage = () => {
    const tableRef = useRef<ActionType>();
    const [form] = Form.useForm();
    const [openModal, setOpenModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState<IArticle[]>([]);
    const [dataInit, setDataInit] = useState<IArticle | null>(null);
    const [meta, setMeta] = useState<IModelPaginate<IArticle>["meta"]>({
        page: 1,
        pageSize: 10,
        pages: 0,
        total: 0,
    });

    // Thumbnail upload state
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
    const [uploading, setUploading] = useState(false);

    const reloadTable = () => tableRef.current?.reload();

    const handleReset = () => {
        form.resetFields();
        setDataInit(null);
        setOpenModal(false);
        setFileList([]);
        setThumbnailUrl("");
    };

    const buildQuery = (params: any, sort: any) => {
        const q: Record<string, any> = {
            page: params.current,
            size: params.pageSize,
        };

        const filters: string[] = [];
        if (params.title) filters.push(sfLike("title", params.title).toString());
        if (params.category) filters.push(`category:'${params.category}'`);
        if (filters.length) q.filter = filters.join(" and ");

        let temp = queryString.stringify(q);
        let sortBy = "sort=createdAt,desc";

        if (sort?.title)
            sortBy = `sort=title,${sort.title === "ascend" ? "asc" : "desc"}`;
        if (sort?.createdAt)
            sortBy = `sort=createdAt,${sort.createdAt === "ascend" ? "asc" : "desc"}`;

        return `${temp}&${sortBy}`;
    };

    const fetchArticles = async (params: any, sort: any) => {
        setLoading(true);
        const query = buildQuery(params, sort);
        try {
            const res = await callFetchArticles(query);
            const payload = res?.data;
            setDataSource(payload?.result ?? []);
            setMeta(
                payload?.meta ?? {
                    page: 1,
                    pageSize: params.pageSize ?? 10,
                    pages: 0,
                    total: 0,
                }
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id?: string) => {
        if (!id) return;
        const res = await callDeleteArticle(id);
        if (res && +res.statusCode === 200) {
            message.success("Article deleted successfully");
            reloadTable();
            return;
        }
        notification.error({
            message: "An error occurred",
            description: (res as any)?.error ?? res.message,
        });
    };

    const handleUploadThumbnail: UploadProps["customRequest"] = async (options) => {
        const { file, onSuccess, onError } = options;
        setUploading(true);
        try {
            const res = await callUploadSingleFile(file, "articles");
            if (res?.data?.fileName) {
                const url = `${import.meta.env.VITE_BACKEND_URL}/storage/articles/${res.data.fileName}`;
                setThumbnailUrl(url);
                form.setFieldValue("thumbnail", url);
                onSuccess?.(res);
                message.success("Thumbnail uploaded successfully");
            } else {
                onError?.(new Error("Upload failed"));
                message.error("Upload failed");
            }
        } catch {
            onError?.(new Error("Upload failed"));
            message.error("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (values: any) => {
        setSubmitting(true);
        try {
            const payload: IArticle = {
                ...values,
                thumbnail: thumbnailUrl || dataInit?.thumbnail || "",
            };

            const res = dataInit?.id
                ? await callUpdateArticle({ ...payload, id: dataInit.id })
                : await callCreateArticle(payload);

            if (res?.data) {
                message.success(
                    dataInit?.id
                        ? "Article updated successfully"
                        : "Article created successfully"
                );
                handleReset();
                reloadTable();
                return true;
            }

            notification.error({
                message: "An error occurred",
                description: (res as any)?.error ?? res.message,
            });
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    const openEditModal = (entity: IArticle) => {
        setDataInit(entity);
        setThumbnailUrl(entity.thumbnail ?? "");
        form.setFieldsValue({
            title: entity.title,
            description: entity.description,
            content: entity.content,
            category: entity.category,
            author: entity.author,
            isFeatured: entity.isFeatured,
            isPublished: entity.isPublished,
            thumbnail: entity.thumbnail,
        });
        if (entity.thumbnail) {
            setFileList([
                {
                    uid: "-1",
                    name: "thumbnail",
                    status: "done",
                    url: entity.thumbnail,
                },
            ]);
        }
        setOpenModal(true);
    };

    const columns: ProColumns<IArticle>[] = [
        {
            title: "No.",
            key: "index",
            width: 60,
            align: "center",
            hideInSearch: true,
            render: (_value, _entity, index) =>
                index + 1 + (meta.page - 1) * meta.pageSize,
        },
        {
            title: "Thumbnail",
            dataIndex: "thumbnail",
            hideInSearch: true,
            width: 80,
            render: (_, entity) =>
                entity.thumbnail ? (
                    <Image
                        src={entity.thumbnail}
                        alt={entity.title}
                        width={60}
                        height={40}
                        style={{ objectFit: "cover", borderRadius: 4 }}
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9HQAHAAT/hc2rNAAAAABJRU5ErkJggg=="
                    />
                ) : (
                    <div
                        style={{
                            width: 60,
                            height: 40,
                            background: "#f0f0f0",
                            borderRadius: 4,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#bbb",
                            fontSize: 12,
                        }}
                    >
                        No img
                    </div>
                ),
        },
        {
            title: "Title",
            dataIndex: "title",
            sorter: true,
            ellipsis: true,
        },
        {
            title: "Category",
            dataIndex: "category",
            valueType: "select",
            fieldProps: { options: CATEGORY_OPTIONS },
            render: (_, entity) =>
                entity.category ? (
                    <Tag color="blue">{entity.category}</Tag>
                ) : (
                    ""
                ),
        },
        {
            title: "Author",
            dataIndex: "author",
            hideInSearch: true,
        },
        {
            title: "Featured",
            dataIndex: "isFeatured",
            hideInSearch: true,
            width: 90,
            render: (_, entity) =>
                entity.isFeatured ? (
                    <Tag color="gold">⭐ Featured</Tag>
                ) : (
                    <Tag color="default">—</Tag>
                ),
        },
        {
            title: "Status",
            dataIndex: "isPublished",
            hideInSearch: true,
            width: 100,
            render: (_, entity) =>
                entity.isPublished ? (
                    <Tag color="green">Published</Tag>
                ) : (
                    <Tag color="orange">Draft</Tag>
                ),
        },
        {
            title: "Views",
            dataIndex: "viewCount",
            hideInSearch: true,
            width: 70,
            align: "center",
        },
        {
            title: "Created At",
            dataIndex: "createdAt",
            sorter: true,
            hideInSearch: true,
            width: 160,
            render: (_, entity) =>
                entity.createdAt
                    ? dayjs(entity.createdAt).format("DD-MM-YYYY HH:mm")
                    : "",
        },
        {
            title: "Actions",
            hideInSearch: true,
            width: 90,
            render: (_value, entity) => (
                <Space>
                    <EditOutlined
                        style={{ fontSize: 18, color: "#faad14" }}
                        onClick={() => openEditModal(entity)}
                    />
                    <Popconfirm
                        placement="leftTop"
                        title="Confirm delete article"
                        description="Are you sure you want to delete this article?"
                        onConfirm={() => handleDelete(entity.id)}
                        okText="Confirm"
                        cancelText="Cancel"
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
                                    <FileTextOutlined />
                                </div>
                            </Col>
                            <Col xs={24} sm="auto" flex={1}>
                                <div>
                                    <h2 className={styles["card-title"]}>
                                        Article Management
                                    </h2>
                                    <p className={styles["card-subtitle"]}>
                                        Manage featured articles and news displayed on the homepage.
                                    </p>
                                </div>
                            </Col>
                        </Row>
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card
                        className={styles["stat-card"]}
                        style={{ borderLeft: "4px solid #b91c1c" }}
                    >
                        <Statistic
                            title="TOTAL ARTICLES"
                            value={meta.total || 0}
                            prefix={
                                <FileTextOutlined style={{ marginRight: 8 }} />
                            }
                            valueStyle={{
                                color: "#b91c1c",
                                fontSize: 32,
                                fontWeight: 700,
                            }}
                        />
                    </Card>
                </Col>
            </Row>

            <DataTable<IArticle>
                actionRef={tableRef}
                headerTitle="Articles List"
                rowKey="id"
                loading={loading}
                columns={columns}
                dataSource={dataSource}
                request={async (params, sort) => {
                    await fetchArticles(params, sort);
                    return { data: [], success: true };
                }}
                scroll={{ x: true }}
                pagination={{
                    current: meta.page,
                    pageSize: meta.pageSize,
                    showSizeChanger: true,
                    total: meta.total,
                    showTotal: (total, range) => (
                        <div>
                            {range[0]}-{range[1]} of {total} records
                        </div>
                    ),
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
                            setFileList([]);
                            setThumbnailUrl("");
                            setOpenModal(true);
                        }}
                    >
                        Add New
                    </Button>,
                ]}
            />

            <ModalForm
                title={dataInit?.id ? "Update Article" : "Create New Article"}
                open={openModal}
                form={form}
                onFinish={handleSubmit}
                submitter={{ submitButtonProps: { loading: submitting } }}
                modalProps={{
                    onCancel: handleReset,
                    afterClose: handleReset,
                    destroyOnClose: true,
                    width: isMobile ? "100%" : 680,
                    keyboard: false,
                    maskClosable: false,
                    okText: dataInit?.id ? "Update" : "Create",
                    cancelText: "Cancel",
                }}
            >
                <Row gutter={16}>
                    <Col span={24}>
                        <ProFormText
                            name="title"
                            label="Title"
                            placeholder="Enter article title"
                            rules={[
                                { required: true, message: "Please enter title" },
                                { min: 5, message: "Title must be at least 5 characters" },
                                { max: 200, message: "Title must not exceed 200 characters" },
                            ]}
                        />
                    </Col>
                    <Col xs={24} md={12}>
                        <ProFormSelect
                            name="category"
                            label="Category"
                            placeholder="Select category"
                            options={CATEGORY_OPTIONS}
                            rules={[{ required: true, message: "Please select category" }]}
                        />
                    </Col>
                    <Col xs={24} md={12}>
                        <ProFormText
                            name="author"
                            label="Author"
                            placeholder="Author name"
                            rules={[{ required: true, message: "Please enter author name" }]}
                        />
                    </Col>
                    <Col span={24}>
                        <ProFormTextArea
                            name="description"
                            label="Short Description"
                            placeholder="Brief description shown on article cards (max 300 chars)"
                            fieldProps={{ rows: 3, maxLength: 300, showCount: true }}
                            rules={[{ required: true, message: "Please enter description" }]}
                        />
                    </Col>
                    <Col span={24}>
                        <ProFormTextArea
                            name="content"
                            label="Full Content"
                            placeholder="Full article content"
                            fieldProps={{ rows: 6 }}
                        />
                    </Col>
                    <Col span={24}>
                        <Form.Item label="Thumbnail Image" name="thumbnail">
                            <Space direction="vertical" style={{ width: "100%" }}>
                                <Upload
                                    customRequest={handleUploadThumbnail}
                                    fileList={fileList}
                                    onChange={({ fileList: newFileList }) =>
                                        setFileList(newFileList)
                                    }
                                    listType="picture"
                                    maxCount={1}
                                    accept="image/png,image/jpeg,image/jpg"
                                >
                                    <Button
                                        icon={<UploadOutlined />}
                                        loading={uploading}
                                    >
                                        Upload Thumbnail
                                    </Button>
                                </Upload>
                                {thumbnailUrl && (
                                    <Image
                                        src={thumbnailUrl}
                                        alt="thumbnail preview"
                                        width={200}
                                        style={{ borderRadius: 8, marginTop: 8 }}
                                    />
                                )}
                            </Space>
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <ProFormSwitch
                            name="isFeatured"
                            label="Featured on Homepage"
                            fieldProps={{ checkedChildren: "Yes", unCheckedChildren: "No" }}
                        />
                    </Col>
                    <Col xs={24} md={12}>
                        <ProFormSwitch
                            name="isPublished"
                            label="Publish"
                            fieldProps={{ checkedChildren: "Published", unCheckedChildren: "Draft" }}
                        />
                    </Col>
                </Row>
            </ModalForm>
        </div>
    );
};

export default ArticlePage;

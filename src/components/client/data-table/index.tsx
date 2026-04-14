import {
    ParamsType,
    ProTable,
    ProTableProps,
} from '@ant-design/pro-components';
import vi_VN from 'antd/locale/vi_VN';
import enUS from 'antd/lib/locale/en_US';
import { ConfigProvider } from 'antd';

const DataTable = <
    T extends Record<string, any>,
    U extends ParamsType = ParamsType,
    ValueType = 'text',
>({
    columns,
    defaultData = [],
    dataSource,
    postData,
    pagination,
    // sticky = { offsetHeader: 50 },
    loading,
    rowKey = (record) => record.id,
    scroll,
    params,
    request,
    search,
    polling,
    toolBarRender,
    headerTitle,
    actionRef,
    dateFormatter = 'string',
    rowSelection,
}: ProTableProps<T, U, ValueType>) => {
    const normalizedSearch: ProTableProps<T, U, ValueType>['search'] =
        typeof search === 'boolean'
            ? search
            : ({
                ...(search ?? {}),
                filterType: 'query' as const,
            });

    return (
        <ConfigProvider locale={vi_VN}>
            <ProTable<T, U, ValueType>
                columns={columns}
                defaultData={defaultData}
                dataSource={dataSource}
                postData={postData}
                pagination={pagination}
                bordered
                // sticky={sticky}
                loading={loading}
                rowKey={rowKey}
                scroll={scroll}
                params={params}
                request={request}
                search={normalizedSearch}
                polling={polling}
                toolBarRender={toolBarRender}
                headerTitle={headerTitle}
                actionRef={actionRef}
                dateFormatter={dateFormatter}
                rowSelection={rowSelection}
            />
        </ConfigProvider>
    );
};

export default DataTable;

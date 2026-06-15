import { Breadcrumb, Button, Drawer, Flex, Form, Space, Spin, Table, Typography, theme } from 'antd';
import { RightOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Link, Navigate } from 'react-router-dom';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { debounce } from 'lodash';
import { createTenant, getTenants, updateTenant } from '../../http/api';
import { useAuthStore } from '../../store';
import { PER_PAGE } from '../../constants';
import type { Tenant } from '../../types';
import React from 'react';
import TenantFilter from './TenantFilter';
import TenantForm from './forms/TenantForm';

interface FieldData {
    name: string[];
    value?: unknown;
}

const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Address', dataIndex: 'address', key: 'address' },
];

const Restaurants = () => {
    const { user } = useAuthStore();
    const [filterForm] = Form.useForm();
    const [tenantForm] = Form.useForm();
    const queryClient = useQueryClient();
    const { token: { colorBgLayout } } = theme.useToken();

    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const [currentEditingTenant, setCurrentEditingTenant] = React.useState<Tenant | null>(null);

    const [queryParams, setQueryParams] = React.useState<{
        currentPage: number;
        perPage: number;
        q?: string;
    }>({
        currentPage: 1,
        perPage: PER_PAGE,
    });

    const { data: tenants, isFetching, isError, error } = useQuery({
        queryKey: ['tenants', queryParams],
        queryFn: () => {
            const filteredParams = Object.fromEntries(
                Object.entries(queryParams).filter(([, v]) => !!v)
            );
            const queryString = new URLSearchParams(
                filteredParams as Record<string, string>
            ).toString();
            return getTenants(queryString).then((res) => res.data);
        },
        placeholderData: keepPreviousData,
    });

    const { mutateAsync: createTenantMutate } = useMutation({
        mutationKey: ['createTenant'],
        mutationFn: (data: { name: string; address: string }) =>
            createTenant(data).then((res) => res.data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tenants'] }),
    });

    const { mutateAsync: updateTenantMutate } = useMutation({
        mutationKey: ['updateTenant'],
        mutationFn: (data: { name: string; address: string }) =>
            updateTenant(currentEditingTenant!.id, data).then((res) => res.data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tenants'] }),
    });

    const onHandleSubmit = async () => {
        await tenantForm.validateFields();
        if (currentEditingTenant) {
            await updateTenantMutate(tenantForm.getFieldsValue());
        } else {
            await createTenantMutate(tenantForm.getFieldsValue());
        }
        tenantForm.resetFields();
        setCurrentEditingTenant(null);
        setDrawerOpen(false);
    };

    const debouncedSearch = React.useMemo(
        () =>
            debounce((value: string | undefined) => {
                setQueryParams((prev) => ({ ...prev, q: value, currentPage: 1 }));
            }, 500),
        []
    );

    const onFilterChange = (changedFields: FieldData[]) => {
        const changed = changedFields.reduce(
            (acc, field) => ({ ...acc, [field.name[0]]: field.value }),
            {} as Record<string, unknown>
        );
        if ('q' in changed) {
            debouncedSearch(changed.q as string | undefined);
        } else {
            setQueryParams((prev) => ({ ...prev, ...changed, currentPage: 1 }));
        }
    };

    if (user?.role !== 'admin') {
        return <Navigate to="/" replace={true} />;
    }

    return (
        <Flex vertical gap="large" style={{ width: '100%' }}>
            <Flex justify="space-between">
                <Breadcrumb
                    separator={<RightOutlined />}
                    items={[
                        { title: <Link to="/">Dashboard</Link> },
                        { title: 'Restaurants' },
                    ]}
                />
                {isFetching && <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />}
                {isError && <Typography.Text type="danger">{error.message}</Typography.Text>}
            </Flex>

            <Form form={filterForm} onFieldsChange={onFilterChange}>
                <TenantFilter>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setDrawerOpen(true)}>
                        Add Restaurant
                    </Button>
                </TenantFilter>
            </Form>

            <Table
                columns={[
                    {
                        title: '#',
                        key: 'serial',
                        render: (_: unknown, __: Tenant, index: number) =>
                            (queryParams.currentPage - 1) * queryParams.perPage + index + 1,
                    },
                    ...columns,
                    {
                        title: 'Actions',
                        key: 'actions',
                        render: (_: unknown, record: Tenant) => (
                            <Button
                                type="link"
                                onClick={() => {
                                    setCurrentEditingTenant(record);
                                    tenantForm.setFieldsValue(record);
                                    setDrawerOpen(true);
                                }}>
                                Edit
                            </Button>
                        ),
                    },
                ]}
                dataSource={tenants?.data}
                rowKey="id"
                pagination={{
                    total: tenants?.total,
                    pageSize: queryParams.perPage,
                    current: queryParams.currentPage,
                    onChange: (page) =>
                        setQueryParams((prev) => ({ ...prev, currentPage: page })),
                    showTotal: (total, range) =>
                        `Showing ${range[0]}-${range[1]} of ${total} items`,
                }}
            />

            <Drawer
                title={currentEditingTenant ? 'Edit Restaurant' : 'Add Restaurant'}
                size="large"
                styles={{ body: { backgroundColor: colorBgLayout } }}
                destroyOnHidden={true}
                open={drawerOpen}
                onClose={() => {
                    tenantForm.resetFields();
                    setCurrentEditingTenant(null);
                    setDrawerOpen(false);
                }}
                extra={
                    <Space>
                        <Button onClick={() => { tenantForm.resetFields(); setCurrentEditingTenant(null); setDrawerOpen(false); }}>
                            Cancel
                        </Button>
                        <Button type="primary" onClick={onHandleSubmit}>
                            Submit
                        </Button>
                    </Space>
                }>
                <Form layout="vertical" form={tenantForm}>
                    <TenantForm />
                </Form>
            </Drawer>
        </Flex>
    );
};

export default Restaurants;

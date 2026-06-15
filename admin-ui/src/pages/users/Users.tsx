import { Breadcrumb, Button, Drawer, Flex, Form, Space, Spin, Table, Typography, theme } from 'antd';
import { RightOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Link, Navigate } from 'react-router-dom';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { debounce } from 'lodash';
import { createUser, getUsers, updateUser } from '../../http/api';
import { useAuthStore } from '../../store';
import { PER_PAGE } from '../../constants';
import type { User } from '../../types';
import React from 'react';
import UsersFilter from './UsersFilter';
import UserForm from './forms/UserForm';

interface FieldData {
    name: string[];
    value?: unknown;
}

const columns = [
    {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
    },
    {
        title: 'Name',
        key: 'name',
        render: (_: unknown, record: User) => `${record.firstName} ${record.lastName}`,
    },
    {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
    },
    {
        title: 'Role',
        dataIndex: 'role',
        key: 'role',
    },
    {
        title: 'Restaurant',
        key: 'tenant',
        render: (_: unknown, record: User) => record.tenant?.name ?? '—',
    },
];

const Users = () => {
    const { user } = useAuthStore();
    const [filterForm] = Form.useForm();
    const [userForm] = Form.useForm();
    const queryClient = useQueryClient();
    const { token: { colorBgLayout } } = theme.useToken();

    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const [currentEditingUser, setCurrentEditingUser] = React.useState<User | null>(null);

    const [queryParams, setQueryParams] = React.useState<{
        currentPage: number;
        perPage: number;
        q?: string;
        role?: string;
    }>({
        currentPage: 1,
        perPage: PER_PAGE,
    });

    const { data: users, isFetching, isError, error } = useQuery({
        queryKey: ['users', queryParams],
        queryFn: () => {
            const filteredParams = Object.fromEntries(
                Object.entries(queryParams).filter(([, v]) => !!v)
            );
            const queryString = new URLSearchParams(
                filteredParams as Record<string, string>
            ).toString();
            return getUsers(queryString).then((res) => res.data);
        },
        placeholderData: keepPreviousData,
    });

    const { mutateAsync: createUserMutate } = useMutation({
        mutationKey: ['createUser'],
        mutationFn: (data: Record<string, unknown>) => createUser(data).then((res) => res.data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    });

    const { mutateAsync: updateUserMutate } = useMutation({
        mutationKey: ['updateUser'],
        mutationFn: (data: Record<string, unknown>) =>
            updateUser(currentEditingUser!.id, data).then((res) => res.data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    });

    const onHandleSubmit = async () => {
        await userForm.validateFields();
        if (currentEditingUser) {
            await updateUserMutate(userForm.getFieldsValue());
        } else {
            await createUserMutate(userForm.getFieldsValue());
        }
        userForm.resetFields();
        setCurrentEditingUser(null);
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
                    items={[{ title: <Link to="/">Dashboard</Link> }, { title: 'Users' }]}
                />
                {isFetching && <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />}
                {isError && <Typography.Text type="danger">{error.message}</Typography.Text>}
            </Flex>

            <Form form={filterForm} onFieldsChange={onFilterChange}>
                <UsersFilter>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setDrawerOpen(true)}>
                        Add User
                    </Button>
                </UsersFilter>
            </Form>

            <Table
                columns={[
                    {
                        title: '#',
                        key: 'serial',
                        render: (_: unknown, __: User, index: number) =>
                            (queryParams.currentPage - 1) * queryParams.perPage + index + 1,
                    },
                    ...columns,
                    {
                        title: 'Actions',
                        key: 'actions',
                        render: (_: unknown, record: User) => (
                            <Space>
                                <Button
                                    type="link"
                                    onClick={() => {
                                        setCurrentEditingUser(record);
                                        userForm.setFieldsValue({
                                            ...record,
                                            tenant: record.tenant?.id,
                                        });
                                        setDrawerOpen(true);
                                    }}>
                                    Edit
                                </Button>
                            </Space>
                        ),
                    },
                ]}
                dataSource={users?.data}
                rowKey="id"
                pagination={{
                    total: users?.total,
                    pageSize: queryParams.perPage,
                    current: queryParams.currentPage,
                    onChange: (page) =>
                        setQueryParams((prev) => ({ ...prev, currentPage: page })),
                    showTotal: (total, range) =>
                        `Showing ${range[0]}-${range[1]} of ${total} items`,
                }}
            />

            <Drawer
                title={currentEditingUser ? 'Edit User' : 'Add User'}
                size="large"
                styles={{ body: { backgroundColor: colorBgLayout } }}
                destroyOnHidden={true}
                open={drawerOpen}
                onClose={() => {
                    userForm.resetFields();
                    setCurrentEditingUser(null);
                    setDrawerOpen(false);
                }}
                extra={
                    <Space>
                        <Button
                            onClick={() => {
                                userForm.resetFields();
                                setCurrentEditingUser(null);
                                setDrawerOpen(false);
                            }}>
                            Cancel
                        </Button>
                        <Button type="primary" onClick={onHandleSubmit}>
                            Submit
                        </Button>
                    </Space>
                }>
                <Form layout="vertical" form={userForm}>
                    <UserForm isEditMode={!!currentEditingUser} />
                </Form>
            </Drawer>
        </Flex>
    );
};

export default Users;

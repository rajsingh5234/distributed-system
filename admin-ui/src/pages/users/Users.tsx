import { Breadcrumb, Flex, Spin, Table, Typography } from 'antd';
import { RightOutlined, LoadingOutlined } from '@ant-design/icons';
import { Link, Navigate } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getUsers } from '../../http/api';
import { useAuthStore } from '../../store';
import { PER_PAGE } from '../../constants';
import type { User } from '../../types';
import React from 'react';

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

    const [queryParams, setQueryParams] = React.useState({
        currentPage: 1,
        perPage: PER_PAGE,
    });

    const { data: users, isFetching, isError, error } = useQuery({
        queryKey: ['users', queryParams],
        queryFn: () => {
            const queryString = new URLSearchParams(
                queryParams as unknown as Record<string, string>
            ).toString();
            return getUsers(queryString).then((res) => res.data);
        },
        placeholderData: keepPreviousData,
    });

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

            <Table
                columns={[
                    {
                        title: '#',
                        key: 'serial',
                        render: (_: unknown, __: User, index: number) =>
                            (queryParams.currentPage - 1) * queryParams.perPage + index + 1,
                    },
                    ...columns,
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
        </Flex>
    );
};

export default Users;

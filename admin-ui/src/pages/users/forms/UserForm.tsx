import { Card, Col, Flex, Form, Input, Row, Select } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { getTenants } from '../../../http/api';
import type { Tenant } from '../../../types';

const UserForm = ({ isEditMode = false }: { isEditMode: boolean }) => {
    const { data: tenants } = useQuery({
        queryKey: ['tenants'],
        queryFn: () => getTenants('perPage=100&currentPage=1').then((res) => res.data),
    });

    return (
        <Row>
            <Col span={24}>
                <Flex vertical gap="large">
                    <Card title="Basic info" variant="borderless">
                        <Row gutter={20}>
                            <Col span={12}>
                                <Form.Item
                                    label="First name"
                                    name="firstName"
                                    rules={[{ required: true, message: 'First name is required' }]}>
                                    <Input size="large" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Last name"
                                    name="lastName"
                                    rules={[{ required: true, message: 'Last name is required' }]}>
                                    <Input size="large" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Email"
                                    name="email"
                                    rules={[
                                        { required: true, message: 'Email is required' },
                                        { type: 'email', message: 'Email is not valid' },
                                    ]}>
                                    <Input size="large" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>

                    {!isEditMode && (
                        <Card title="Security info" variant="borderless">
                            <Row gutter={20}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Password"
                                        name="password"
                                        rules={[{ required: true, message: 'Password is required' }]}>
                                        <Input size="large" type="password" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>
                    )}

                    <Card title="Role" variant="borderless">
                        <Row gutter={20}>
                            <Col span={12}>
                                <Form.Item
                                    label="Role"
                                    name="role"
                                    rules={[{ required: true, message: 'Role is required' }]}>
                                    <Select
                                        size="large"
                                        style={{ width: '100%' }}
                                        allowClear={true}
                                        placeholder="Select role"
                                        options={[
                                            { label: 'Admin', value: 'admin' },
                                            { label: 'Manager', value: 'manager' },
                                        ]}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Restaurant"
                                    name="tenant"
                                    rules={[{ required: true, message: 'Restaurant is required' }]}>
                                    <Select
                                        size="large"
                                        style={{ width: '100%' }}
                                        allowClear={true}
                                        placeholder="Select restaurant"
                                        options={(tenants as { data: Tenant[] } | undefined)?.data?.map((tenant) => ({
                                            label: tenant.name,
                                            value: tenant.id,
                                        }))}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>
                </Flex>
            </Col>
        </Row>
    );
};

export default UserForm;

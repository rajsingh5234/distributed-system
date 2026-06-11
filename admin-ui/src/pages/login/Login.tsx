import { LockFilled, LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, Flex, Form, Input, Layout, Space } from 'antd';
import Logo from '../../components/icons/Logo';

const Login = () => {
    return (
        <Layout style={{ height: '100vh', display: 'grid', placeItems: 'center' }}>
            <Flex vertical align="center" gap="large">
                <Layout.Content
                    style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="logo">
                        <Logo />
                    </div>
                </Layout.Content>
                <Card
                    variant="borderless"
                    style={{ width: 300 }}
                    title={
                        <Space
                            style={{ width: '100%', fontSize: 16, justifyContent: 'center' }}>
                            <LockFilled />
                            Sign in
                        </Space>
                    }>
                    <Form initialValues={{ remember: true }}>
                        <Form.Item
                            name="username"
                            rules={[
                                { required: true, message: 'Please input your Username' },
                                { type: 'email', message: 'Email is not valid' },
                            ]}>
                            <Input prefix={<UserOutlined />} placeholder="Username" aria-label="Username" />
                        </Form.Item>
                        <Form.Item
                            name="password"
                            rules={[
                                { required: true, message: 'Please input your password' },
                            ]}>
                            <Input.Password prefix={<LockOutlined />} placeholder="Password" aria-label="Password" />
                        </Form.Item>
                        <Flex justify="space-between">
                            <Form.Item name="remember" valuePropName="checked">
                                <Checkbox>Remember me</Checkbox>
                            </Form.Item>
                            <a id="login-form-forgot" href="">Forgot password</a>
                        </Flex>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                                Log in
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </Flex>
        </Layout>
    );
};

export default Login;

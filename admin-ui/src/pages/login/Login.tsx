import { LockFilled, LockOutlined, UserOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { Alert, Button, Card, Checkbox, Flex, Form, Input, Layout, Space } from 'antd';
import Logo from '../../components/icons/Logo';
import { login } from '../../http/api';

const Login = () => {

    const { mutate, isPending, isError } = useMutation({
        mutationKey: ['login'],
        mutationFn: (credentials: { email: string; password: string }) => login(credentials),
        onSuccess: (response) => {
            console.log(response.data.message);
        },
    });

    const onFinish = (values: { username: string; password: string }) => {
        mutate({ email: values.username, password: values.password });
    };

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
                    <Form initialValues={{ remember: true }} onFinish={onFinish}>
                        {isError && (
                            <Form.Item>
                                <Alert type="error" description="Invalid email or password" />
                            </Form.Item>
                        )}
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
                            <Button type="primary" htmlType="submit" loading={isPending} style={{ width: '100%' }}>
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

import { Button, Card, Col, List, Row, Skeleton, Statistic, Tag, Typography } from 'antd';
import Icon from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store';
import BasketIcon from '../components/icons/BasketIcon';

const { Title, Text } = Typography;

const recentOrders = [
    { orderSummary: 'Peperoni, Margarita ...', address: 'Bandra, Mumbai', amount: 1200, status: 'preparing' },
    { orderSummary: 'Paneer, Chicken BBQ ...', address: 'Balurghat, West Bengal', amount: 2000, status: 'on the way' },
    { orderSummary: 'Farmhouse, BBQ Chicken ...', address: 'Andheri, Mumbai', amount: 1500, status: 'delivered' },
    { orderSummary: 'Margarita, Veggie ...', address: 'Kolkata, West Bengal', amount: 900, status: 'preparing' },
    { orderSummary: 'Chicken BBQ, Paneer ...', address: 'Pune, Maharashtra', amount: 1800, status: 'on the way' },
    { orderSummary: 'Peperoni, Farmhouse ...', address: 'Chennai, Tamil Nadu', amount: 2200, status: 'delivered' },
];

const HomePage = () => {
    const { user } = useAuthStore();

    return (
        <div>
            <Title level={4}>Welcome, {user?.firstName}</Title>
            <Row style={{ marginTop: 16 }} gutter={16}>
                <Col span={12}>
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Card variant="borderless">
                                <Statistic title="Total orders" value={52} />
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card variant="borderless">
                                <Statistic title="Total sale" value={70000} precision={2} prefix="₹" />
                            </Card>
                        </Col>
                    </Row>
                </Col>
                <Col span={12}>
                    <Card
                        variant="borderless"
                        title={
                            <span>
                                <Icon component={BasketIcon} /> Recent orders
                            </span>
                        }>
                        <List
                            loading={false}
                            itemLayout="horizontal"
                            dataSource={recentOrders}
                            renderItem={(item) => (
                                <List.Item>
                                    <Skeleton title={false} loading={false} active>
                                        <List.Item.Meta
                                            title={item.orderSummary}
                                            description={item.address}
                                        />
                                        <Row style={{ flex: 1 }} justify="space-between">
                                            <Col>
                                                <Text strong>₹{item.amount}</Text>
                                            </Col>
                                            <Col>
                                                <Tag color="volcano">{item.status}</Tag>
                                            </Col>
                                        </Row>
                                    </Skeleton>
                                </List.Item>
                            )}
                        />
                        <div style={{ marginTop: 20 }}>
                            <Button type="link">
                                <Link to="/orders">See all orders</Link>
                            </Button>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default HomePage;

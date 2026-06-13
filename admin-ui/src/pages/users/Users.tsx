import { Breadcrumb, Flex } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const Users = () => {
    return (
        <Flex vertical gap="large" style={{ width: '100%' }}>
            <Flex justify="space-between">
                <Breadcrumb
                    separator={<RightOutlined />}
                    items={[{ title: <Link to="/">Dashboard</Link> }, { title: 'Users' }]}
                />
            </Flex>
        </Flex>
    );
};

export default Users;

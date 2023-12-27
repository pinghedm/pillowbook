import {
    BookOutlined,
    CustomerServiceOutlined,
    EllipsisOutlined,
    PlusOutlined,
    UserOutlined,
    VideoCameraOutlined,
} from '@ant-design/icons'
import { FloatButton, Layout, Typography } from 'antd'
import React from 'react'
import { Link, Outlet } from 'react-router-dom'

export interface HomeProps {}

const Home = ({}: HomeProps) => {
    return (
        <div style={{ height: '100%', width: '100%' }}>
            <Typography.Title level={2}>Recently Added</Typography.Title>
            {[1, 2, 3].map(x => (
                <div key={x}>{x}</div>
            ))}
            <Typography.Title level={2}>Suggested Content</Typography.Title>
            {[1, 2, 3].map(x => (
                <div key={x}>{x}</div>
            ))}
            <Typography.Title level={2}>Unfinished Items</Typography.Title>
            {[1, 2, 3].map(x => (
                <div key={x}>{x}</div>
            ))}
            <FloatButton.Group
                trigger="click"
                type="primary"
                icon={<PlusOutlined />}
            >
                <FloatButton
                    icon={
                        <Link to={{ pathname: '/activities/book' }}>
                            <BookOutlined />
                        </Link>
                    }
                />
                <FloatButton
                    icon={
                        <Link to={{ pathname: '/activities/movie' }}>
                            <VideoCameraOutlined />
                        </Link>
                    }
                />
                <FloatButton icon={<EllipsisOutlined />} />
            </FloatButton.Group>
        </div>
    )
}

export default Home

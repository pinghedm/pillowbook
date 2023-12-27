import { FloatButton, Layout, Typography } from 'antd'
import React from 'react'
import { Link, Outlet } from 'react-router-dom'

export interface HomeProps {}

const Home = ({}: HomeProps) => {
    return (
        <div style={{}}>
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
        </div>
    )
}

export default Home

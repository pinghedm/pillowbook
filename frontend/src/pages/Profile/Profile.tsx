import { Alert, InputNumber, Layout, Menu, Typography } from 'antd'
import React, { useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useUpdateUserSettings, useUserSettings } from 'services/user_service'

export interface ProfileProps {}

const Profile = ({}: ProfileProps) => {
    const navigate = useNavigate()
    const location = useLocation()
    const tab = useMemo(() => location.pathname.split('/').at(-1) ?? 'basics', [location])
    return (
        <Layout style={{ height: '100%', width: '100%' }}>
            {/*<Typography.Title level={3}>Profile</Typography.Title>*/}
            <Layout.Sider style={{ backgroundColor: 'white', marginRight: '10px' }}>
                <Menu
                    defaultSelectedKeys={[tab]}
                    mode="inline"
                    items={[
                        { key: 'basics', label: 'Basics' },
                        { key: 'itemTypes', label: 'Item Types' },
                    ]}
                    onClick={({ key }) => {
                        navigate({ pathname: key })
                    }}
                />
            </Layout.Sider>
            <Layout.Content>
                <Outlet />
            </Layout.Content>
        </Layout>
    )
}

export default Profile

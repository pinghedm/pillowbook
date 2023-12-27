import { ReactNode, useMemo, useState } from 'react'
import './App.css'
import axios from 'axios'
import {
    Navigate,
    Outlet,
    RouterProvider,
    createBrowserRouter,
    useLocation,
    useNavigate,
} from 'react-router-dom'
import { ConfigProvider, Layout, Menu, Spin, ThemeConfig } from 'antd'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Home from 'pages/Home/Home.lazy'
import { BookOutlined, DownOutlined, UserOutlined } from '@ant-design/icons'
import Activities from 'pages/Activities/Activities.lazy'
import AddActivity from 'pages/Activities/AddActivity/AddActivity.lazy'
import ActivityDetail from 'pages/Activities/ActivityDetail/ActivityDetail.lazy'
import Login from 'pages/Login/Login.lazy'
import { useLogout, useUserIsAuthenticated } from 'services/auth_service'
import Items from 'pages/Items/Items.lazy'
import ItemDetails from 'pages/Items/ItemDetails/ItemDetails.lazy'
import Profile from 'pages/Profile/Profile.lazy'

const baseQueryClient = new QueryClient()
baseQueryClient.setDefaultOptions({
    queries: {
        staleTime: 10000,
    },
})

const baseAntTheme: ThemeConfig = {}

const WrappedQueryClientProvider = ({ children }: { children: ReactNode }) => {
    return (
        <ConfigProvider theme={baseAntTheme}>
            <QueryClientProvider
                client={baseQueryClient}
                children={children}
            ></QueryClientProvider>
        </ConfigProvider>
    )
}

const App = () => {
    axios.defaults.baseURL = import.meta.env.VITE_API_URL_BASE
    axios.defaults.withCredentials = true
    axios.defaults.xsrfCookieName = 'csrftoken'
    axios.defaults.xsrfHeaderName = 'X-CSRFToken'
    axios.defaults.withXSRFToken = axios.defaults.baseURL ? true : undefined // if the api base url is set (e.g on local, where the ports are different)

    return (
        <WrappedQueryClientProvider>
            <RouterProvider router={baseRoutes} />
        </WrappedQueryClientProvider>
    )
}

const LoggedInRoot = () => {
    const location = useLocation()
    const selectedKey = useMemo(
        () => location.pathname.split('/')?.filter(p => !!p)?.[0] || 'home',
        [location],
    )
    const navigate = useNavigate()
    const logoutMutation = useLogout()

    return (
        <Layout style={{ height: '100vh', width: '100vw' }}>
            <Layout.Header
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '30px',
                    width: '100%',
                    padding: '0 15px',
                }}
            >
                <div
                    style={{
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '2px',
                        alignItems: 'center',
                        minWidth: '32px',
                    }}
                >
                    P<BookOutlined />
                </div>
                <Menu
                    theme="dark"
                    mode="horizontal"
                    style={{ flex: '1', maxWidth: 'calc(100vw - 60px - 60px)' }}
                    items={[
                        {
                            key: 'home',
                            label: 'Home',
                        },
                        { key: 'items', label: 'Items' },
                        { key: 'activities', label: 'Activities' },
                        { key: 'diary', label: 'Diary' },
                        { key: 'history', label: 'History' },
                    ]}
                    onClick={({ key }) => {
                        navigate({ pathname: key })
                    }}
                    defaultSelectedKeys={[selectedKey]}
                />
                <Menu
                    expandIcon={<DownOutlined />}
                    theme="dark"
                    onClick={e => {
                        if (e.key === 'logout') {
                            logoutMutation.mutate()
                        } else if (e.key === 'profile') {
                            navigate({ pathname: '/profile' })
                        }
                        console.log(e)
                    }}
                    mode="vertical"
                    triggerSubMenuAction="click"
                    items={[
                        {
                            key: 'parent',
                            label: '',
                            icon: <UserOutlined />,
                            children: [
                                {
                                    key: 'profile',
                                    label: 'Profile',
                                },
                                {
                                    key: 'logout',
                                    label: 'Logout',
                                },
                            ],
                        },
                    ]}
                />
            </Layout.Header>
            <Layout.Content
                style={{
                    padding: '20px',
                    fontSize: '16px',
                    height: '100%',
                    overflowY: 'auto',
                    width: '100%',
                }}
            >
                <Outlet />
            </Layout.Content>
        </Layout>
    )
}

const RootLayout = () => {
    const { data: userData, status, fetchStatus } = useUserIsAuthenticated()
    if (!userData) {
        return <Spin />
    }
    if (!userData?.authenticated) {
        return <Login />
    }
    return <LoggedInRoot />
}

const routes = [
    {
        path: '/',
        element: <Navigate to={{ pathname: 'home' }} />,
    },
    {
        path: 'home',
        element: <Home />,
    },
    { path: 'profile', element: <Profile /> },
    {
        path: '/activities',
        element: (
            <div>
                <Outlet />
            </div>
        ),
        children: [
            { path: '', element: <Activities /> },
            {
                path: ':type',
                element: <AddActivity />,
            },
            {
                path: ':type/:token',
                element: <ActivityDetail />,
            },
        ],
    },
    {
        path: 'items',
        element: (
            <div>
                <Outlet />
            </div>
        ),
        children: [
            { path: '', element: <Items /> },
            { path: ':token', element: <ItemDetails /> },
        ],
    },
]

const baseRoutes = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        children: routes,
    },
])

export default App

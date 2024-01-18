import { ReactNode, useEffect, useMemo, useState } from 'react'
import './App.css'
import axios from 'axios'
import {
    Link,
    Navigate,
    Outlet,
    RouterProvider,
    createBrowserRouter,
    useLocation,
    useNavigate,
    useSearchParams,
} from 'react-router-dom'
import { ConfigProvider, FloatButton, Layout, Menu, Modal, Spin, ThemeConfig } from 'antd'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Home from 'pages/Home/Home.lazy'
import {
    BookOutlined,
    DownOutlined,
    EllipsisOutlined,
    PlusOutlined,
    QuestionOutlined,
    UserOutlined,
    VideoCameraOutlined,
} from '@ant-design/icons'
import Activities from 'pages/Activities/Activities.lazy'
import AddActivity from 'pages/Activities/AddActivity/AddActivity.lazy'
import ActivityDetail from 'pages/Activities/ActivityDetail/ActivityDetail.lazy'
import Login from 'pages/Login/Login.lazy'
import { useLogout, useUserIsAuthenticated } from 'services/auth_service'
import Items from 'pages/Items/Items.lazy'
import ItemDetails from 'pages/Items/ItemDetails/ItemDetails.lazy'
import Profile from 'pages/Profile/Profile.lazy'
import ProfileBasics from 'pages/Profile/ProfileBasics/ProfileBasics.lazy'
import ProfileItemTypes from 'pages/Profile/ProfileItemTypes/ProfileItemTypes.lazy'
import { useItemTypes } from 'services/item_type_service'
import { useUserSettings } from 'services/user_service'
import AddActivityModal from 'pages/AddActivityModal/AddActivityModal.lazy'
import ProfileActivityDefaults from 'pages/Profile/ProfileActivityDefaults/ProfileActivityDefaults.lazy'
import ActivityWrapper from 'pages/Activities/ActivityWrapper/ActivityWrapper'

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
    const { data: itemTypes } = useItemTypes()
    const { data: userSettings } = useUserSettings()

    const itemTypesInQuickMenu = useMemo(() => {
        const includedSlugs = userSettings?.itemTypesInQuickMenu ?? ['book', 'movie', 'video_game']
        const includedItemTypes = (itemTypes ?? []).filter(it => includedSlugs.includes(it.slug))
        return includedItemTypes
    }, [itemTypes, userSettings])

    const [addActivityModalOpen, setAddActivityModalOpen] = useState(false)
    const [searchParams, setSearchParams] = useSearchParams()

    useEffect(() => {
        if (searchParams.get('addAct')) {
            setAddActivityModalOpen(true)
            setSearchParams(prev => {
                prev.delete('addAct')
                return prev
            })
        }
    }, [searchParams, setSearchParams])
    return (
        <Layout style={{ height: '100vh', width: '100vw' }}>
            <Modal
                open={addActivityModalOpen}
                onCancel={() => {
                    setAddActivityModalOpen(false)
                }}
                footer={null}
                maskClosable
                closable={false}
            >
                <AddActivityModal
                    closeModal={() => {
                        setAddActivityModalOpen(false)
                    }}
                />
            </Modal>
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
                            navigate({ pathname: '/profile/basics' })
                        }
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
                <FloatButton.Group
                    trigger="click"
                    type="primary"
                    icon={<PlusOutlined />}
                >
                    {itemTypesInQuickMenu.map(it => (
                        <FloatButton
                            key={it.slug}
                            icon={
                                it.icon_url ? (
                                    <img
                                        style={{ height: '15px', width: '15px' }}
                                        src={it.icon_url}
                                    />
                                ) : (
                                    <QuestionOutlined />
                                )
                            }
                            description={it.name}
                            tooltip={`Add New ${it.name} Activity`}
                            href={`/activities/${it.slug}`}
                            shape="square"
                        />
                    ))}

                    <FloatButton
                        icon={<EllipsisOutlined />}
                        description="Other"
                        tooltip="Add New Activity"
                        onClick={() => {
                            setAddActivityModalOpen(true)
                        }}
                        shape="square"
                    />
                </FloatButton.Group>
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
    {
        path: 'profile',
        element: <Profile />,
        children: [
            { path: 'basics', element: <ProfileBasics /> },
            { path: 'activityDefaults', element: <ProfileActivityDefaults /> },
            { path: 'itemTypes', element: <ProfileItemTypes /> },
        ],
    },
    {
        path: '/activities',
        element: <Outlet />,
        children: [
            { path: '', element: <Activities /> },
            {
                path: ':type/:token',
                element: <ActivityWrapper />,
            },
            {
                path: ':type/',
                element: <AddActivity />,
            },
        ],
    },
    {
        path: 'items',
        element: <Outlet />,
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

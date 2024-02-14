import { Menu } from 'antd'
import { useWindowSize } from 'hooks/useWindowSize'
import { useMemo } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import styled from 'styled-components'

export interface ProfileProps {}

const ProfileDiv = styled.div`
    display: flex;
    flex-wrap: wrap;
    height: 100%;
    gap: 2em;

    @media screen and (max-width: 412px) {
        height: auto;
    }
`
const ProfileSider = styled.aside`
    background-color: white;
    flex: 1 1 200px;
    min-width: 200px;
    height: auto;
`
const ProfileMain = styled.main`
    flex: 1 1 70%;
`

const MOBILE_BREAK = 828

const INSTALLED_PLUGINS_TEMP = [{ key: 'plugins/goodreads', label: 'Goodreads' }]

const Profile = ({}: ProfileProps) => {
    const navigate = useNavigate()
    const location = useLocation()
    const tab = useMemo(() => location.pathname.split('/').at(-1) ?? 'basics', [location])
    const windowSize = useWindowSize()

    const menuItems = useMemo(() => {
        let base = [
            { key: 'basics', label: 'Basics' },
            { key: 'itemTypes', label: 'Item Types' },
            { key: 'activityDefaults', label: 'Add Activity Defaults' },
            { key: 'homeConfig', label: 'Home Screen Config' },
        ]
        const plugins = [
            {
                key: 'plugins',
                label: 'Plugins',
                type: 'group',
                children: [...INSTALLED_PLUGINS_TEMP],
            },
        ]
        if (INSTALLED_PLUGINS_TEMP.length) {
            base = [...base, ...plugins]
        }
        return base
    }, [])
    return (
        <ProfileDiv>
            <ProfileSider>
                <Menu
                    defaultSelectedKeys={[tab]}
                    mode={(windowSize?.width ?? 0) > MOBILE_BREAK ? 'vertical' : 'horizontal'}
                    items={menuItems}
                    onClick={({ key }) => {
                        navigate({ pathname: key })
                    }}
                />
            </ProfileSider>
            <ProfileMain>
                <Outlet />
            </ProfileMain>
        </ProfileDiv>
    )
}

export default Profile

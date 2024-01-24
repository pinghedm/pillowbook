import { Button, List, Spin, Typography } from 'antd'
import { useItems } from 'services/item_service'
import React from 'react'
import { useNavigate } from 'react-router-dom'

import { useActivities, useUpdateActivity } from 'services/activities_service'
import { usePagedResultData } from 'services/utils'
import { DateTime } from 'luxon'
import { useUserSettings } from 'services/user_service'
import { ActivityListItem, ItemListItem } from 'components/styled_list_items'

const HomePageRecentItems = () => {
    const {
        data: recentsPagedResult,
        isPending: recentsPending,
        fetchStatus: recentsStatus,
    } = useItems(1, 5, undefined, undefined, { key: 'created', order: 'descend' })
    const { data: recents } = usePagedResultData(recentsPagedResult)
    const navigate = useNavigate()

    

    return (
        <>
            <Typography.Title level={2}>Recently Added Items</Typography.Title>
            <List
                locale={{ emptyText: 'No Data' }}
                loading={recentsPending && recentsStatus !== 'idle'}
                size="small"
                dataSource={recents}
                renderItem={(item, index) => (
                    <ItemListItem 
                        item={item} 
                        path={`/items/${item.token}`} 
                        actions = {[<Button
                            type="primary"
                            href={`/activities/${item.item_type}/${item.token}`}
                            onClick={e => {e.stopPropagation()}}
                        >
                            Log Activity
                        </Button>]} />
                )}
            />
        </>
    )
}

const HomePagePendingActivities = () => {
    const {
        data: upcomingPagedResult,
        isPending: upcomingPending,
        fetchStatus: upcomingStatus,
    } = useActivities(1, 5, undefined, { completed: ['false'], pending: ['true'] })
    const { data: upcoming } = usePagedResultData(upcomingPagedResult)
    const activityUpdateMutation = useUpdateActivity()
    return (
        <>
            <Typography.Title level={2}>Upcoming Activities</Typography.Title>
            <List
                loading={upcomingPending && upcomingStatus !== 'idle'}
                size="small"
                dataSource={upcoming}
                locale={{ emptyText: 'No Data' }}
                renderItem={(item, index) => (
                    <ActivityListItem 
                        item={item}
                        path={`/activities/${item.item_type}/${item.token}`}
                        actions={[
                            <Button
                            type="primary"
                            onClick={(e) => {
                                e.preventDefault()
                                activityUpdateMutation.mutate({
                                    token: item.token,
                                    patch: { pending: false },
                                })
                            }}
                        >
                            Remove Pending
                        </Button>
                    ]} />
                )}
            />
        </>
    )
}

const HomePageInProgressActivities = () => {
    const {
        data: unfinishedPagedResult,
        isPending: unfinishedPending,
        fetchStatus: unfinishedStatus,
    } = useActivities(1, 5, undefined, { hasEndTime: ['false'], hasStartTime: ['true'] })
    const { data: unfinished } = usePagedResultData(unfinishedPagedResult)

    const activityUpdateMutation = useUpdateActivity()

    return (
        <>
            <Typography.Title level={2}>In Progress Activities</Typography.Title>
            <List
                loading={unfinishedPending && unfinishedStatus !== 'idle'}
                size="small"
                dataSource={unfinished}
                locale={{ emptyText: 'No Data' }}
                renderItem={(item, index) => (
                    <ActivityListItem 
                        item={item}
                        path={`/activities/${item.item_type}/${item.token}`}
                        actions={[
                            <Button
                            type="primary"
                            onClick={(e) => {
                                e.preventDefault()
                                activityUpdateMutation.mutate({
                                    token: item.token,
                                    patch: { end_time: DateTime.now().toISO() },
                                })
                            }}
                        >
                            Set End Time
                        </Button>
                    ]} />
                )}
            />
        </>
    )
}

const HomePagePinnedItems = () => {
    const {
        data: pinnedPagedResult,
        isPending,
        fetchStatus,
    } = useItems(1, 5, undefined, { pinned: ['true'] }, { key: 'created', order: 'descend' })
    const { data: pinnedItems } = usePagedResultData(pinnedPagedResult)
    const navigate = useNavigate()

    return (
        <>
            <Typography.Title level={2}>Pinned Items</Typography.Title>
            <List
                locale={{ emptyText: 'No Data' }}
                loading={isPending && fetchStatus !== 'idle'}
                size="small"
                dataSource={pinnedItems}
                renderItem={(item, index) => (
                    <ItemListItem 
                        item={item} 
                        path={`/items/${item.token}`} 
                        actions = {[<Button
                            type="primary"
                            href={`/activities/${item.item_type}/${item.token}`}
                            onClick={e => { e.stopPropagation() }}
                        >
                            Log Activity
                        </Button>]} />
                )}
            />
        </>
    )
}

export const HomeScreenModules = [
    {
        label: 'Recent Items',
        descr: "View Items you've recently created, with an option to quickly log a new activity against them",
        value: 'recentItems',
        component: <HomePageRecentItems />,
    },
    {
        label: 'Pending Activities',
        descr: 'View recently created Pending Activities, with an option to quickly transition them to neutral activities',
        value: 'pendingActivities',
        component: <HomePagePendingActivities />,
    },
    {
        label: 'In Progress Activities',
        descr: 'View recently created Activities that have a start time but no end time, with an option to quickly set the end time to now',
        value: 'inProgressActivities',
        component: <HomePageInProgressActivities />,
    },
    {
        label: 'Pinned Items',
        descr: "View Items you've deliberately pinned, with an option to quickly log a new activity against them",
        value: 'pinnedItems',
        component: <HomePagePinnedItems />,
    },
]
export const DefaultHomeScreenModules = ['recentItems', 'pendingActivities', 'pinnedItems']

export interface HomeProps {}

const Home = ({}: HomeProps) => {
    const { data: userSettings } = useUserSettings()
    if (!userSettings) {
        return <Spin />
    }
    return (
        <div>
            <Typography.Title level={2}>Whatcha Been Up To?</Typography.Title>
            {(userSettings?.homePageSettings?.activeModules ?? DefaultHomeScreenModules).map(
                val => (
                    <React.Fragment key={val}>
                        {
                            (
                                HomeScreenModules.find(hsm => hsm.value === val) ?? {
                                    component: null,
                                }
                            ).component
                        }
                    </React.Fragment>
                ),
            )}
        </div>
    )
}

export default Home

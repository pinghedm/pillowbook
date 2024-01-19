import { Button, FloatButton, Layout, List, Typography } from 'antd'
import { useItems } from 'services/item_service'
import React from 'react'
import { Link, Outlet } from 'react-router-dom'

import { Activity, useActivities, useUpdateActivity } from 'services/activities_service'
import { usePagedResultData } from 'services/utils'
import { DateTime } from 'luxon'

export interface HomeProps {}

const Home = ({}: HomeProps) => {
    const {
        data: recentsPagedResult,
        isPending: recentsPending,
        fetchStatus: recentsStatus,
    } = useItems(1, 5, undefined, undefined, { key: 'created', order: 'descend' })
    const { data: recents } = usePagedResultData(recentsPagedResult)

    const {
        data: upcomingPagedResult,
        isPending: upcomingPending,
        fetchStatus: upcomingStatus,
    } = useActivities(1, 5, undefined, { completed: ['false'], pending: ['true'] })
    const { data: upcoming } = usePagedResultData(upcomingPagedResult)

    const {
        data: unfinishedPagedResult,
        isPending: unfinishedPending,
        fetchStatus: unfinishedStatus,
    } = useActivities(1, 5, undefined, { hasEndTime: ['false'], hasStartTime: ['true'] })
    const { data: unfinished } = usePagedResultData(unfinishedPagedResult)

    const activityUpdateMutation = useUpdateActivity()

    return (
        <div style={{}}>
            <Typography.Title level={2}>Recently Added Items</Typography.Title>
            <List
                loading={recentsPending && recentsStatus !== 'idle'}
                size="small"
                dataSource={recents}
                renderItem={(item, index) => (
                    <List.Item>
                        <List.Item.Meta title={item.name} />
                        <Button
                            type="primary"
                            href={`/activities/${item.item_type}/${item.token}`}
                        >
                            Log Activity
                        </Button>
                    </List.Item>
                )}
            />
            <Typography.Title level={2}>Upcoming Activities</Typography.Title>
            <List
                loading={upcomingPending && upcomingStatus !== 'idle'}
                size="small"
                dataSource={upcoming}
                locale={{ emptyText: 'No Data' }}
                renderItem={(item, index) => (
                    <List.Item>
                        <List.Item.Meta title={item.item_name} />
                        <Button
                            type="primary"
                            onClick={() => {
                                activityUpdateMutation.mutate({
                                    token: item.token,
                                    patch: { pending: false },
                                })
                            }}
                        >
                            Remove Pending
                        </Button>
                    </List.Item>
                )}
            />

            <Typography.Title level={2}>In Progress Activities</Typography.Title>
            <List
                loading={unfinishedPending && unfinishedStatus !== 'idle'}
                size="small"
                dataSource={unfinished}
                locale={{ emptyText: 'No Data' }}
                renderItem={(item, index) => (
                    <List.Item>
                        <List.Item.Meta title={item.item_name} />
                        <Button
                            type="primary"
                            onClick={() => {
                                activityUpdateMutation.mutate({
                                    token: item.token,
                                    patch: { end_time: DateTime.now().toISO() },
                                })
                            }}
                        >
                            Set End Time
                        </Button>
                    </List.Item>
                )}
            />
        </div>
    )
}

export default Home

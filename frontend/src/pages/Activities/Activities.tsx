import { BookOutlined, QuestionCircleOutlined, StarFilled } from '@ant-design/icons'
import { List, Spin, Typography } from 'antd'
import React, { ReactNode } from 'react'
import { useActivities } from 'services/activities_service'
import { DateTime } from 'luxon'
import { capitalizeWords } from 'services/utils'
import { Link } from 'react-router-dom'

const ActivityIconByItemType: Record<string, ReactNode> = {
    book: <BookOutlined />,
}

export interface ActivitiesProps {}

const Activities = ({}: ActivitiesProps) => {
    const { data: activities, isPending, fetchStatus } = useActivities()

    if (!activities) {
        return <Spin />
    }
    return (
        <List
            style={{ backgroundColor: 'white', padding: '10px' }}
            loading={isPending && fetchStatus !== 'idle'}
            dataSource={activities}
            renderItem={(item, index) => (
                <Link to={{ pathname: `${item.item_type}/${item.token}` }}>
                    <List.Item
                        extra={
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    gap: '5px',
                                    alignItems: 'center',
                                }}
                            >
                                {item.rating ?? '-'} <StarFilled />
                            </div>
                        }
                        style={{ cursor: 'pointer' }}
                    >
                        <List.Item.Meta
                            title={<div>{item.item_name}</div>}
                            avatar={
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '10px',
                                    }}
                                >
                                    {ActivityIconByItemType?.[item.item_type] ?? (
                                        <QuestionCircleOutlined />
                                    )}
                                    {capitalizeWords(item.item_type)}
                                </div>
                            }
                            description={
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        gap: '5px',
                                        alignItems: 'center',
                                    }}
                                >
                                    {item.finished ? (
                                        <Typography.Text
                                            type="success"
                                            style={{
                                                borderRight: '1px solid lightgray',
                                                paddingRight: '5px',
                                            }}
                                        >
                                            Completed
                                        </Typography.Text>
                                    ) : (
                                        ''
                                    )}
                                    {item.start_time
                                        ? DateTime.fromISO(item.start_time).toLocaleString(
                                              DateTime.DATETIME_SHORT,
                                          )
                                        : '[No Start Time]'}{' '}
                                    -
                                    {item.end_time
                                        ? DateTime.fromISO(item.end_time).toLocaleString(
                                              DateTime.DATETIME_SHORT,
                                          )
                                        : '[No End Time]'}
                                </div>
                            }
                        />
                    </List.Item>
                </Link>
            )}
        />
    )
}

export default Activities

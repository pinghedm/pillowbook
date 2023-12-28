import {
    BookOutlined,
    PlusOutlined,
    QuestionCircleOutlined,
    SearchOutlined,
    StarFilled,
} from '@ant-design/icons'
import { Button, Cascader, Input, List, Spin, Typography } from 'antd'
import React, { ReactNode, useMemo } from 'react'
import { ActivityIconByItemType, useActivities } from 'services/activities_service'
import { DateTime } from 'luxon'
import { capitalizeWords } from 'services/utils'
import { Link, useSearchParams } from 'react-router-dom'
import { useUserSettings } from 'services/user_service'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useItemTypes } from 'services/item_type_service'
import { isFilesArray } from '@rjsf/utils'

interface FilterInfo {
    search?: string
    filters: {
        itemTypes?: string[]
        completed?: string[] // tragically, cascader doesnt allow bool
        items?: string[]
    }
}

export interface ActivitiesProps {}

const Activities = ({}: ActivitiesProps) => {
    const { data: activities, isPending, fetchStatus } = useActivities()
    const { data: userSettings } = useUserSettings()

    const { data: filterInfo } = useQuery<FilterInfo>({
        queryKey: ['activityList', 'filterInfo'],
        queryFn: () => ({
            filters: {},
        }),
        initialData: {
            search: '',
            filters: {},
        },
    })

    const filteredActivities = useMemo(() => {
        const canonicalSearchQuery = (filterInfo?.search ?? '').trim().toLowerCase()
        return (activities ?? [])
            .filter(a => a.item_name.toLowerCase().includes(canonicalSearchQuery))
            .filter(a => {
                const types = filterInfo.filters?.itemTypes ?? []
                const items = filterInfo.filters?.items ?? []
                const completes = filterInfo.filters?.completed ?? []

                const typeMatch = types.length ? types.includes(a.item_type) : true
                const itemMatch = items.length ? items.includes(a.item_name) : true
                const completedMatch = completes.length
                    ? completes.map(str => str === 'true').includes(a.finished)
                    : true

                return typeMatch && itemMatch && completedMatch
            })
            .sort((a1, a2) => (a1.end_time < a2.end_time ? -1 : 1))
            .reverse()
    }, [filterInfo, activities])
    const activityLength = useMemo(() => filteredActivities.length, [filteredActivities])
    const queryClient = useQueryClient()
    const [_, setSearchParams] = useSearchParams()

    const { data: itemTypes } = useItemTypes()

    const cascadeOptions = useMemo(() => {
        // TODO: get from API when backend page
        const uniqueItemTypes = Array.from(new Set(activities?.map(a => a.item_type) ?? [])).sort()
        const uniqueFilteredItems = Array.from(
            new Set(
                (activities?.map(a => [a.item_name, a.item_type]) ?? [])
                    .filter(([name, type]) => {
                        const types = filterInfo.filters?.itemTypes ?? []
                        const typeMatch = types.length ? types.includes(type) : true
                        return typeMatch
                    })
                    .map(([name, type]) => name),
            ),
        ).sort()

        const itemTypeBySlug = Object.fromEntries(itemTypes?.map(it => [it.slug, it]) ?? [])
        const options: {
            label: string
            value: keyof FilterInfo['filters']
            isLeaf: false
            children: { label: string; value: string; key: string; isLeaf: true }[]
        }[] = [
            {
                label: 'Item Type',
                value: 'itemTypes',
                isLeaf: false,
                children: uniqueItemTypes.map(it => ({
                    label: itemTypeBySlug[it].name,
                    value: it,
                    key: it,
                    isLeaf: true,
                })),
            },
            {
                label: 'Item',
                value: 'items',
                isLeaf: false,
                children: uniqueFilteredItems.map(name => ({
                    label: name,
                    value: name,
                    key: name,
                    isLeaf: true,
                })),
            },
            {
                label: 'Completed',
                value: 'completed',
                isLeaf: false,
                children: [
                    {
                        value: 'true',
                        label: 'True',
                        key: 'true',
                        isLeaf: true,
                    },
                    { value: 'false', label: 'False', key: 'false', isLeaf: true },
                ],
            },
        ]
        return options
    }, [activities, itemTypes, filterInfo])

    return (
        <div style={{ height: '100%' }}>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '10px',
                    alignItems: 'center',
                    marginBottom: '10px',
                    height: '32px',
                }}
            >
                <Input
                    allowClear
                    prefix={<SearchOutlined />}
                    style={{ flex: 2, maxWidth: '350px' }}
                    value={filterInfo?.search ?? ''}
                    onChange={e => {
                        queryClient.setQueryData(['activityList', 'filterInfo'], {
                            ...filterInfo,
                            search: e.target.value,
                        })
                    }}
                />
                <Cascader
                    style={{ flex: 1, maxWidth: '350px' }}
                    allowClear
                    maxTagCount="responsive"
                    multiple
                    options={cascadeOptions}
                    onChange={(value, selectedOptions) => {
                        const filters: FilterInfo['filters'] = {}
                        value
                            .filter(v => v.length === 2)
                            .forEach(([filterCat, filterVal]) => {
                                // @ts-ignore - idk what it wants
                                filters[filterCat] = [...(filters?.[filterCat] ?? []), filterVal]
                            })
                        queryClient.setQueryData(['activityList', 'filterInfo'], {
                            ...filterInfo,
                            filters,
                        })
                    }}
                    value={Object.entries(filterInfo.filters).flatMap(([k, vs]) =>
                        vs.flatMap(v => [k, v]),
                    )}
                />
                <Button
                    icon={<PlusOutlined />}
                    type="primary"
                    onClick={() => {
                        setSearchParams(params => {
                            params.append('addAct', '1')
                            return params
                        })
                    }}
                >
                    Add
                </Button>
            </div>
            <List
                style={{
                    backgroundColor: 'white',
                    padding: '10px',
                    height: 'calc(100% - 40px)',
                    overflowY: 'auto',
                }}
                pagination={{
                    pageSize: activityLength < 20 ? activityLength : 20,
                    hideOnSinglePage: true,
                }}
                loading={isPending && fetchStatus !== 'idle'}
                dataSource={filteredActivities}
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
                                    {item.rating
                                        ? (item.rating * (userSettings?.ratingMax ?? 5)).toFixed(1)
                                        : '-'}{' '}
                                    <StarFilled />
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
        </div>
    )
}

export default Activities

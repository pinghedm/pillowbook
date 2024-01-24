import { PlusOutlined, QuestionCircleOutlined, SearchOutlined, StarFilled } from '@ant-design/icons'
import { Button, Cascader, Input, List, Typography } from 'antd'
import { useMemo } from 'react'
import {
    FilterInfo,
    FilterInfoFilters,
    useActivities,
    useActivityStaticFilters,
} from 'services/activities_service'
import { DateTime } from 'luxon'
import { capitalizeWords, usePagedResultData } from 'services/utils'
import { useSearchParams } from 'react-router-dom'
import { useUserSettings } from 'services/user_service'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ActivityListItem } from 'components/styled_list_items'

const PAGE_SIZE = 20
export interface ActivitiesProps {}

const Activities = ({}: ActivitiesProps) => {
    const { data: filterInfo } = useQuery<FilterInfo>({
        queryKey: ['activityList', 'filterInfo'],
        queryFn: () => ({
            pageNumber: 1,
        }),
        initialData: {
            pageNumber: 1,
        },
    })
    const {
        data: activitiesPagedResult,
        isPending,
        fetchStatus,
    } = useActivities(filterInfo.pageNumber, PAGE_SIZE, filterInfo.search, filterInfo.filters)
    const { data: activities, total: totalNumActivities } =
        usePagedResultData(activitiesPagedResult)
    const { data: userSettings } = useUserSettings()

    const queryClient = useQueryClient()
    const [_, setSearchParams] = useSearchParams()

    const { data: staticFilters } = useActivityStaticFilters()

    const cascadeOptions = useMemo(() => {
        // TODO: get from API when backend page

        const options: {
            label: string
            value: keyof FilterInfoFilters
            isLeaf: false
            children: { label: string; value: string; isLeaf: true; key: string }[]
        }[] = [
            {
                label: 'Item Type',
                value: 'itemTypes',
                isLeaf: false,
                children: (staticFilters?.itemTypes ?? []).map(it => ({
                    ...it,
                    key: it.value,
                    isLeaf: true,
                })),
            },
            {
                label: 'Item',
                value: 'items',
                isLeaf: false,
                children: (staticFilters?.items ?? []).map(i => ({
                    ...i,
                    key: i.value,
                    isLeaf: true,
                })),
            },
            {
                label: 'Finished Item',
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
            {
                label: 'Pending',
                value: 'pending',
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
            {
                label: 'Has Start Time',
                value: 'hasStartTime',
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
            {
                label: 'Has End Time',
                value: 'hasEndTime',
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
    }, [staticFilters])
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
                    placeholder="Search Activities"
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
                    placeholder="Filter Activities"
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
                    value={Object.entries(filterInfo?.filters ?? {}).flatMap(([k, vs]) =>
                        vs.map(v => [k, v]),
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
                    pageSize: PAGE_SIZE,
                    hideOnSinglePage: true,
                    total: totalNumActivities,
                    onChange: (page: number, pageSize: number) => {
                        queryClient.setQueryData(['activityList', 'filters'], {
                            ...filterInfo,
                            pageNumber: page,
                        })
                    },
                }}
                loading={isPending && fetchStatus !== 'idle'}
                dataSource={activities}
                renderItem={(item, index) => (
                    <ActivityListItem
                        path={`${item.item_type}/${item.token}`}
                        item={item}
                        extras={[<div
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
                        </div>]}
                        />
                )}
            />
        </div>
    )
}

export default Activities

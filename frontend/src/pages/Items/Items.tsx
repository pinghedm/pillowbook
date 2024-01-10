import {
    PlusOutlined,
    QuestionCircleOutlined,
    QuestionOutlined,
    SearchOutlined,
    StarFilled,
} from '@ant-design/icons'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Cascader, Input, List } from 'antd'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
    ItemFilterInfo,
    ItemFilterInfoFilters,
    useItemStaticFilters,
    useItems,
} from 'services/item_service'
import { useItemTypes } from 'services/item_type_service'
import { useUserSettings } from 'services/user_service'
import { capitalizeWords, usePagedResultData } from 'services/utils'

export interface ItemsProps {}

const PAGE_SIZE = 20

const Items = ({}: ItemsProps) => {
    const { data: filterInfo } = useQuery<ItemFilterInfo>({
        queryKey: ['itemList', 'filters'],
        queryFn: () => ({
            pageNumber: 1,
        }),
        initialData: {
            pageNumber: 1,
        },
    })

    const {
        data: pagedItemResult,
        isPending,
        fetchStatus,
    } = useItems(
        filterInfo.pageNumber,
        PAGE_SIZE,
        filterInfo?.searchQuery,
        filterInfo.filters,
        filterInfo.ordering,
    )

    const { data: items, total: totalNumItems } = usePagedResultData(pagedItemResult)

    const { data: userSettings } = useUserSettings()

    const queryClient = useQueryClient()
    const { data: staticFilters } = useItemStaticFilters()

    const cascadeOptions = useMemo(() => {
        const options: {
            label: string
            value: keyof ItemFilterInfoFilters
            isLeaf: false
            children: { label: string; value: string; key: string; isLeaf: true }[]
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
                    allowClear
                    prefix={<SearchOutlined />}
                    style={{ flex: 2, maxWidth: '350px' }}
                    value={filterInfo?.searchQuery ?? ''}
                    onChange={e => {
                        queryClient.setQueryData(['itemList', 'filters'], {
                            ...filterInfo,
                            searchQuery: e.target.value,
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
                        const filters: ItemFilterInfo['filters'] = {}
                        value
                            .filter(v => v.length === 2)
                            .forEach(([filterCat, filterVal]) => {
                                // @ts-ignore - idk what it wants
                                filters[filterCat] = [...(filters?.[filterCat] ?? []), filterVal]
                            })
                        queryClient.setQueryData(['itemList', 'filters'], {
                            ...filterInfo,
                            filters,
                        })
                    }}
                    value={Object.entries(filterInfo?.filters ?? {}).flatMap(([k, vs]) =>
                        vs.map(v => [k, v]),
                    )}
                />
            </div>
            <List
                style={{
                    backgroundColor: 'white',
                    padding: '10px',
                    height: 'calc(100% - 40px)',
                    overflowY: 'auto',
                }}
                loading={isPending && fetchStatus !== 'idle'}
                pagination={{
                    pageSize: PAGE_SIZE,
                    hideOnSinglePage: true,
                    total: totalNumItems,
                    onChange: (page: number, pageSize: number) => {
                        queryClient.setQueryData(['itemList', 'filters'], {
                            ...filterInfo,
                            pageNumber: page,
                        })
                    },
                }}
                dataSource={items}
                renderItem={(item, index) => (
                    <Link to={{ pathname: item.token }}>
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
                                title={<div>{item.name}</div>}
                                avatar={
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '10px',
                                        }}
                                    >
                                        {item.icon_url ? (
                                            <img
                                                style={{ height: '50px', width: '50px' }}
                                                src={item.icon_url}
                                            />
                                        ) : (
                                            <QuestionOutlined />
                                        )}
                                        {capitalizeWords(item.item_type)}
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

export default Items

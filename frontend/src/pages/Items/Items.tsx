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
import { useItems } from 'services/item_service'
import { useItemTypes } from 'services/item_type_service'
import { useUserSettings } from 'services/user_service'
import { capitalizeWords } from 'services/utils'

interface FilterInfo {
    search?: string
    filters: {
        itemTypes?: string[]
    }
}

export interface ItemsProps {}

const Items = ({}: ItemsProps) => {
    const { data: items, isPending, fetchStatus } = useItems()
    const { data: userSettings } = useUserSettings()
    const { data: filterInfo } = useQuery<FilterInfo>({
        queryKey: ['itemList', 'filterInfo'],
        queryFn: () => ({
            filters: {},
        }),
        initialData: {
            search: '',
            filters: {},
        },
    })
    const queryClient = useQueryClient()
    const { data: itemTypes } = useItemTypes()

    const filteredItems = useMemo(() => {
        const canonicalSearchQuery = (filterInfo?.search ?? '').trim().toLowerCase()
        return (items ?? [])
            .filter(i => i.name.toLowerCase().includes(canonicalSearchQuery))
            .filter(i => {
                const types = filterInfo.filters?.itemTypes ?? []

                const typeMatch = types.length ? types.includes(i.item_type) : true

                return typeMatch
            })
            .sort((a1, a2) => a1.name.localeCompare(a2.name))
            .reverse()
    }, [filterInfo, items])

    const itemLength = useMemo(() => filteredItems.length, [filteredItems])

    const cascadeOptions = useMemo(() => {
        // TODO: get from API when backend page
        const uniqueItemTypes = Array.from(new Set(items?.map(i => i.item_type) ?? [])).sort()
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
        ]
        return options
    }, [items, itemTypes])
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
                        queryClient.setQueryData(['itemList', 'filterInfo'], {
                            ...filterInfo,
                            filters,
                        })
                    }}
                    value={Object.entries(filterInfo.filters).flatMap(([k, vs]) =>
                        vs.flatMap(v => [k, v]),
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
                    pageSize: itemLength < 20 ? itemLength : 20,
                    hideOnSinglePage: true,
                }}
                dataSource={filteredItems}
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
                                        {itemTypes?.find(it => it.slug === item.item_type)
                                            ?.icon_url ? (
                                            <img
                                                style={{ height: '50px', width: '50px' }}
                                                src={
                                                    itemTypes?.find(
                                                        it => it.slug === item.item_type,
                                                    )?.icon_url ?? ''
                                                }
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

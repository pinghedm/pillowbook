import {
    PushpinFilled,
    PushpinOutlined,
    SearchOutlined,
    StarFilled,
} from '@ant-design/icons'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Cascader, Input, List } from 'antd'
import { ItemListItem } from 'components/styled_list_items'
import { useMemo } from 'react'
import {
    ItemFilterInfo,
    ItemFilterInfoFilters,
    useItemStaticFilters,
    useItems,
    useUpdateItem,
} from 'services/item_service'
import { useUserSettings } from 'services/user_service'
import { usePagedResultData } from 'services/utils'

export interface ItemsProps {}

const PAGE_SIZE = 20

const Items = ({}: ItemsProps) => {
    const { data: filterInfo } = useQuery<ItemFilterInfo>({
        queryKey: ['itemList', 'filters'],
        initialData: {
            pageNumber: 1,
            ordering: { key: 'created', order: 'descend' },
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
            {
                label: 'Pinned',
                value: 'pinned',
                isLeaf: false,
                children: [
                    {
                        label: 'False',
                        value: 'false',
                        key: 'false',
                        isLeaf: true,
                    },
                    {
                        label: 'True',
                        value: 'true',
                        key: 'true',
                        isLeaf: true,
                    },
                ],
            },
        ]
        return options
    }, [staticFilters])
    const updateItemMutation = useUpdateItem()

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
                    placeholder="Search Items"
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
                    placeholder="Filter Items"
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
                    <ItemListItem 
                        path={`${item.token}`}
                        item={item}
                        actions={[
                            <Button
                                icon={item.pinned ? <PushpinFilled /> : <PushpinOutlined />}
                                onClick={e => {
                                    e.preventDefault()
                                    updateItemMutation.mutate({
                                        token: item.token,
                                        patch: { pinned: !item.pinned },
                                    })
                                }}
                            />,
                        ]}
                        extras={[
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
                        ]}/>
                )}
            />
        </div>
    )
}

export default Items

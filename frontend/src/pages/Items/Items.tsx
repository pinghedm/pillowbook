import { QuestionCircleOutlined, StarFilled } from '@ant-design/icons'
import { List } from 'antd'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ItemIconByItemType, useItems } from 'services/item_service'
import { useUserSettings } from 'services/user_service'
import { capitalizeWords } from 'services/utils'

export interface ItemsProps {}

const Items = ({}: ItemsProps) => {
    const { data: items, isPending, fetchStatus } = useItems()
    const itemLength = useMemo(() => items?.length ?? 0, [items])
    const { data: userSettings } = useUserSettings()

    return (
        <List
            style={{ backgroundColor: 'white', padding: '10px', height: '100%', overflowY: 'auto' }}
            loading={isPending && fetchStatus !== 'idle'}
            pagination={{
                pageSize: itemLength < 20 ? itemLength : 20,
                hideOnSinglePage: true,
            }}
            dataSource={items ?? []}
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
                                    {ItemIconByItemType?.[item.item_type] ?? (
                                        <QuestionCircleOutlined />
                                    )}
                                    {capitalizeWords(item.item_type)}
                                </div>
                            }
                        />
                    </List.Item>
                </Link>
            )}
        />
    )
}

export default Items

import { QuestionCircleOutlined, StarFilled } from '@ant-design/icons'
import { List } from 'antd'
import { Link } from 'react-router-dom'
import { ItemIconByItemType, useItems } from 'services/item_service'
import { capitalizeWords } from 'services/utils'

export interface ItemsProps {}

const Items = ({}: ItemsProps) => {
    const { data: items, isPending, fetchStatus } = useItems()

    return (
        <List
            style={{ backgroundColor: 'white', padding: '10px' }}
            loading={isPending && fetchStatus !== 'idle'}
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
                                {item.rating ?? '-'} <StarFilled />
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

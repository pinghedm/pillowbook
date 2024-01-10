import { AutoComplete, Popover, Form, Input, InputNumber, Spin, Button, Select, Space } from 'antd'
import { useParams } from 'react-router-dom'
import { useItem, useUpdateItem } from 'services/item_service'
import { useItemType, useItemTypeAutoCompleteSuggestions } from 'services/item_type_service'
import { useUserSettings } from 'services/user_service'
import { PlusOutlined } from '@ant-design/icons'
import AddItem from 'pages/AddItem/AddItem.lazy'

export interface ItemDetailsProps {}

const ItemDetails = ({}: ItemDetailsProps) => {
    const { token } = useParams()
    const { data: item } = useItem(token)
    const { data: itemType } = useItemType(item?.item_type)
    const { data: parentItemType } = useItemType(itemType?.parent_slug ?? '')
    const updateItemMutation = useUpdateItem()
    const { data: userSettings } = useUserSettings()
    const { data: autocompleteChoices } = useItemTypeAutoCompleteSuggestions(itemType?.slug ?? '')

    if (!item || !itemType) {
        return <Spin />
    }

    return (
        <Form
            labelAlign="left"
            labelWrap
            labelCol={{ span: 1 }}
            initialValues={{
                ...item?.info,
                item__Notes: item.notes,
                item__Rating: item?.rating
                    ? item?.rating * (userSettings?.ratingMax ?? 5)
                    : undefined,
                item__Parent: item?.parent_token,
            }}
            onFinish={vals => {
                if (!item) {
                    return
                }
                const formData = { ...vals }
                const parentToken =
                    parentItemType && vals['item__Parent'] ? vals.item__Parent : false
                const itemDetails = {
                    rating: vals.item__Rating
                        ? vals.item__Rating / (userSettings?.ratingMax ?? 5)
                        : undefined,
                    notes: vals.item__Notes,
                    parent_token: parentToken,
                }
                delete formData['item__Notes']
                delete formData['item__Rating']
                delete formData['item__Parent']
                const itemInfo = {
                    ...formData,
                }
                updateItemMutation.mutate({
                    token: item.token,
                    patch: { info: itemInfo, ...itemDetails },
                })
            }}
        >
            {Object.entries(itemType.item_schema.properties ?? {}).map(([fieldName, fieldData]) =>
                typeof fieldData === 'boolean' ? null : (
                    <Form.Item
                        key={fieldName}
                        label={fieldData?.title ?? fieldName}
                        name={fieldName}
                        rules={[
                            {
                                required: itemType.item_schema?.required?.includes(fieldName),
                                message: `${fieldData?.title ?? fieldName} is required`,
                            },
                        ]}
                    >
                        {fieldData.type === 'string' ? (
                            <AutoComplete
                                allowClear
                                filterOption
                                style={{ maxWidth: '300px' }}
                                options={autocompleteChoices?.[fieldName]}
                            />
                        ) : fieldData.type === 'number' ? (
                            <InputNumber />
                        ) : (
                            <div>UnsupportedType</div>
                        )}
                    </Form.Item>
                ),
            )}
            {parentItemType ? (
                <Form.Item label={parentItemType.name}>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: '5px',
                            alignItems: 'center',
                        }}
                    >
                        <Form.Item name="item__Parent">
                            <Select
                                allowClear
                                style={{ width: '300px' }}
                                filterOption
                                options={autocompleteChoices?.[parentItemType.slug]}
                                showSearch
                            />
                        </Form.Item>
                        <Popover
                            trigger={['click']}
                            content={
                                <div style={{ width: '50vw' }}>
                                    <AddItem
                                        itemTypeSlug={parentItemType.slug}
                                        setAsParentTo={item.token}
                                    />
                                </div>
                            }
                        >
                            <Button icon={<PlusOutlined />} />
                        </Popover>
                    </div>
                </Form.Item>
            ) : null}
            <Form.Item
                name="item__Rating"
                label="Rating"
            >
                <InputNumber max={userSettings?.ratingMax ?? 5} />
            </Form.Item>
            <Form.Item
                name="item__Notes"
                label="Notes"
            >
                <Input.TextArea style={{ maxWidth: '400px' }} />
            </Form.Item>
            <Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={updateItemMutation.isPending}
                >
                    Update
                </Button>
            </Form.Item>
        </Form>
    )
}

export default ItemDetails

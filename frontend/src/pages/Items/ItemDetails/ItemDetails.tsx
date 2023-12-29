import { RJSFSchema } from '@rjsf/utils'
import { AutoComplete, Button, Form, Input, InputNumber, Spin } from 'antd'
import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useItem, useUpdateItem } from 'services/item_service'
import { useItemType, useItemTypeAutoCompleteSuggestions } from 'services/item_type_service'
import { useUserSettings } from 'services/user_service'
import { capitalizeWords } from 'services/utils'

export interface ItemDetailsProps {}

const ItemDetails = ({}: ItemDetailsProps) => {
    const { token } = useParams()
    const { data: item } = useItem(token)
    const { data: itemType } = useItemType(item?.item_type)
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
            }}
            onFinish={vals => {
                if (!item) {
                    return
                }
                const formData = { ...vals }
                const itemDetails = {
                    rating: vals.item__Rating
                        ? vals.item__Rating / (userSettings?.ratingMax ?? 5)
                        : undefined,
                    notes: vals.item__Notes,
                }
                delete formData['item__Notes']
                delete formData['item__Rating']
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
                                options={autocompleteChoices?.[fieldName].map(v => ({
                                    value: v,
                                    label: v,
                                    key: v,
                                }))}
                            />
                        ) : fieldData.type === 'number' ? (
                            <InputNumber />
                        ) : (
                            <div>UnsupportedType</div>
                        )}
                    </Form.Item>
                ),
            )}
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

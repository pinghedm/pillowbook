import { AutoComplete, Button, Form, Input, InputNumber, Spin } from 'antd'
import React from 'react'
import { useCreateItem, Item } from 'services/item_service'
import { useItemType, useItemTypeAutoCompleteSuggestions } from 'services/item_type_service'
import { useUserSettings } from 'services/user_service'

export interface AddItemProps {
    itemTypeSlug: string
    onFinishCreated?: (createdItem: Item) => void
    setAsParentTo?: string
}

const AddItem = ({ itemTypeSlug, setAsParentTo, onFinishCreated }: AddItemProps) => {
    const { data: itemType } = useItemType(itemTypeSlug)
    const { data: userSettings } = useUserSettings()
    const { data: autocompleteChoices } = useItemTypeAutoCompleteSuggestions(itemType?.slug ?? '')
    const createItemMutation = useCreateItem()
    if (!itemType) {
        return <Spin />
    }

    return (
        <Form
            labelAlign="left"
            labelWrap
            labelCol={{ span: 1 }}
            onFinish={vals => {
                createItemMutation.mutate(
                    {
                        item_type: itemTypeSlug,
                        info: vals,
                        setAsParentTo,
                    },
                    { onSuccess: onFinishCreated },
                )
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
                            <InputNumber precision={0} />
                        ) : (
                            <div>UnsupportedType</div>
                        )}
                    </Form.Item>
                ),
            )}
            <Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={createItemMutation.isPending}
                >
                    Create
                </Button>
            </Form.Item>
        </Form>
    )
}

export default AddItem

import { AutoComplete, Button, Form, Input, InputNumber, Spin, Typography } from 'antd'
import { FormWrap, LabeledFormRow } from 'components/FormWrappers'
import React, { useState } from 'react'
import { useCreateItem, Item, CreateItemType } from 'services/item_service'
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

    const [newItem, setNewItem] = useState<CreateItemType>({
        item_type: itemTypeSlug,
        info: {},
        setAsParentTo,
    })
    if (!itemType) {
        return <Spin />
    }

    return (
        <FormWrap>
            {Object.entries(itemType.item_schema.properties ?? {}).map(([fieldName, fieldData]) =>
                typeof fieldData === 'boolean' ? null : (
                    <LabeledFormRow key={fieldName}>
                        <Typography.Text>{fieldData?.title ?? fieldName}</Typography.Text>

                        {fieldData.type === 'string' ? (
                            <AutoComplete
                                value={newItem.info?.[fieldName] || ''}
                                onSelect={val => {
                                    setNewItem(i => ({
                                        ...i,
                                        info: { ...i.info, [fieldName]: val },
                                    }))
                                }}
                                onChange={val => {
                                    setNewItem(i => ({
                                        ...i,
                                        info: { ...i.info, [fieldName]: val },
                                    }))
                                }}
                                allowClear
                                filterOption
                                style={{ maxWidth: '300px', flex: 1 }}
                                options={autocompleteChoices?.[fieldName]}
                                status={
                                    itemType.item_schema?.required?.includes(fieldName) &&
                                    !newItem.info?.[fieldName]
                                        ? 'error'
                                        : undefined
                                }
                            />
                        ) : fieldData.type === 'number' ? (
                            <InputNumber
                                precision={-1 * Math.log10(fieldData?.multipleOf ?? 1)}
                                value={newItem.info?.[fieldName] || ''}
                                onChange={val => {
                                    setNewItem(i => ({
                                        ...i,
                                        info: { ...i.info, [fieldName]: Number(val) },
                                    }))
                                }}
                            />
                        ) : (
                            <div>UnsupportedType</div>
                        )}
                    </LabeledFormRow>
                ),
            )}
            <div>
                <Button
                    disabled={
                        !itemType?.item_schema?.required?.every(
                            fieldName => !!newItem.info?.[fieldName],
                        )
                    }
                    type="primary"
                    loading={createItemMutation.isPending}
                    onClick={() => {
                        createItemMutation.mutate(newItem, { onSuccess: onFinishCreated })
                    }}
                >
                    Create
                </Button>
            </div>
        </FormWrap>
    )
}

export default AddItem

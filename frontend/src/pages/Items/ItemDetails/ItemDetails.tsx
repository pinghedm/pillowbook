import {
    AutoComplete,
    Popover,
    Input,
    InputNumber,
    Spin,
    Button,
    Select,
    Typography,
    Alert,
    Popconfirm,
    Switch,
} from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { useDeleteItem, useItem, useUpdateItem } from 'services/item_service'
import { useItemType, useItemTypeAutoCompleteSuggestions } from 'services/item_type_service'
import { useUserSettings } from 'services/user_service'
import { PlusOutlined } from '@ant-design/icons'
import AddItem from 'pages/AddItem/AddItem.lazy'
import { FormWrap, LabeledFormRow } from 'components/FormWrappers'
import { useState } from 'react'

export interface ItemDetailsProps {}

const ItemDetails = ({}: ItemDetailsProps) => {
    const { token } = useParams()
    const { data: item } = useItem(token)
    const { data: itemType } = useItemType(item?.item_type)
    const { data: parentItemType } = useItemType(itemType?.parent_slug ?? '')
    const updateItemMutation = useUpdateItem()
    const { data: userSettings } = useUserSettings()
    const { data: autocompleteChoices } = useItemTypeAutoCompleteSuggestions(itemType?.slug ?? '')
    const [saving, setSaving] = useState(false)
    const deleteItemMutation = useDeleteItem()
    const navigate = useNavigate()

    if (!item || !itemType) {
        return <Spin />
    }

    return (
        <FormWrap>
            <Typography.Title level={2}>{item.name}</Typography.Title>
            {saving ? (
                <Alert
                    type="success"
                    message="saving"
                />
            ) : null}
            {Object.entries(itemType.item_schema.properties ?? {}).map(([fieldName, fieldData]) =>
                typeof fieldData === 'boolean' ? null : (
                    <LabeledFormRow key={fieldName}>
                        <Typography.Text>
                            {fieldData?.title ?? fieldName}{' '}
                            {itemType?.item_schema?.required?.includes(fieldName) ? (
                                <span style={{ color: 'red' }}>*</span>
                            ) : null}
                        </Typography.Text>
                        {fieldData.type === 'string' ? (
                            <AutoComplete
                                allowClear={!itemType?.item_schema?.required?.includes(fieldName)}
                                filterOption
                                style={{ maxWidth: '300px', flex: 1 }}
                                options={autocompleteChoices?.[fieldName]}
                                onSelect={val => {
                                    setSaving(true)
                                    updateItemMutation.mutate(
                                        {
                                            token: item.token,
                                            patch: { info: { ...item.info, [fieldName]: val } },
                                        },
                                        {
                                            onSettled: () => {
                                                setTimeout(() => {
                                                    setSaving(false)
                                                }, 300)
                                            },
                                        },
                                    )
                                }}
                                defaultValue={item.info?.[fieldName]}
                                onBlur={e => {
                                    if (
                                        itemType?.item_schema?.required?.includes(fieldName) &&
                                        //@ts-ignore
                                        !e.target.value
                                    ) {
                                        return
                                    }
                                    setSaving(true)
                                    updateItemMutation.mutate(
                                        {
                                            token: item.token,
                                            patch: {
                                                //@ts-ignore
                                                info: { ...item.info, [fieldName]: e.target.value },
                                            },
                                        },
                                        {
                                            onSettled: () => {
                                                setTimeout(() => {
                                                    setSaving(false)
                                                }, 300)
                                            },
                                        },
                                    )
                                }}
                            />
                        ) : fieldData.type === 'number' ? (
                            <InputNumber
                                precision={0}
                                defaultValue={item.info?.[fieldName]}
                                onChange={val => {
                                    if (
                                        itemType?.item_schema?.required?.includes(fieldName) &&
                                        !(val || val === 0)
                                    ) {
                                        return
                                    }
                                    setSaving(true)
                                    updateItemMutation.mutate(
                                        {
                                            token: item.token,
                                            patch: { info: { ...item.info, [fieldName]: val } },
                                        },
                                        {
                                            onSettled: () => {
                                                setTimeout(() => {
                                                    setSaving(false)
                                                }, 300)
                                            },
                                        },
                                    )
                                }}
                            />
                        ) : (
                            <div>UnsupportedType</div>
                        )}
                    </LabeledFormRow>
                ),
            )}
            {parentItemType ? (
                <LabeledFormRow>
                    <Typography.Text>Parent</Typography.Text>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: '5px',
                            alignItems: 'center',
                        }}
                    >
                        <Select
                            allowClear
                            value={item?.parent_token}
                            onChange={val => {
                                setSaving(true)
                                updateItemMutation.mutate(
                                    {
                                        token: item.token,
                                        patch: { parent_token: val },
                                    },
                                    {
                                        onSettled: () => {
                                            setTimeout(() => {
                                                setSaving(false)
                                            }, 300)
                                        },
                                    },
                                )
                            }}
                            style={{ width: '300px' }}
                            filterOption
                            options={autocompleteChoices?.[parentItemType.slug]}
                            showSearch
                        />
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
                </LabeledFormRow>
            ) : null}
            <LabeledFormRow>
                <Typography.Text>Rating</Typography.Text>
                <InputNumber
                    precision={2}
                    max={userSettings?.ratingMax ?? 5}
                    defaultValue={
                        item.rating !== null
                            ? item.rating * (userSettings?.ratingMax ?? 5)
                            : undefined
                    }
                    onChange={val => {
                        setSaving(true)
                        updateItemMutation.mutate(
                            {
                                token: item.token,
                                patch: {
                                    rating:
                                        val !== null
                                            ? Number(val) / (userSettings?.ratingMax ?? 5)
                                            : null,
                                },
                            },
                            {
                                onSettled: () => {
                                    setTimeout(() => {
                                        setSaving(false)
                                    }, 300)
                                },
                            },
                        )
                    }}
                />
            </LabeledFormRow>
            <LabeledFormRow
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '8px',
                    width: '100%',
                }}
            >
                <Typography.Text>Notes</Typography.Text>
                <Input.TextArea
                    style={{ maxWidth: '400px' }}
                    defaultValue={item.notes}
                    onBlur={e => {
                        setSaving(true)
                        updateItemMutation.mutate(
                            {
                                token: item.token,
                                patch: { notes: e.target.value },
                            },
                            {
                                onSettled: () => {
                                    setTimeout(() => {
                                        setSaving(false)
                                    }, 300)
                                },
                            },
                        )
                    }}
                />
            </LabeledFormRow>

            <LabeledFormRow>
                <Typography.Text>Pinned</Typography.Text>{' '}
                <Switch
                    checked={item.pinned}
                    onChange={checked => {
                        setSaving(false)
                        updateItemMutation.mutate(
                            { token: item.token, patch: { pinned: checked } },
                            {
                                onSettled: () => {
                                    setTimeout(() => {
                                        setSaving(false)
                                    }, 300)
                                },
                            },
                        )
                    }}
                />
            </LabeledFormRow>
            <Popconfirm
                title={`Really delete ${item.name}?`}
                description="This is not reversible"
                onConfirm={() => {
                    deleteItemMutation.mutate(item.token, {
                        onSuccess: () => {
                            navigate({ pathname: '/items', search: window.location.search })
                        },
                    })
                }}
                okText="Yes, delete  it"
                cancelText="No, leave it"
            >
                <div>
                    <Button danger>Delete Item</Button>
                </div>
            </Popconfirm>
        </FormWrap>
    )
}

export default ItemDetails

import { DeleteOutlined, PlusOutlined, QuestionOutlined, UploadOutlined } from '@ant-design/icons'
import { useQueryClient } from '@tanstack/react-query'
import {
    Alert,
    AutoComplete,
    Button,
    Card,
    Divider,
    Input,
    Modal,
    Popconfirm,
    Select,
    Switch,
    Typography,
    Upload,
    UploadFile,
} from 'antd'
import { RcFile } from 'antd/es/upload'
import axios from 'axios'
import React, { useEffect, useMemo, useState } from 'react'
import { useItems } from 'services/item_service'
import {
    FORM_FIELD_TYPES,
    NON_FORM_FIELD_PROPERTIES,
    useCreateItemType,
    useDeleteItemType,
    useItemType,
    useItemTypes,
    useUpdateItemType,
} from 'services/item_type_service'
import { capitalizeWords, readCookie } from 'services/utils'
import slugify from 'slugify'

// TODO dooo these need to be separate components?

const NewItemTypeModal = ({
    open,
    onCancel,
    openEdit,
}: {
    open: boolean
    onCancel: () => void
    openEdit: (slug: string) => void
}) => {
    const [name, setName] = useState<string>()
    const slug = useMemo(() => slugify(name ?? '', { lower: true }), [name])
    const createItemTypeMutation = useCreateItemType()
    const { data: itemTypes } = useItemTypes()
    const [parentSlug, setParentSlug] = useState<string>()
    const [icon, setIcon] = useState<UploadFile>()

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            maskClosable
            footer={null}
            closable={false}
            width="75vw"
            destroyOnClose
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '5px',
                        alignItems: 'center',
                    }}
                >
                    Slug:{' '}
                    <Input
                        style={{ maxWidth: '300px' }}
                        placeholder="New Item Type Slug"
                        disabled
                        value={slug}
                    />
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '5px',
                        alignItems: 'center',
                    }}
                >
                    Name:{' '}
                    <Input
                        style={{ maxWidth: '300px' }}
                        placeholder="New Item Type Name"
                        autoFocus
                        value={name}
                        onChange={e => {
                            setName(e.target.value)
                        }}
                    />
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '5px',
                        alignItems: 'center',
                    }}
                >
                    Parent:
                    <AutoComplete
                        options={(itemTypes ?? []).map(it => ({ value: it.slug, label: it.name }))}
                        style={{ width: '300px' }}
                        value={parentSlug}
                        onChange={val => {
                            setParentSlug(val)
                        }}
                        onSelect={val => {
                            setParentSlug(val)
                        }}
                        allowClear
                    />
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '5px',
                        alignItems: 'center',
                    }}
                >
                    Icon:
                    <Upload
                        accept=".png, .jpg, .svg, .gif"
                        maxCount={1}
                        showUploadList={{ showPreviewIcon: false }}
                        listType="picture-card"
                        beforeUpload={file => {
                            setIcon(file)
                            return false
                        }}
                        onRemove={(file: UploadFile) => {
                            setIcon(undefined)
                        }}
                    >
                        <Button icon={<UploadOutlined />} />
                    </Upload>
                </div>
                <div>
                    <Button
                        type="primary"
                        disabled={!name}
                        onClick={() => {
                            if (!name) {
                                return
                            }
                            createItemTypeMutation.mutate(
                                { name, parentSlug, icon: icon as RcFile },
                                {
                                    onSuccess: itemType => {
                                        setName(undefined)
                                        setParentSlug(undefined)
                                        openEdit(itemType.slug)
                                    },
                                },
                            )
                        }}
                    >
                        Create
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

const EditItemTypeModal = ({
    itemSlug,
    onCancel,
}: {
    itemSlug: string | undefined
    onCancel: () => void
}) => {
    const { data: itemType } = useItemType(itemSlug)
    const updateItemTypeMutation = useUpdateItemType()
    const deleteItemTypeMutation = useDeleteItemType()
    const { data: itemTypes } = useItemTypes()
    const [parentSlug, setParentSlug] = useState<string>()
    useEffect(() => {
        setParentSlug(undefined)
    }, [itemType])
    useEffect(() => {
        if (!parentSlug && itemType?.parent_slug) {
            setParentSlug(itemType.parent_slug)
        }
    }, [itemType?.parent_slug, parentSlug])

    const formFieldProperties = useMemo(
        () =>
            Object.fromEntries(
                Object.entries(itemType?.item_schema?.properties ?? {}).filter(
                    ([k, v]: [string, any]) => !NON_FORM_FIELD_PROPERTIES.includes(k),
                ),
            ),
        [itemType],
    )

    const [newField, setNewField] = useState<{
        required: boolean
        title: string
        type: (typeof FORM_FIELD_TYPES)[number]
    }>() // kind of a messy thing here - this type is a dict of any number of properties, but i only want to allow one, but i cant figure out how to index into this type

    const iconUploadURL = useMemo(() => {
        const baseURL = import.meta.env.VITE_API_URL_BASE || ''
        return baseURL + '/api/item_type/' + itemSlug + '/icon'
    }, [itemSlug])

    const { data: exampleItems } = useItems(
        1,
        20,
        undefined,
        { itemTypes: [itemSlug ?? ''] },
        undefined,
    )

    if (!itemType) {
        return null
    }
    return (
        <Modal
            open={!!itemSlug}
            onCancel={onCancel}
            maskClosable
            footer={null}
            closable={false}
            width="75vw"
            destroyOnClose
        >
            <Typography.Title level={3}>Editing {itemType.name}</Typography.Title>
            <div style={{ height: '40px', width: '100%', marginBottom: '10px' }}>
                {updateItemTypeMutation.isPending ? (
                    <Alert
                        type="success"
                        message="Saving..."
                    />
                ) : null}
            </div>
            <div
                style={{ display: 'flex', flexDirection: 'row', gap: '5px', alignItems: 'center' }}
            >
                Display Name:
                <Input
                    style={{ maxWidth: '500px' }}
                    defaultValue={itemType.name}
                    // TODO: probably validate, maybe even provide a builder
                    onBlur={e => {
                        updateItemTypeMutation.mutate({
                            slug: itemType.slug,
                            patch: { name: e.target.value },
                        })
                    }}
                />
            </div>
            <div
                style={{ display: 'flex', flexDirection: 'row', gap: '5px', alignItems: 'center' }}
            >
                Item Name Schema:
                <Input
                    style={{ maxWidth: '500px' }}
                    defaultValue={itemType.name_schema}
                    onBlur={e => {
                        updateItemTypeMutation.mutate({
                            slug: itemType.slug,
                            patch: { name_schema: e.target.value },
                        })
                    }}
                />
            </div>
            <div
                style={{ display: 'flex', flexDirection: 'row', gap: '5px', alignItems: 'center' }}
            >
                Item Name Schema Example
                <Input
                    style={{ maxWidth: '500px' }}
                    readOnly
                    value={(exampleItems?.results?.[0] ?? { name: '[No Items Found]' }).name}
                />
            </div>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '5px',
                    alignItems: 'center',
                }}
            >
                Parent:
                <Select
                    style={{ width: '300px' }}
                    popupMatchSelectWidth={false}
                    value={parentSlug}
                    options={(itemTypes ?? [])
                        .filter(it => it.slug !== itemType.slug)
                        .map(it => ({ value: it.slug, label: it.name }))}
                    onChange={val => {
                        setParentSlug(val)

                        updateItemTypeMutation.mutate({
                            slug: itemType.slug,
                            patch: { parent_slug: val || false },
                        })
                    }}
                    allowClear
                    showSearch
                />
            </div>
            <div
                style={{ display: 'flex', flexDirection: 'row', gap: '5px', alignItems: 'center' }}
            >
                Icon:
                {itemType.icon_url ? (
                    <img
                        style={{ height: '50px', width: '50px' }}
                        src={itemType.icon_url}
                    />
                ) : (
                    <QuestionOutlined />
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <Upload
                        headers={{ 'X-CSRFToken': readCookie(axios.defaults.xsrfCookieName) ?? '' }}
                        action={iconUploadURL}
                        withCredentials
                        style={{ width: '300px' }}
                        accept=".png, .jpg, .svg, .gif"
                        maxCount={1}
                        showUploadList={{ showPreviewIcon: false }}
                        listType="picture-card"
                    >
                        <Button icon={<UploadOutlined />}> Change Icon</Button>
                    </Upload>
                    <Button
                        onClick={() => {
                            axios.delete(iconUploadURL)
                        }}
                        disabled={!itemType.icon_url}
                    >
                        Remove Icon
                    </Button>
                </div>
            </div>
            <div>
                <Typography.Title level={4}>Fields</Typography.Title>
                {Object.entries(formFieldProperties)
                    .filter(([k, v]) => typeof v !== 'boolean')
                    .map(([k, v]) => (
                        <div key={k}>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    gap: '15px',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    maxWidth: '50%',
                                }}
                            >
                                <div
                                    style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}
                                >
                                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{k}</div>
                                    <Button
                                        icon={<DeleteOutlined />}
                                        onClick={() => {
                                            const newProperties = {
                                                ...itemType.item_schema.properties,
                                            }
                                            delete newProperties[k]
                                            const newRequired = [
                                                ...(itemType.item_schema?.required ?? []),
                                            ].filter(s => s !== k)
                                            // TODO: clean out auto complete config too, probably
                                            updateItemTypeMutation.mutate({
                                                slug: itemType.slug,
                                                patch: {
                                                    item_schema: {
                                                        ...itemType.item_schema,
                                                        properties: newProperties,
                                                        required: newRequired,
                                                    },
                                                },
                                            })
                                        }}
                                    />
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '5px',
                                        flex: 1,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'row', // TODO: probably change to column on mobile
                                            gap: '5px',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <div>Display Name:</div>
                                        <Input
                                            style={{ maxWidth: '500px', flex: 1 }}
                                            defaultValue={typeof v === 'boolean' ? '' : v.title}
                                            onBlur={e => {
                                                const newProperties = {
                                                    ...itemType.item_schema.properties,
                                                }
                                                newProperties[k] = {
                                                    ...(typeof v === 'boolean' ? {} : v),
                                                    title: e.target.value,
                                                }
                                                updateItemTypeMutation.mutate({
                                                    slug: itemType.slug,
                                                    patch: {
                                                        item_schema: {
                                                            ...itemType.item_schema,
                                                            properties: newProperties,
                                                        },
                                                    },
                                                })
                                            }}
                                        />
                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            gap: '5px',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <div>Field Type:</div>
                                        <Select
                                            style={{ maxWidth: '500px', flex: 1 }}
                                            options={FORM_FIELD_TYPES.map(fft => ({
                                                key: fft,
                                                value: fft,
                                                label: capitalizeWords(fft),
                                            }))}
                                            defaultValue={
                                                typeof v === 'boolean' ? undefined : v.type
                                            }
                                            onChange={selected => {
                                                const newProperties = {
                                                    ...itemType.item_schema.properties,
                                                }
                                                newProperties[k] = {
                                                    ...(typeof v === 'boolean' ? {} : v),
                                                    type: selected,
                                                }
                                                updateItemTypeMutation.mutate({
                                                    slug: itemType.slug,
                                                    patch: {
                                                        item_schema: {
                                                            ...itemType.item_schema,
                                                            properties: newProperties,
                                                        },
                                                    },
                                                })
                                            }}
                                            popupMatchSelectWidth={false}
                                        />
                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            gap: '5px',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <div>Required:</div>
                                        <Switch
                                            checked={itemType.item_schema?.required?.includes(k)}
                                            onChange={checked => {
                                                let newRequired = [
                                                    ...(itemType.item_schema?.required ?? []),
                                                ]
                                                if (itemType.item_schema?.required?.includes(k)) {
                                                    newRequired = newRequired.filter(
                                                        val => val !== k,
                                                    )
                                                } else {
                                                    newRequired = [...newRequired, k]
                                                }

                                                updateItemTypeMutation.mutate({
                                                    slug: itemType.slug,
                                                    patch: {
                                                        item_schema: {
                                                            ...itemType.item_schema,
                                                            required: newRequired,
                                                        },
                                                    },
                                                })
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <Divider />
                        </div>
                    ))}
            </div>
            {newField !== undefined ? (
                <div>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: '5px',
                            alignItems: 'center',
                        }}
                    >
                        Field Name:
                        <Input
                            disabled
                            style={{ flex: 1, maxWidth: '300px' }}
                            placeholder="Slug Name"
                            value={slugify(newField.title, { lower: true })}
                        />
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: '5px',
                            alignItems: 'center',
                        }}
                    >
                        Display Name:
                        <Input
                            autoFocus
                            style={{ flex: 1, maxWidth: '300px' }}
                            placeholder="Display Name"
                            value={newField.title}
                            onChange={e => {
                                setNewField({ ...newField, title: e.target.value })
                            }}
                        />
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: '5px',
                            alignItems: 'center',
                        }}
                    >
                        Field Type:
                        <Select
                            style={{ maxWidth: '300px', flex: 1 }}
                            options={FORM_FIELD_TYPES.map(fft => ({
                                key: fft,
                                value: fft,
                                label: capitalizeWords(fft),
                            }))}
                            popupMatchSelectWidth={false}
                            value={newField.type}
                            onChange={val => {
                                setNewField({ ...newField, type: val })
                            }}
                        />
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: '5px',
                            alignItems: 'center',
                        }}
                    >
                        Required:
                        <Switch
                            checked={newField.required}
                            onChange={checked => {
                                setNewField({ ...newField, required: checked })
                            }}
                        />
                    </div>
                    <Button
                        type="primary"
                        disabled={
                            !newField.title ||
                            Object.keys(itemType.item_schema.properties ?? {}).includes(
                                slugify(newField.title, { lower: true }),
                            ) ||
                            !slugify(newField.title, { lower: true })
                        }
                        onClick={() => {
                            const slug = slugify(newField.title, { lower: true })
                            const newProperties = { ...(itemType.item_schema.properties ?? {}) }
                            newProperties[slug] = {
                                type: newField.type,
                                title: newField.title,
                            }
                            let newRequired = [...(itemType.item_schema.required ?? [])]
                            if (newField.required) {
                                newRequired = [...newRequired, slug]
                            }
                            updateItemTypeMutation.mutate(
                                {
                                    slug: itemType.slug,
                                    patch: {
                                        item_schema: {
                                            ...itemType.item_schema,
                                            properties: newProperties,
                                            required: newRequired,
                                        },
                                    },
                                },
                                {
                                    onSuccess: () => {
                                        setNewField(undefined)
                                    },
                                },
                            )
                        }}
                    >
                        Add
                    </Button>
                </div>
            ) : null}
            <div style={{ display: 'flex', flexDirection: 'row', gap: '5px' }}>
                {newField === undefined ? (
                    <Button
                        type="primary"
                        onClick={() => {
                            setNewField({
                                required: true,
                                title: '',
                                type: 'string',
                            })
                        }}
                    >
                        <PlusOutlined /> Add New Field
                    </Button>
                ) : null}
                <Popconfirm
                    title="Really delete this item type?"
                    description="This is not reversible"
                    onConfirm={() => {
                        deleteItemTypeMutation.mutate(itemType.slug, { onSuccess: onCancel })
                    }}
                    okText="Yes, delete  it"
                    cancelText="No, leave it"
                >
                    <Button danger>Delete Item Type</Button>
                </Popconfirm>
            </div>
        </Modal>
    )
}

export interface ProfileItemTypesProps {}

const ProfileItemTypes = ({}: ProfileItemTypesProps) => {
    const { data: itemTypes } = useItemTypes()
    const [editingSlug, setEditingSlug] = useState<string>()
    const [addItemTypeOpen, setAddItemTypeOpen] = useState(false)

    return (
        <div>
            <EditItemTypeModal
                itemSlug={editingSlug}
                onCancel={() => setEditingSlug(undefined)}
            />
            <NewItemTypeModal
                open={addItemTypeOpen}
                onCancel={() => {
                    setAddItemTypeOpen(false)
                }}
                openEdit={(slug: string) => {
                    setAddItemTypeOpen(false)
                    setEditingSlug(slug)
                }}
            />
            Item Types
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '5px',
                    marginTop: '5px',
                    flexWrap: 'wrap',
                }}
            >
                {(itemTypes ?? [])
                    .sort((it1, it2) => it1.slug.localeCompare(it2.slug))
                    .map(it => (
                        <Card
                            key={it.slug}
                            onClick={() => {
                                setEditingSlug(it.slug)
                            }}
                            hoverable
                            cover={
                                <div
                                    style={{
                                        fontSize: '32px',
                                        width: '100%',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginTop: '10px',
                                            marginBottom: '10px',
                                        }}
                                    >
                                        {it.icon_url ? (
                                            <img
                                                style={{ height: '50px', width: '50px' }}
                                                src={it.icon_url}
                                            />
                                        ) : (
                                            <QuestionOutlined />
                                        )}
                                    </div>
                                </div>
                            }
                        >
                            <Card.Meta
                                title={it.name}
                                description={`Edit ${it.name} Type`}
                            />
                        </Card>
                    ))}
                <Card
                    key={'new'}
                    onClick={() => {
                        setAddItemTypeOpen(true)
                    }}
                    hoverable
                    cover={
                        <div
                            style={{
                                fontSize: '32px',
                                width: '100%',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginTop: '10px',
                                    marginBottom: '10px',
                                }}
                            >
                                <PlusOutlined />
                            </div>
                        </div>
                    }
                >
                    <Card.Meta
                        title="New"
                        description={`Add New Type`}
                    />
                </Card>
            </div>
        </div>
    )
}

export default ProfileItemTypes

import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useItemType, useItemTypeAutoCompleteSuggestions } from 'services/item_type_service'
import {
    AutoComplete,
    InputNumber,
    Spin,
    Button,
    Divider,
    Checkbox,
    Input,
    Popover,
    Select,
    Typography,
} from 'antd'
import DatePicker from 'components/DatePicker'
import { ActivityDetail, CreateActivityType, useCreateActivity } from 'services/activities_service'
import { useUserSettings } from 'services/user_service'
import { DateTime } from 'luxon'
import { PlusOutlined } from '@ant-design/icons'
import AddItem from 'pages/AddItem/AddItem.lazy'
import { useItem } from 'services/item_service'
export interface AddActivityProps {}

const AddActivity = ({}: AddActivityProps) => {
    const navigate = useNavigate()
    const { type: itemTypeSlug, token } = useParams()

    const { data: itemType } = useItemType(itemTypeSlug)
    const { data: parentItemType } = useItemType(itemType?.parent_slug ?? '')
    const { data: item } = useItem(token)

    const { data: userSettings } = useUserSettings()

    const { data: autocompleteChoices } = useItemTypeAutoCompleteSuggestions(itemTypeSlug)

    const createActivityMutation = useCreateActivity()

    const [newActivity, setNewActivity] = useState<CreateActivityType>({
        itemDetails: {
            info: {},
            item_type: itemTypeSlug ?? '',
        },
        activityDetails: {
            start_time: '',
            end_time: '',
            finished: false,
            pending: false,
            rating: 0,
            notes: '',
            info: {},
        },
    })
    useEffect(() => {
        if (
            userSettings?.activityDefaults?.defaultEndToNow &&
            !newActivity.activityDetails.end_time
        ) {
            setNewActivity(a => ({
                ...a,
                activityDetails: {
                    ...a.activityDetails,
                    end_time: DateTime.fromJSDate(new Date()).toISO() || undefined,
                },
            }))
        }
        if (
            userSettings?.activityDefaults?.defaultStartToNow &&
            !newActivity.activityDetails.start_time
        ) {
            setNewActivity(a => ({
                ...a,
                activityDetails: {
                    ...a.activityDetails,
                    start_time: DateTime.fromJSDate(new Date()).toISO() || undefined,
                },
            }))
        }

        if (userSettings?.activityDefaults?.defaultPending) {
            setNewActivity(a => ({
                ...a,
                activityDetails: { ...a.activityDetails, pending: true },
            }))
        }
        if (userSettings?.activityDefaults?.defaultFinished) {
            setNewActivity(a => ({
                ...a,
                activityDetails: { ...a.activityDetails, finished: true },
            }))
        }
    }, [userSettings, newActivity])

    useEffect(() => {
        if (item && Object.keys(item?.info ?? {}) && !Object.keys(newActivity.itemDetails.info)) {
            setNewActivity(a => ({ ...a, itemDetails: { ...a.itemDetails, info: item.info } }))
        }
        if (item && item.parent_token) {
            setNewActivity(a => ({
                ...a,
                itemDetails: { ...a.itemDetails, parent_token: item.parent_token },
            }))
        }
    }, [item, newActivity])

    const [popoverOpen, setPopoverOpen] = useState(false)

    const submitAllowed = useCallback(
        () =>
            itemType?.item_schema?.required?.every(
                requiredFieldName => !!newActivity?.itemDetails?.info?.[requiredFieldName],
            ),
        [itemType, newActivity],
    )

    const submit = useCallback(
        (onSuccess: (activity: ActivityDetail) => void) => {
            createActivityMutation.mutate(
                {
                    ...newActivity,
                    activityDetails: {
                        ...newActivity.activityDetails,
                        start_time: newActivity.activityDetails.start_time || undefined,
                        end_time: newActivity.activityDetails.end_time || undefined,
                    },
                },
                {
                    onSuccess: onSuccess,
                },
            )
        },

        [createActivityMutation, newActivity],
    )

    if (!itemType) {
        return <Spin />
    }

    if (token && !item) {
        return <Spin />
    }

    return (
        <div>
            <Typography.Title level={3}>Add {itemType.name}</Typography.Title>
            <Typography.Title level={4}>Item Information</Typography.Title>

            <div
                style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '24px' }}
            >
                {Object.entries(itemType.item_schema.properties ?? {}).map(
                    ([fieldName, fieldData]) =>
                        typeof fieldData === 'boolean' ? null : (
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    gap: '8px',
                                    width: '100%',
                                    maxWidth: '500px',
                                }}
                                key={fieldName}
                            >
                                <Typography.Text style={{ width: '150px' }}>
                                    {fieldData?.title ?? fieldName}
                                </Typography.Text>
                                {fieldData.type === 'string' ? (
                                    <AutoComplete
                                        value={newActivity.itemDetails.info?.[fieldName] || ''}
                                        onSelect={val => {
                                            setNewActivity(a => ({
                                                ...a,
                                                itemDetails: {
                                                    ...a.itemDetails,
                                                    info: {
                                                        ...a.itemDetails.info,
                                                        [fieldName]: val,
                                                    },
                                                },
                                            }))
                                        }}
                                        onChange={val => {
                                            setNewActivity(a => ({
                                                ...a,
                                                itemDetails: {
                                                    ...a.itemDetails,
                                                    info: {
                                                        ...a.itemDetails.info,
                                                        [fieldName]: val,
                                                    },
                                                },
                                            }))
                                        }}
                                        allowClear
                                        filterOption
                                        style={{ maxWidth: '300px', flex: 1 }}
                                        options={autocompleteChoices?.[fieldName]}
                                        status={
                                            itemType.item_schema?.required?.includes(fieldName) &&
                                            !newActivity.itemDetails.info?.[fieldName]
                                                ? 'error'
                                                : undefined
                                        }
                                    />
                                ) : fieldData.type === 'number' ? (
                                    <InputNumber
                                        value={newActivity.itemDetails.info?.[fieldName] || ''}
                                        onChange={val => {
                                            setNewActivity(a => ({
                                                ...a,
                                                itemDetails: {
                                                    ...a.itemDetails,
                                                    info: {
                                                        ...a.itemDetails.info,
                                                        [fieldName]: Number(val),
                                                    },
                                                },
                                            }))
                                        }}
                                    />
                                ) : (
                                    <div>UnsupportedType</div>
                                )}
                            </div>
                        ),
                )}
                {parentItemType ? (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: '8px',
                            width: '100%',
                            maxWidth: '500px',
                        }}
                    >
                        <Typography.Text style={{ width: '150px' }}>Item Parent</Typography.Text>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: '5px',
                                alignItems: 'center',
                                flex: 1,
                            }}
                        >
                            <Select
                                value={newActivity?.itemDetails?.parent_token}
                                placeholder="Choose Parent"
                                allowClear
                                style={{ width: '300px' }}
                                filterOption
                                options={autocompleteChoices?.[parentItemType.slug]}
                                showSearch
                                onChange={val => {
                                    setNewActivity(a => ({
                                        ...a,
                                        itemDetails: { ...a.itemDetails, parent_token: val },
                                    }))
                                }}
                            />
                            <Popover
                                open={popoverOpen}
                                onOpenChange={o => {
                                    setPopoverOpen(o)
                                }}
                                trigger={['click']}
                                content={
                                    <div style={{ width: '50vw' }}>
                                        <AddItem
                                            itemTypeSlug={parentItemType.slug}
                                            onFinishCreated={newItem => {
                                                setNewActivity(a => ({
                                                    ...a,
                                                    itemDetails: {
                                                        ...a.itemDetails,
                                                        parent_token: newItem.token,
                                                    },
                                                }))
                                                setPopoverOpen(false)
                                            }}
                                        />
                                    </div>
                                }
                            >
                                <Button icon={<PlusOutlined />} />
                            </Popover>
                        </div>
                    </div>
                ) : null}
                <Divider />
                <Typography.Title level={4}>Activity Information</Typography.Title>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                    }}
                >
                    <div>
                        <Checkbox
                            checked={newActivity.activityDetails.pending}
                            onChange={e => {
                                setNewActivity(a => ({
                                    ...a,
                                    activityDetails: {
                                        ...a.activityDetails,
                                        pending: e.target.checked,
                                    },
                                }))
                            }}
                        />{' '}
                        <Typography.Text>Pending</Typography.Text>
                    </div>
                    <div>
                        <Checkbox
                            checked={newActivity.activityDetails.finished}
                            onChange={e => {
                                setNewActivity(a => ({
                                    ...a,
                                    activityDetails: {
                                        ...a.activityDetails,
                                        finished: e.target.checked,
                                    },
                                }))
                            }}
                        />{' '}
                        <Typography.Text>Finishes Item</Typography.Text>
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '16px',
                        alignItems: 'flex-start',
                    }}
                >
                    <Typography.Text>Date Range</Typography.Text>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <DatePicker.RangePicker
                            showTime
                            allowEmpty={[true, true]}
                            value={[
                                newActivity.activityDetails.start_time
                                    ? DateTime.fromISO(newActivity.activityDetails.start_time)
                                    : null,
                                newActivity.activityDetails.end_time
                                    ? DateTime.fromISO(newActivity.activityDetails.end_time)
                                    : null,
                            ]}
                            onChange={dates => {
                                setNewActivity(a => ({
                                    ...a,
                                    activityDetails: {
                                        ...a.activityDetails,
                                        start_time: dates?.[0]?.toISO() || '',
                                        end_time: dates?.[1]?.toISO() || '',
                                    },
                                }))
                            }}
                        />
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                            }}
                        >
                            <Button
                                type="text"
                                onClick={() => {
                                    setNewActivity(a => ({
                                        ...a,
                                        activityDetails: {
                                            ...a.activityDetails,
                                            start_time: DateTime.now().toISO(),
                                        },
                                    }))
                                }}
                            >
                                Set Start To Now
                            </Button>
                            <Button
                                type="text"
                                onClick={() => {
                                    setNewActivity(a => ({
                                        ...a,
                                        activityDetails: {
                                            ...a.activityDetails,
                                            end_time: DateTime.now().toISO(),
                                        },
                                    }))
                                }}
                            >
                                Set End To Now
                            </Button>
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '8px',
                        width: '100%',
                        maxWidth: '500px',
                        marginTop: '16px',
                    }}
                >
                    <Typography.Text style={{ width: '150px' }}>Rating</Typography.Text>
                    <InputNumber
                        max={userSettings?.ratingMax ?? 5}
                        value={newActivity.activityDetails.rating || ''}
                        onChange={val => {
                            setNewActivity(a => ({
                                ...a,
                                activityDetails: { ...a.activityDetails, rating: val || undefined },
                            }))
                        }}
                    />
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '8px',
                        width: '100%',
                    }}
                >
                    <Typography.Text style={{ width: '150px' }}>Notes</Typography.Text>
                    <Input.TextArea
                        style={{ maxWidth: '400px' }}
                        value={newActivity.activityDetails.notes || ''}
                        onChange={e => {
                            setNewActivity(a => ({
                                ...a,
                                activityDetails: { ...a.activityDetails, notes: e.target.value },
                            }))
                        }}
                    />
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '8px',
                        marginTop: '16px',
                        marginBottom: '16px',
                    }}
                >
                    <Button
                        disabled={!submitAllowed}
                        loading={createActivityMutation.isPending}
                        type="primary"
                        onClick={() => {
                            submit(activity => {
                                navigate({
                                    pathname: `/activities/${itemType.slug}/${activity.token}`,
                                })
                            })
                        }}
                    >
                        Add
                    </Button>
                    <Button
                        disabled={!submitAllowed}
                        loading={createActivityMutation.isPending}
                        onClick={() => {
                            submit(activity => {
                                window.location.reload()
                            })
                        }}
                    >
                        Save and Add Another
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default AddActivity

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
import { CheckboxWrapper, FormWrap, LabeledFormRow } from 'components/FormWrappers'
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

    const [defaultsSet, setDefaultsSet] = useState(new Set<string>())

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
            !newActivity.activityDetails.end_time &&
            !defaultsSet.has('endTime')
        ) {
            setNewActivity(a => ({
                ...a,
                activityDetails: {
                    ...a.activityDetails,
                    end_time: DateTime.fromJSDate(new Date()).toISO() || undefined,
                },
            }))
            setDefaultsSet(s => {
                s.add('endTime')
                return s
            })
        }
        if (
            userSettings?.activityDefaults?.defaultStartToNow &&
            !newActivity.activityDetails.start_time &&
            !defaultsSet.has('startTime')
        ) {
            setNewActivity(a => ({
                ...a,
                activityDetails: {
                    ...a.activityDetails,
                    start_time: DateTime.fromJSDate(new Date()).toISO() || undefined,
                },
            }))
            setDefaultsSet(s => {
                s.add('startTime')
                return s
            })
        }

        if (userSettings?.activityDefaults?.defaultPending && !defaultsSet.has('pending')) {
            setNewActivity(a => ({
                ...a,
                activityDetails: { ...a.activityDetails, pending: true },
            }))
            setDefaultsSet(s => {
                s.add('pending')
                return s
            })
        }
        if (userSettings?.activityDefaults?.defaultFinished && !defaultsSet.has('finished')) {
            setNewActivity(a => ({
                ...a,
                activityDetails: { ...a.activityDetails, finished: true },
            }))
            setDefaultsSet(s => {
                s.add('finished')
                return s
            })
        }
    }, [userSettings, newActivity, defaultsSet])

    useEffect(() => {
        if (
            item &&
            Object.keys(item?.info ?? {}).length &&
            !Object.keys(newActivity.itemDetails.info).length
        ) {
            setNewActivity(a => ({ ...a, itemDetails: { ...a.itemDetails, info: item.info } }))
        }
    }, [item, newActivity])
    useEffect(() => {
        if (item && item.parent_token) {
            setNewActivity(a => ({
                ...a,
                itemDetails: { ...a.itemDetails, parent_token: item.parent_token },
            }))
        }
    }, [item])

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

            <FormWrap>
                {Object.entries(itemType.item_schema.properties ?? {}).map(
                    ([fieldName, fieldData]) =>
                        typeof fieldData === 'boolean' ? null : (
                            <LabeledFormRow key={fieldName}>
                                <Typography.Text>{fieldData?.title ?? fieldName}</Typography.Text>
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
                                        precision={0}
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
                            </LabeledFormRow>
                        ),
                )}
                {parentItemType ? (
                    <LabeledFormRow>
                        <Typography.Text>Item Parent</Typography.Text>
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
                    </LabeledFormRow>
                ) : null}
                <Divider />
                <Typography.Title level={4}>Activity Information</Typography.Title>
                <CheckboxWrapper>
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
                </CheckboxWrapper>

                <LabeledFormRow>
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
                </LabeledFormRow>

                <LabeledFormRow>
                    <Typography.Text>Rating</Typography.Text>
                    <InputNumber
                        precision={2}
                        max={userSettings?.ratingMax ?? 5}
                        value={newActivity.activityDetails.rating || ''}
                        onChange={val => {
                            setNewActivity(a => ({
                                ...a,
                                activityDetails: { ...a.activityDetails, rating: val || undefined },
                            }))
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
                        value={newActivity.activityDetails.notes || ''}
                        onChange={e => {
                            setNewActivity(a => ({
                                ...a,
                                activityDetails: { ...a.activityDetails, notes: e.target.value },
                            }))
                        }}
                    />
                </LabeledFormRow>
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
            </FormWrap>
        </div>
    )
}

export default AddActivity

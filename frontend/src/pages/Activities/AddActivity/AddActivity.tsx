import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    ItemType,
    ItemTypeDetail,
    useItemType,
    useItemTypeAutoCompleteSuggestions,
} from 'services/item_type_service'
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
    Radio,
} from 'antd'
import DatePicker from 'components/DatePicker'
import {
    ActivityDetail,
    CreateActivityType,
    _CreateActivityCreateItemDetails,
    _CreateActivityExistingItemDetails,
    useCreateActivity,
} from 'services/activities_service'
import { useUserSettings } from 'services/user_service'
import { DateTime } from 'luxon'
import { PlusOutlined } from '@ant-design/icons'
import AddItem from 'pages/AddItem/AddItem.lazy'
import { useItem, useItems } from 'services/item_service'
import { CheckboxWrapper, FormWrap, LabeledFormRow } from 'components/FormWrappers'
import useDebounce from 'hooks/useDebounce'
import { usePagedResultData } from 'services/utils'
export interface AddActivityProps {}

const itemDetailsIsExisting = (
    itemDetails: CreateActivityType['itemDetails'],
): itemDetails is _CreateActivityExistingItemDetails => {
    return !!(itemDetails as _CreateActivityExistingItemDetails).token
}
const itemDetailsIsNew = (
    itemDetails: CreateActivityType['itemDetails'],
): itemDetails is _CreateActivityCreateItemDetails => {
    return !!(itemDetails as _CreateActivityCreateItemDetails).info
}

const CreateNewItem = ({
    itemType,
    itemDetails,
    setItemDetails,
}: {
    itemType: ItemTypeDetail
    itemDetails: _CreateActivityCreateItemDetails
    setItemDetails: (newItemDetails: _CreateActivityCreateItemDetails) => void
}) => {
    const { data: autocompleteChoices } = useItemTypeAutoCompleteSuggestions(itemType.slug)

    return (
        <>
            {Object.entries(itemType.item_schema.properties ?? {}).map(([fieldName, fieldData]) =>
                typeof fieldData === 'boolean' ? null : (
                    <LabeledFormRow key={fieldName}>
                        <Typography.Text>{fieldData?.title ?? fieldName}</Typography.Text>
                        {fieldData.type === 'string' ? (
                            <AutoComplete
                                value={itemDetails.info?.[fieldName] || ''}
                                onSelect={val => {
                                    setItemDetails({
                                        ...itemDetails,
                                        info: {
                                            ...itemDetails.info,
                                            [fieldName]: val,
                                        },
                                    })
                                }}
                                onChange={val => {
                                    setItemDetails({
                                        ...itemDetails,
                                        info: {
                                            ...itemDetails.info,
                                            [fieldName]: val,
                                        },
                                    })
                                }}
                                allowClear
                                filterOption
                                style={{ maxWidth: '300px', flex: 1 }}
                                options={autocompleteChoices?.[fieldName]}
                                status={
                                    itemType.item_schema?.required?.includes(fieldName) &&
                                    !itemDetails.info?.[fieldName]
                                        ? 'error'
                                        : undefined
                                }
                            />
                        ) : fieldData.type === 'number' ? (
                            <InputNumber
                                precision={-1 * Math.log10(fieldData?.multipleOf ?? 1)}
                                value={itemDetails.info?.[fieldName] || ''}
                                onChange={val => {
                                    setItemDetails({
                                        ...itemDetails,
                                        info: {
                                            ...itemDetails.info,
                                            [fieldName]: Number(val),
                                        },
                                    })
                                }}
                            />
                        ) : (
                            <div>UnsupportedType</div>
                        )}
                    </LabeledFormRow>
                ),
            )}
        </>
    )
}

const ItemSelection = ({
    itemTypeSlug,
    itemToken,
    itemDetails,
    setItemDetails,
}: {
    itemTypeSlug: string
    itemToken?: string
    itemDetails: CreateActivityType['itemDetails']
    setItemDetails: (item: CreateActivityType['itemDetails']) => void
}) => {
    const [itemSearch, setItemSearch] = useState<string>()
    const debouncedItemSearch = useDebounce(itemSearch)
    const { data: itemsPaginatedResult } = useItems(1, 20, debouncedItemSearch, {
        itemTypes: [itemTypeSlug ?? ''],
    })
    const items = usePagedResultData(itemsPaginatedResult).data
    const { data: item } = useItem(itemToken)
    const { data: autocompleteChoices } = useItemTypeAutoCompleteSuggestions(itemTypeSlug)
    const [popoverOpen, setPopoverOpen] = useState(false)
    const { data: itemType } = useItemType(itemTypeSlug)
    const { data: parentItemType } = useItemType(itemType?.parent_slug ?? '')

    const [createItem, setCreateItem] = useState<'existing' | 'newItem'>('newItem')
    useEffect(() => {
        if (itemToken) {
            setCreateItem('existing')
        }
    }, [itemToken])
    useEffect(() => {
        if (itemToken && item && createItem === 'existing') {
            setItemDetails({
                token: item.token,
                parent_token: item.parent_token,
                item_type: item.item_type,
            })
        }
    }, [item, itemDetails, setItemDetails, createItem, itemToken])

    if (itemToken && !item) {
        return <Spin />
    }
    if (!itemType) {
        return <Spin />
    }

    return (
        <>
            <Typography.Title level={4}>Item Information</Typography.Title>
            {itemToken ? null : (
                <Radio.Group
                    value={createItem}
                    onChange={e => {
                        setCreateItem(e.target.value)
                        if (e.target.value === 'existing') {
                            setItemDetails({ token: '', item_type: itemTypeSlug, parent_token: '' })
                        } else {
                            setItemDetails({ info: {}, item_type: itemTypeSlug, parent_token: '' })
                        }
                    }}
                >
                    <Radio value="existing">Find Existing Item</Radio>
                    <Radio value="newItem">Create New Item</Radio>
                </Radio.Group>
            )}
            {createItem === 'existing' ? (
                <Select
                    disabled={!!itemToken}
                    showSearch
                    options={(items ?? []).map(i => ({ label: i.name, value: i.token }))}
                    value={itemDetailsIsExisting(itemDetails) ? itemDetails.token : undefined}
                    onChange={val => {
                        setItemDetails({
                            ...itemDetails,
                            // @ts-ignore
                            token: val,
                        })
                    }}
                    style={{ maxWidth: '300px' }}
                    popupMatchSelectWidth={false}
                    onSearch={searchVal => {
                        setItemSearch(searchVal)
                    }}
                    filterOption={false}
                />
            ) : null}

            {createItem === 'newItem' ? (
                <CreateNewItem
                    itemType={itemType}
                    itemDetails={itemDetails as _CreateActivityCreateItemDetails}
                    setItemDetails={setItemDetails}
                />
            ) : null}
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
                            disabled={!!itemToken}
                            value={itemDetails?.parent_token}
                            placeholder="Choose Parent"
                            allowClear
                            style={{ width: '300px' }}
                            filterOption
                            options={autocompleteChoices?.[parentItemType.slug]}
                            showSearch
                            onChange={val => {
                                setItemDetails({ ...itemDetails, parent_token: val })
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
                                            setItemDetails({
                                                ...itemDetails,
                                                parent_token: newItem.token,
                                            })
                                            setPopoverOpen(false)
                                        }}
                                    />
                                </div>
                            }
                        >
                            <Button
                                disabled={!!itemToken}
                                icon={<PlusOutlined />}
                            />
                        </Popover>
                    </div>
                </LabeledFormRow>
            ) : null}
        </>
    )
}

const AddActivity = ({}: AddActivityProps) => {
    const { type: itemTypeSlug, token } = useParams()
    const { data: itemType } = useItemType(itemTypeSlug)

    const { data: userSettings } = useUserSettings()

    const navigate = useNavigate()

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

    const submitAllowed = useMemo(() => {
        if (itemDetailsIsExisting(newActivity?.itemDetails) && newActivity?.itemDetails) {
            return !!newActivity?.itemDetails?.token
        } else {
            return itemType?.item_schema?.required?.every(
                requiredFieldName =>
                    !!(newActivity?.itemDetails as _CreateActivityCreateItemDetails)?.info?.[
                        requiredFieldName
                    ],
            )
        }
    }, [itemType, newActivity.itemDetails])

    const submit = useCallback(
        (onSuccess: (activity: ActivityDetail) => void) => {
            createActivityMutation.mutate(
                {
                    ...newActivity,
                    activityDetails: {
                        ...newActivity.activityDetails,
                        start_time: newActivity.activityDetails.start_time || undefined,
                        end_time: newActivity.activityDetails.end_time || undefined,
                        rating:
                            newActivity.activityDetails.rating === null
                                ? null
                                : newActivity.activityDetails.rating /
                                  (userSettings?.ratingMax ?? 5),
                    },
                },
                {
                    onSuccess: onSuccess,
                },
            )
        },

        [createActivityMutation, newActivity, userSettings?.ratingMax],
    )

    if (!itemType) {
        return <Spin />
    }

    return (
        <div>
            <Typography.Title level={3}>Add {itemType.name}</Typography.Title>

            <FormWrap>
                <ItemSelection
                    itemTypeSlug={itemType.slug}
                    itemToken={token}
                    itemDetails={newActivity.itemDetails}
                    setItemDetails={newDetails => {
                        setNewActivity(a => ({ ...a, itemDetails: newDetails }))
                    }}
                />
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
                            showTime={{
                                format: userSettings?.use24HrTime ? 'HH:mm' : 'hh:mm a',
                                use12Hours: !(userSettings?.use24HrTime ?? true),
                            }}
                            format={
                                userSettings?.use24HrTime
                                    ? 'MM/dd/yyyy HH:mm'
                                    : 'MM/dd/yyyy hh:mm a'
                            }
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
                        value={
                            newActivity.activityDetails.rating === null
                                ? undefined
                                : newActivity.activityDetails.rating
                        }
                        onChange={val => {
                            setNewActivity(a => ({
                                ...a,
                                activityDetails: {
                                    ...a.activityDetails,
                                    rating: val === null ? val : Number(val),
                                },
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

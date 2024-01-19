import {
    Alert,
    AutoComplete,
    Button,
    Checkbox,
    Divider,
    Input,
    InputNumber,
    Popconfirm,
    Select,
    Spin,
    Typography,
} from 'antd'
import DatePicker from 'components/DatePicker'
import { CheckboxWrapper, FormWrap, LabeledFormRow } from 'components/FormWrappers'
import { DateTime } from 'luxon'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useActivity, useDeleteActivity, useUpdateActivity } from 'services/activities_service'
import { useItem } from 'services/item_service'
import { useItemType, useItemTypeAutoCompleteSuggestions } from 'services/item_type_service'
import { useUserSettings } from 'services/user_service'

export interface ActivityDetailProps {}

const ActivityDetail = ({}: ActivityDetailProps) => {
    const { token } = useParams()
    const { data: activity } = useActivity(token)
    const { data: item } = useItem(activity?.item)
    const { data: itemType } = useItemType(activity?.item_type)
    const { data: parentItemType } = useItemType(itemType?.parent_slug)
    const { data: userSettings } = useUserSettings()
    const updateActivityMutation = useUpdateActivity()

    const { data: autocompleteChoices } = useItemTypeAutoCompleteSuggestions(itemType?.slug ?? '')

    const [saving, setSaving] = useState(false)
    const navigate = useNavigate()
    const deleteActivityMutation = useDeleteActivity()
    if (!itemType || !activity || !item) {
        return <Spin />
    }
    return (
        <div>
            <Typography.Title level={3}>
                Activity for{' '}
                <Link to={{ pathname: '/items/' + (item?.token ?? '') }}>
                    {item?.name || '[No Name Schema]'}
                </Link>
            </Typography.Title>
            {saving ? (
                <Alert
                    type="success"
                    message="Saving"
                />
            ) : null}
            <Typography.Title level={4}>Item Information</Typography.Title>

            <FormWrap>
                {Object.entries(itemType.item_schema.properties ?? {}).map(
                    ([fieldName, fieldData]) =>
                        typeof fieldData === 'boolean' ? null : (
                            <LabeledFormRow key={fieldName}>
                                <Typography.Text>{fieldData?.title ?? fieldName}</Typography.Text>
                                {fieldData.type === 'string' ? (
                                    <AutoComplete
                                        disabled
                                        style={{ maxWidth: '300px', flex: 1 }}
                                        value={item?.info?.[fieldName]}
                                    />
                                ) : fieldData.type === 'number' ? (
                                    <InputNumber
                                        disabled
                                        value={item?.info?.[fieldName]}
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
                        <Select
                            disabled
                            style={{ width: '300px' }}
                            value={item?.parent_token}
                            options={autocompleteChoices?.[parentItemType.slug]}
                        />
                    </LabeledFormRow>
                ) : null}
                <Divider />
                <Typography.Title level={4}>Activity Information</Typography.Title>

                <CheckboxWrapper>
                    <div>
                        <Checkbox
                            checked={activity.pending}
                            onChange={e => {
                                setSaving(true)
                                updateActivityMutation.mutate(
                                    {
                                        token: activity.token,
                                        patch: { pending: e.target.checked },
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
                        />{' '}
                        <Typography.Text>Pending</Typography.Text>
                    </div>
                    <div>
                        <Checkbox
                            checked={activity.finished}
                            onChange={e => {
                                setSaving(true)
                                updateActivityMutation.mutate(
                                    {
                                        token: activity.token,
                                        patch: { finished: e.target.checked },
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
                        />{' '}
                        <Typography.Text>Finishes Item</Typography.Text>
                    </div>
                </CheckboxWrapper>
                <LabeledFormRow>
                    <Typography.Text>Date Range</Typography.Text>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <div>
                            <DatePicker.RangePicker
                                showTime
                                allowEmpty={[true, true]}
                                defaultValue={[
                                    activity.start_time
                                        ? DateTime.fromISO(activity.start_time)
                                        : null,
                                    activity.end_time ? DateTime.fromISO(activity.end_time) : null,
                                ]}
                                onChange={dates => {
                                    setSaving(true)
                                    updateActivityMutation.mutate(
                                        {
                                            token: activity.token,
                                            patch: {
                                                start_time: dates?.[0]?.toISO() || undefined,
                                                end_time: dates?.[1]?.toISO() || undefined,
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
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '15px' }}>
                            <Button
                                type="text"
                                onClick={() => {
                                    setSaving(true)
                                    updateActivityMutation.mutate(
                                        {
                                            token: activity.token,
                                            patch: {
                                                start_time: DateTime.now().toISO(),
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
                            >
                                Set Start To Now
                            </Button>
                            <Button
                                type="text"
                                onClick={() => {
                                    setSaving(true)
                                    updateActivityMutation.mutate(
                                        {
                                            token: activity.token,
                                            patch: {
                                                end_time: DateTime.now().toISO(),
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
                        defaultValue={(activity.rating || 0) * (userSettings?.ratingMax ?? 5)}
                        onChange={val => {
                            setSaving(true)
                            updateActivityMutation.mutate(
                                {
                                    token: activity.token,
                                    patch: { rating: Number(val) / (userSettings?.ratingMax ?? 5) },
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
                        defaultValue={activity.notes}
                        onBlur={e => {
                            setSaving(true)
                            updateActivityMutation.mutate(
                                {
                                    token: activity.token,
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
                <Popconfirm
                    title="Really delete this activity?"
                    description="This is not reversible"
                    onConfirm={() => {
                        deleteActivityMutation.mutate(activity.token, {
                            onSuccess: () => {
                                navigate({
                                    pathname: '/activities',
                                    search: window.location.search,
                                })
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
        </div>
    )
}

export default ActivityDetail

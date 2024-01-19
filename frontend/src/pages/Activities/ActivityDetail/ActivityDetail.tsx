import { StarFilled } from '@ant-design/icons'
import { RJSFSchema } from '@rjsf/utils'
import {
    AutoComplete,
    Button,
    Checkbox,
    Divider,
    Form,
    Input,
    InputNumber,
    Radio,
    Select,
    Spin,
} from 'antd'
import DatePicker from 'components/DatePicker'
import { DateTime } from 'luxon'
import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useActivity, useUpdateActivity } from 'services/activities_service'
import { useItem } from 'services/item_service'
import { useItemType, useItemTypeAutoCompleteSuggestions } from 'services/item_type_service'
import { useUserSettings } from 'services/user_service'
import { capitalizeWords } from 'services/utils'

export interface ActivityDetailProps {}

const ActivityDetail = ({}: ActivityDetailProps) => {
    const { token } = useParams()
    const { data: activity } = useActivity(token)
    const { data: item } = useItem(activity?.item)
    const { data: itemType } = useItemType(activity?.item_type)
    const { data: parentItemType } = useItemType(itemType?.parent_slug)
    const { data: userSettings } = useUserSettings()
    const updateActivityMutation = useUpdateActivity()

    // form values are not updating correctly for these guys, so for now just control them ourselves
    const [dateRangeStart, setDateRangeStart] = useState<DateTime | null>(
        activity?.start_time ? DateTime.fromISO(activity.start_time) : null,
    )
    const [dateRangeEnd, setDateRangeEnd] = useState<DateTime | null>(
        activity?.end_time ? DateTime.fromISO(activity.end_time) : null,
    )
    useEffect(() => {
        if (activity?.start_time && !dateRangeStart) {
            setDateRangeStart(DateTime.fromISO(activity.start_time))
        }
        if (activity?.end_time && !dateRangeEnd) {
            setDateRangeEnd(DateTime.fromISO(activity.end_time))
        }
    }, [activity, dateRangeEnd, dateRangeStart])
    const { data: autocompleteChoices } = useItemTypeAutoCompleteSuggestions(itemType?.slug ?? '')
    if (!itemType || !activity || !item) {
        return <Spin />
    }
    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '5px',
                    alignItems: 'center',
                }}
            >
                Activity for
                <Link to={{ pathname: '/items/' + (item?.token ?? '') }}>
                    {item?.name || '[No Name Schema]'}
                </Link>
            </div>
            <Form
                labelAlign="left"
                labelWrap
                labelCol={{ span: 1 }}
                initialValues={{
                    ...item?.info,
                    activity__Finished: activity.finished,
                    activity__Pending: activity.pending,

                    activity__Rating: activity?.rating
                        ? activity?.rating * (userSettings?.ratingMax ?? 5)
                        : undefined,
                    activity__Notes: activity.notes,
                    item__Parent: item?.parent_token,
                }}
                onFinish={vals => {
                    if (!activity) {
                        return
                    }
                    const activityInfo = {
                        rating: vals.activity__Rating
                            ? vals.activity__Rating / (userSettings?.ratingMax ?? 5)
                            : undefined,
                        notes: vals.activity__Notes as string,
                        finished: vals.activity__FinishedOrPending === 'finished',
                        pending: vals.activity__FinishedOrPending === 'pending',
                        start_time: dateRangeStart?.toISO() ?? undefined,
                        end_time: dateRangeEnd?.toISO() ?? undefined,
                    }
                    updateActivityMutation.mutate({
                        token: activity.token,
                        patch: activityInfo,
                    })
                }}
            >
                {Object.entries(itemType.item_schema.properties ?? {}).map(
                    ([fieldName, fieldData]) =>
                        typeof fieldData === 'boolean' ? null : (
                            <Form.Item
                                key={fieldName}
                                label={fieldData?.title ?? fieldName}
                                name={fieldName}
                                rules={[
                                    {
                                        required:
                                            itemType.item_schema?.required?.includes(fieldName),
                                        message: `${fieldData?.title ?? fieldName} is required`,
                                    },
                                ]}
                            >
                                {fieldData.type === 'string' ? (
                                    <AutoComplete
                                        disabled
                                        allowClear
                                        filterOption
                                        style={{ maxWidth: '300px' }}
                                        options={autocompleteChoices?.[fieldName]}
                                    />
                                ) : fieldData.type === 'number' ? (
                                    <InputNumber disabled />
                                ) : (
                                    <div>UnsupportedType</div>
                                )}
                            </Form.Item>
                        ),
                )}
                {parentItemType ? (
                    <Form.Item
                        label={parentItemType.name}
                        name="item__Parent"
                    >
                        <Select
                            disabled
                            allowClear
                            style={{ width: '300px' }}
                            filterOption
                            options={autocompleteChoices?.[parentItemType.slug]}
                            showSearch
                        />
                    </Form.Item>
                ) : null}
                <Divider />
                <Form.Item
                    name="activity__Pending"
                    label="Pending"
                    valuePropName="checked"
                >
                    <Checkbox />
                </Form.Item>
                <Form.Item
                    valuePropName="checked"
                    name="activity__Finished"
                    label="Finishes Item"
                >
                    <Checkbox />
                </Form.Item>
                <Form.Item
                    label="Date Range"
                    getValueProps={i => ({ value: DateTime.fromJSDate(i) })}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <div>
                            <DatePicker.RangePicker
                                showTime
                                allowEmpty={[true, true]}
                                value={[dateRangeStart, dateRangeEnd]}
                                onChange={dates => {
                                    setDateRangeStart(dates?.[0] ?? null)
                                    setDateRangeEnd(dates?.[1] ?? null)
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '15px' }}>
                            <Button
                                type="text"
                                onClick={() => {
                                    setDateRangeStart(DateTime.now())
                                }}
                            >
                                Set Start To Now
                            </Button>
                            <Button
                                type="text"
                                onClick={() => {
                                    setDateRangeEnd(DateTime.now())
                                }}
                            >
                                Set End To Now
                            </Button>
                        </div>
                    </div>
                </Form.Item>

                <Form.Item
                    name="activity__Rating"
                    label="Rating"
                >
                    <InputNumber max={userSettings?.ratingMax ?? 5} />
                </Form.Item>
                <Form.Item
                    name="activity__Notes"
                    label="Notes"
                >
                    <Input.TextArea style={{ maxWidth: '400px' }} />
                </Form.Item>
                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={updateActivityMutation.isPending}
                    >
                        Update
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}

export default ActivityDetail

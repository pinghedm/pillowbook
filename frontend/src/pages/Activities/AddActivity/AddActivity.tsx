import { RJSFSchema } from '@rjsf/utils'
import React, { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useItemType, useItemTypeAutoCompleteSuggestions } from 'services/item_type_service'
import validator from '@rjsf/validator-ajv8'
import { AutoComplete, InputNumber, Spin, Form, Button, Divider, Checkbox, Input } from 'antd'
import DatePicker from 'components/DatePicker'
import { capitalizeWords } from 'services/utils'
import { useCreateActivity } from 'services/activities_service'
import { useUserSettings } from 'services/user_service'
import { DateTime } from 'luxon'
export interface AddActivityProps {}

const AddActivity = ({}: AddActivityProps) => {
    const navigate = useNavigate()
    const { type: itemTypeSlug } = useParams()
    const { data: itemType } = useItemType(itemTypeSlug)
    const { data: userSettings } = useUserSettings()

    const activityProperties: RJSFSchema = useMemo(
        () => ({
            rating: {
                type: 'number',
                title: 'Rating',
                minimum: 0,
                maximum: userSettings?.ratingMax ?? 5,
            },
            notes: { type: 'string', title: 'Notes' },
            finished: { type: 'boolean', title: 'Finished' },
        }),
        [userSettings],
    )

    const filteredSchema = useMemo(() => {
        if (!itemType) {
            return {}
        }

        // const autoCompleteFields: string[] = [...properties.autocompleteFields];
        const schema = {
            ...itemType.item_schema,
            title: itemType.name,

            properties: { ...itemType.item_schema.properties, ...activityProperties },
        }
        return schema
    }, [itemType])

    const createActivityMutation = useCreateActivity()
    // form values are not updating correctly for these guys, so for now just control them ourselves
    const [dateRangeStart, setDateRangeStart] = useState<DateTime | null>(null)
    const [dateRangeEnd, setDateRangeEnd] = useState<DateTime | null>(null)
    const { data: autocompleteChoices } = useItemTypeAutoCompleteSuggestions(itemTypeSlug)

    if (!itemType) {
        return <Spin />
    }

    return (
        <div>
            Add {itemType.name}
            <Form
                labelAlign="left"
                labelWrap
                labelCol={{ span: 1 }}
                onFinish={vals => {
                    console.log(vals)
                    const formData = { ...vals }
                    const activityData = {
                        start_time: dateRangeStart?.toISO() ?? undefined,
                        end_time: dateRangeEnd?.toISO() ?? undefined,
                        finished: vals.activity__Finished,
                        rating: vals.activity__Rating,
                        notes: vals.activity__Notes,
                        info: {},
                    }
                    const itemData = Object.fromEntries(
                        Object.entries(formData).filter(
                            ([k, v]) => !Object.keys(activityData).includes(k),
                        ),
                    )
                    createActivityMutation.mutate(
                        {
                            activityDetails: activityData,
                            itemDetails: {
                                item_type: itemType.slug,
                                info: itemData,
                            },
                        },
                        {
                            onSuccess: activity => {
                                navigate({ pathname: activity.token })
                            },
                        },
                    )
                }}
            >
                {Object.entries(itemType.item_schema.properties ?? {}).map(
                    ([fieldName, fieldData]) =>
                        typeof fieldData === 'boolean' ? null : (
                            <Form.Item
                                hasFeedback
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
                <Divider />
                <Form.Item
                    name="activity__Finished"
                    label="Finished?"
                    valuePropName="checked"
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
                    >
                        Add
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}

export default AddActivity

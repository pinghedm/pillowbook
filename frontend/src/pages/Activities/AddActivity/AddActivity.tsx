import { RJSFSchema } from '@rjsf/utils'
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useItemType, useItemTypeAutoCompleteSuggestions } from 'services/item_type_service'
import validator from '@rjsf/validator-ajv8'
import {
    AutoComplete,
    InputNumber,
    Spin,
    Form,
    Button,
    Divider,
    Checkbox,
    Input,
    Popover,
    Select,
    Radio,
} from 'antd'
import DatePicker from 'components/DatePicker'
import { useCreateActivity } from 'services/activities_service'
import { useUserSettings } from 'services/user_service'
import { DateTime } from 'luxon'
import { PlusOutlined } from '@ant-design/icons'
import AddItem from 'pages/AddItem/AddItem.lazy'
import { useForm } from 'antd/es/form/Form'
import { ItemDetail, useItem } from 'services/item_service'
import ActivityDetail from '../ActivityDetail/ActivityDetail.lazy'
export interface AddActivityProps {}

const AddActivity = ({}: AddActivityProps) => {
    const navigate = useNavigate()
    const { type: itemTypeSlug, token } = useParams()
    const { data: itemType } = useItemType(itemTypeSlug)
    const { data: parentItemType } = useItemType(itemType?.parent_slug ?? '')
    const { data: userSettings } = useUserSettings()

    const createActivityMutation = useCreateActivity()
    // form values are not updating correctly for these guys, so for now just control them ourselves
    const [dateRangeStart, setDateRangeStart] = useState<DateTime | null>(null)
    const [dateRangeEnd, setDateRangeEnd] = useState<DateTime | null>(null)

    useEffect(() => {
        if (userSettings?.activityDefaults?.defaultEndToNow && !dateRangeEnd) {
            setDateRangeEnd(DateTime.fromJSDate(new Date()))
        }
        if (userSettings?.activityDefaults?.defaultStartToNow && !dateRangeStart) {
            setDateRangeStart(DateTime.fromJSDate(new Date()))
        }
    }, [userSettings, dateRangeStart, dateRangeEnd])
    const { data: autocompleteChoices } = useItemTypeAutoCompleteSuggestions(itemTypeSlug)
    const [popoverOpen, setPopoverOpen] = useState(false)
    const [form] = useForm()
    const {data: item, status: itemStatus} = useItem(token)

    if (!itemType) {
        return <Spin />
    }

    if (token && !item){
        return <Spin/>
     }


    return (
        <div>
            Add {itemType.name}
            <Form
                initialValues={{
                    ...item?.info??{},
                    item__Parent: item?.parent_token
                    activity__FinishedOrPending:
                        userSettings?.activityDefaults?.defaultStatus ?? '',
                    
                }}
                form={form}
                labelAlign="left"
                labelWrap
                labelCol={{ span: 1 }}
                onFinish={vals => {
                    const formData = { ...vals }
                    const activityData = {
                        start_time: dateRangeStart?.toISO() ?? undefined,
                        end_time: dateRangeEnd?.toISO() ?? undefined,
                        finished: vals.activity__FinishedOrPending === 'finished',
                        pending: vals.activity__FinishedOrPending === 'pending',
                        rating: vals.activity__Rating,
                        notes: vals.activity__Notes,
                        info: {},
                    }
                    const itemData: ItemDetail['info'] = Object.fromEntries(
                        Object.entries(formData)
                            .filter(([k, v]) => !Object.keys(activityData).includes(k))
                            .filter(([k, v]) => !k.startsWith('activity__')),
                    )
                    const itemParentToken = itemData?.['item__Parent']
                    delete itemData['item__Parent']
                    createActivityMutation.mutate(
                        {
                            activityDetails: activityData,
                            itemDetails: {
                                item_type: itemType.slug,
                                info: itemData,
                                parent_token: itemParentToken,
                            },
                        },
                        {
                            onSuccess: activity => {
                                navigate({ pathname: `/activities/${itemType.slug}/${activity.token}` })
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
                                        options={autocompleteChoices?.[fieldName]}
                                    />
                                ) : fieldData.type === 'number' ? (
                                    <InputNumber />
                                ) : (
                                    <div>UnsupportedType</div>
                                )}
                            </Form.Item>
                        ),
                )}
                {parentItemType ? (
                    <Form.Item label={parentItemType.name}>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: '5px',
                                alignItems: 'center',
                            }}
                        >
                            <Form.Item name="item__Parent">
                                <Select
                                    allowClear
                                    style={{ width: '300px' }}
                                    filterOption
                                    options={autocompleteChoices?.[parentItemType.slug]}
                                    showSearch
                                />
                            </Form.Item>
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
                                                form.setFieldValue('item__Parent', newItem.token)
                                                setPopoverOpen(false)
                                            }}
                                            // setAsParentTo={item.token}
                                        />
                                    </div>
                                }
                            >
                                <Button icon={<PlusOutlined />} />
                            </Popover>
                        </div>
                    </Form.Item>
                ) : null}
                <Divider />
                <Form.Item
                    name="activity__FinishedOrPending"
                    label="Status"
                >
                    <Radio.Group>
                        <Radio value="pending">Pending</Radio>
                        <Radio value="finished">Finished</Radio>
                        <Radio value="">None</Radio>
                    </Radio.Group>
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
                        loading={createActivityMutation.isPending}
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

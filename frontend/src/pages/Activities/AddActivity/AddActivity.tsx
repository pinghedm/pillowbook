import { RJSFSchema } from '@rjsf/utils'
import React, { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useItemType } from 'services/item_type_service'
import validator from '@rjsf/validator-ajv8'
import {
    AutoComplete,
    InputNumber,
    Spin,
    Form,
    Button,
    Divider,
    Checkbox,
    DatePicker,
    Input,
} from 'antd'
import { capitalizeWords } from 'services/utils'
import { useCreateActivity } from 'services/activities_service'
import { useUserSettings } from 'services/user_service'
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
                                    <AutoComplete style={{ maxWidth: '300px' }} />
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
                    name="finished"
                    label="Finished?"
                    valuePropName="checked"
                >
                    <Checkbox />
                </Form.Item>
                <Form.Item
                    name="range"
                    label="Date Range"
                >
                    <DatePicker.RangePicker />
                </Form.Item>

                <Form.Item
                    name="rating"
                    label="Rating"
                >
                    <InputNumber max={userSettings?.ratingMax ?? 5} />
                </Form.Item>
                <Form.Item
                    name="note"
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
            {/*<Form
                uiSchema={{
                    'ui:submitButtonOptions': {
                        props: { type: 'primary' },
                    },
                }}
                schema={filteredSchema}
                validator={validator}
                onChange={e => {
                    console.log(e)
                }}
                onSubmit={e => {
                    const formData = e.formData
                    createActivityMutation.mutate(
                        {
                            activityDetails: {
                                start_time: formData.start_time,
                                end_time: formData.end_time || new Date().toISOString(),
                                finished: formData.finished,
                                rating: formData.rating,
                                notes: formData.notes,
                                info: formData.info,
                            },
                            itemDetails: {
                                item_type: itemType.slug,
                                info: Object.fromEntries(
                                    Object.entries(formData).filter(([k, v]) =>
                                        Object.keys(
                                            itemType?.item_schema?.properties ?? {},
                                        ).includes(k),
                                    ),
                                ),
                            },
                        },
                        {
                            onSuccess: activity => {
                                navigate({ pathname: activity.token })
                            },
                        },
                    )
                }}
                onError={e => console.log(e)}
            />*/}
        </div>
    )
}

export default AddActivity

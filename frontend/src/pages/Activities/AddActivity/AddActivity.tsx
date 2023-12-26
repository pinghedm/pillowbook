import Form from '@rjsf/antd'
import { RJSFSchema } from '@rjsf/utils'
import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useItemType } from 'services/item_type_service'
import validator from '@rjsf/validator-ajv8'
import { Spin } from 'antd'
import { capitalizeWords } from 'services/utils'
import { useCreateActivity } from 'services/activities_service'
export interface AddActivityProps {}

const activityProperties: RJSFSchema = {
    rating: { type: 'number', title: 'Rating' },
    notes: { type: 'string', title: 'Notes' },
    finished: { type: 'boolean', title: 'Finished' },
}
const AddActivity = ({}: AddActivityProps) => {
    const { type: itemTypeSlug } = useParams()
    const { data: itemType } = useItemType(itemTypeSlug)

    const itemProperties: RJSFSchema = useMemo(() => {
        if (!itemType) {
            return {}
        }
        const properties: RJSFSchema = {
            ...itemType.item_schema.properties,
        }
        const labelMap: Record<string, string> = {
            ...itemType.item_schema.properties.labelMap,
        }
        delete properties['labelMap']
        delete properties['autocompleteFields']
        return Object.fromEntries(
            Object.entries(properties).map(([k, v]) => [
                k,
                { ...v, title: labelMap?.[k] ?? capitalizeWords(k) ?? k },
            ]),
        )
    }, [itemType])

    const filteredSchema = useMemo(() => {
        if (!itemType) {
            return {}
        }

        // const autoCompleteFields: string[] = [...properties.autocompleteFields];
        const schema = {
            ...itemType.item_schema,
            title: itemType.name,

            properties: { ...itemProperties, ...activityProperties },
        }
        return schema
    }, [itemType])

    const createActivityMutation = useCreateActivity()

    if (!itemType) {
        return <Spin />
    }

    return (
        <div>
            AddActivity Component
            <Form
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
                    createActivityMutation.mutate({
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
                                    Object.keys(itemProperties).includes(k),
                                ),
                            ),
                        },
                    })
                }}
                onError={e => console.log(e)}
            />
        </div>
    )
}

export default AddActivity

import Form from '@rjsf/antd'
import { RJSFSchema } from '@rjsf/utils'
import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useItem, useUpdateItem } from 'services/item_service'
import { useItemType } from 'services/item_type_service'
import { useUserSettings } from 'services/user_service'
import { capitalizeWords } from 'services/utils'
import validator from '@rjsf/validator-ajv8'

export interface ItemDetailsProps {}

const ItemDetails = ({}: ItemDetailsProps) => {
    const { token } = useParams()
    const { data: item } = useItem(token)
    const { data: itemType } = useItemType(item?.item_type)
    const updateItemMutation = useUpdateItem()
    const { data: userSettings } = useUserSettings()

    const filteredSchema = useMemo(() => {
        if (!itemType) {
            return {}
        }

        // const autoCompleteFields: string[] = [...properties.autocompleteFields];
        const schema = {
            ...itemType.item_schema,
            title: item?.name ?? '',

            properties: {
                ...itemType.item_schema.properties,
                rating: {
                    type: 'number',
                    title: 'Rating',
                    minimum: 0,
                    maximum: userSettings?.ratingMax ?? 5,
                },
                notes: { type: 'string', title: 'Notes' },
            },
        }
        return schema
    }, [itemType, item, userSettings])
    return (
        <Form
            uiSchema={{
                'ui:submitButtonOptions': {
                    norender: true,
                },
            }}
            schema={filteredSchema}
            validator={validator}
            formData={{
                ...(item?.info ?? {}),
                rating: item?.rating
                    ? (item.rating * (userSettings?.ratingMax ?? 5)).toFixed(2)
                    : undefined,
                notes: item?.notes ?? '',
            }}
            onChange={e => {
                if (!item) {
                    return
                }
                const formData = e.formData
                const reducedFormInfo = { ...formData }
                delete reducedFormInfo['notes']
                delete reducedFormInfo['ratings']
                const itemInfo = {
                    rating: formData.rating / (userSettings?.ratingMax ?? 5),
                    notes: formData.notes,
                    info: reducedFormInfo,
                }
                updateItemMutation.mutate({
                    token: item.token,
                    patch: itemInfo,
                })
            }}
        />
    )
}

export default ItemDetails

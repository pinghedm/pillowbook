import { RJSFSchema } from '@rjsf/utils'
import React, { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useActivity, useUpdateActivity } from 'services/activities_service'
import { useItem } from 'services/item_service'
import { useItemType } from 'services/item_type_service'
import { useUserSettings } from 'services/user_service'
import { capitalizeWords } from 'services/utils'
import validator from '@rjsf/validator-ajv8'
import Form from '@rjsf/antd'

export interface ActivityDetailProps {}

const ActivityDetail = ({}: ActivityDetailProps) => {
    const { token } = useParams()
    const { data: activity } = useActivity(token)
    const { data: item } = useItem(activity?.item)
    const { data: itemType } = useItemType(activity?.item_type)
    const { data: userSettings } = useUserSettings()
    const updateActivityMutation = useUpdateActivity()

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
            title: (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '5px',
                        alignItems: 'center',
                    }}
                >
                    Activity for
                    <Link to={{ pathname: '/items/' + item?.token ?? '' }}>{item?.name}</Link>
                </div>
            ),

            properties: { ...itemType.item_schema.properties, ...activityProperties },
        }
        return schema
    }, [itemType, item])

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
                notes: activity?.notes ?? '',
                rating: activity?.rating
                    ? (activity.rating * (userSettings?.ratingMax ?? 5)).toFixed(2)
                    : undefined,
                finished: activity?.finished,
            }}
            onChange={e => {
                if (!activity) {
                    return
                }
                const formData = e.formData
                const activityInfo = {
                    rating: formData.rating / (userSettings?.ratingMax ?? 5),
                    notes: formData.notes,
                    finished: formData.finished,
                }
                updateActivityMutation.mutate({
                    token: activity.token,
                    patch: activityInfo,
                })
            }}
        />
    )
}

export default ActivityDetail

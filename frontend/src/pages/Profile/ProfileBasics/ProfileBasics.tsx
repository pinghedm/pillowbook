import { Alert, Button, Divider, InputNumber, Switch } from 'antd'
import React, { useState } from 'react'
import { useItemTypes } from 'services/item_type_service'
import { useUpdateUserSettings, useUserSettings } from 'services/user_service'

export interface ProfileBasicsProps {}

const ProfileBasics = ({}: ProfileBasicsProps) => {
    const { data: userSettings } = useUserSettings()
    const userSettingsMutation = useUpdateUserSettings()
    const [saving, setSaving] = useState(false)
    const { data: itemTypes } = useItemTypes()
    return (
        <>
            <div style={{ height: '40px', width: '100%', marginBottom: '10px' }}>
                {saving ? (
                    <Alert
                        type="success"
                        message="Saving..."
                    />
                ) : null}
            </div>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '5px',
                    alignItems: 'center',
                }}
            >
                Max Rating{' '}
                <InputNumber
                    value={userSettings?.ratingMax}
                    placeholder="5"
                    onStep={value => {
                        userSettingsMutation.mutate(
                            {
                                ...userSettings,
                                ratingMax: Number(value),
                            },
                            {
                                onSuccess: () => {
                                    setSaving(true)
                                    setTimeout(() => {
                                        setSaving(false)
                                    }, 1000)
                                },
                            },
                        )
                    }}
                    onBlur={e => {
                        userSettingsMutation.mutate(
                            {
                                ...userSettings,
                                ratingMax: Number(e.target.value),
                            },
                            {
                                onSuccess: () => {
                                    setSaving(true)
                                    setTimeout(() => {
                                        setSaving(false)
                                    }, 1000)
                                },
                            },
                        )
                    }}
                />
            </div>
            <Divider />
            <div>
                Item Types in Quick Menu
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '5px',
                        flexWrap: 'wrap',
                        marginTop: '5px',
                    }}
                >
                    {itemTypes?.map(t => (
                        <Button
                            type={
                                userSettings?.itemTypesInQuickMenu?.includes(t.slug)
                                    ? 'primary'
                                    : undefined
                            }
                            key={t.slug}
                            onClick={() => {
                                const oldItemTypes = [...(userSettings?.itemTypesInQuickMenu ?? [])]
                                let newItemTypes
                                if (oldItemTypes.includes(t.slug)) {
                                    newItemTypes = oldItemTypes.filter(s => s !== t.slug)
                                } else {
                                    newItemTypes = [...oldItemTypes, t.slug]
                                }
                                userSettingsMutation.mutate({
                                    ...userSettings,
                                    itemTypesInQuickMenu: newItemTypes,
                                })
                            }}
                        >
                            {t.name}
                        </Button>
                    ))}
                </div>
            </div>
            <Divider />
            <div>
                <Switch
                    checked={userSettings?.use24HrTime ?? true}
                    onChange={checked => {
                        setSaving(true)
                        userSettingsMutation.mutate(
                            {
                                ...userSettings,
                                use24HrTime: checked,
                            },
                            {
                                onSuccess: () => {
                                    setSaving(false)
                                },
                            },
                        )
                    }}
                />{' '}
                Use 24 hr time format
            </div>
        </>
    )
}

export default ProfileBasics

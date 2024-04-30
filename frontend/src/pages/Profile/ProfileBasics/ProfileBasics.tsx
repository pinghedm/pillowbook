import { Button, Divider, Input, InputNumber, Select, Switch, Typography } from 'antd'
import { useState } from 'react'
import { useItemTypes } from 'services/item_type_service'
import { useUpdateUserSettings, useUserSettings } from 'services/user_service'

export interface ProfileBasicsProps {}

const ProfileBasics = ({}: ProfileBasicsProps) => {
    const { data: userSettings } = useUserSettings()
    const userSettingsMutation = useUpdateUserSettings()
    const [saved, setSaved] = useState(false)
    const { data: itemTypes } = useItemTypes()
    return (
        <>
            <Typography.Title level={4}>Basic Settings</Typography.Title>
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
                        userSettingsMutation.mutate({
                            ...userSettings,
                            ratingMax: Number(value),
                        })
                    }}
                    onBlur={e => {
                        userSettingsMutation.mutate({
                            ...userSettings,
                            ratingMax: Number(e.target.value),
                        })
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
                        userSettingsMutation.mutate({
                            ...userSettings,
                            use24HrTime: checked,
                        })
                    }}
                />{' '}
                Use 24 hr time format
            </div>
            <div>
                Display Timezone{' '}
                <Select
                    loading={userSettingsMutation.isPending}
                    style={{ width: '200px' }}
                    showSearch
                    options={
                        // @ts-ignore
                        Intl.supportedValuesOf('timeZone').map(v => ({ value: v, label: v }))
                    }
                    value={userSettings?.displayTimezone ?? 'UTC'}
                    onChange={val => {
                        userSettingsMutation.mutate({ ...userSettings, displayTimezone: val })
                    }}
                    popupMatchSelectWidth={false}
                />
            </div>
        </>
    )
}

export default ProfileBasics

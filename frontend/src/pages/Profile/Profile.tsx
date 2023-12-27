import { Alert, InputNumber, Typography } from 'antd'
import React, { useState } from 'react'
import { useUpdateUserSettings, useUserSettings } from 'services/user_service'

export interface ProfileProps {}

const Profile = ({}: ProfileProps) => {
    const { data: userSettings } = useUserSettings()
    const userSettingsMutation = useUpdateUserSettings()
    const [saving, setSaving] = useState(false)
    return (
        <div>
            <Typography.Title level={3}>Profile</Typography.Title>
            <div style={{ height: '40px', width: '100%', marginBottom: '10px' }}>
                {saving ? (
                    <Alert
                        type="success"
                        message="Saving..."
                    />
                ) : null}
            </div>
            <div
                style={{ display: 'flex', flexDirection: 'row', gap: '5px', alignItems: 'center' }}
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
        </div>
    )
}

export default Profile

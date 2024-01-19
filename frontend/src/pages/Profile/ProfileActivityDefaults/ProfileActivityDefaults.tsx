import { Alert, Checkbox, Radio, Switch, Typography } from 'antd'
import React, { useState } from 'react'
import { useUpdateUserSettings, useUserSettings } from 'services/user_service'

export interface ProfileActivityDefaultsProps {}

const ProfileActivityDefaults = ({}: ProfileActivityDefaultsProps) => {
    const { data: userSettings } = useUserSettings()
    const userSettingsMutation = useUpdateUserSettings()
    const [saving, setSaving] = useState(false)
    return (
        <div style={{ width: '100%', height: '100%' }}>
            <div style={{ height: '40px', width: '100%', marginBottom: '10px' }}>
                {saving ? (
                    <Alert
                        type="success"
                        message="Saving..."
                    />
                ) : null}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <Typography.Title level={4}>Status</Typography.Title>
                    <div>
                        <Switch
                            checked={userSettings?.activityDefaults?.defaultPending}
                            onChange={checked => {
                                setSaving(true)
                                userSettingsMutation.mutate(
                                    {
                                        ...userSettings,
                                        activityDefaults: {
                                            ...(userSettings?.activityDefaults ?? {}),
                                            defaultPending: checked,
                                        },
                                    },
                                    {
                                        onSuccess: () => {
                                            setSaving(false)
                                        },
                                    },
                                )
                            }}
                        />{' '}
                        New activities should default to Pending
                    </div>
                    <div>
                        <Switch
                            checked={userSettings?.activityDefaults?.defaultFinished}
                            onChange={checked => {
                                setSaving(true)
                                userSettingsMutation.mutate(
                                    {
                                        ...userSettings,
                                        activityDefaults: {
                                            ...(userSettings?.activityDefaults ?? {}),
                                            defaultFinished: checked,
                                        },
                                    },
                                    {
                                        onSuccess: () => {
                                            setSaving(false)
                                        },
                                    },
                                )
                            }}
                        />{' '}
                        New activities should default to Close out Item
                    </div>
                    {/*<Radio.Group
                        value={userSettings?.activityDefaults?.defaultStatus ?? ''}
                        onChange={e => {
                            setSaving(true)
                            userSettingsMutation.mutate(
                                {
                                    ...userSettings,
                                    activityDefaults: {
                                        ...(userSettings?.activityDefaults ?? {}),
                                        defaultStatus: e.target.value,
                                    },
                                },
                                {
                                    onSuccess: () => {
                                        setSaving(false)
                                    },
                                },
                            )
                        }}
                    >
                        <Radio value="">Nothing</Radio>
                        <Radio value="pending">Pending</Radio>
                        <Radio value="finished">Finished</Radio>
                    </Radio.Group>*/}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <Typography.Title level={4}>Times</Typography.Title>
                    <div>
                        <Switch
                            checked={userSettings?.activityDefaults?.defaultStartToNow}
                            onChange={checked => {
                                setSaving(true)
                                userSettingsMutation.mutate(
                                    {
                                        ...userSettings,
                                        activityDefaults: {
                                            ...(userSettings?.activityDefaults ?? {}),
                                            defaultStartToNow: checked,
                                        },
                                    },
                                    {
                                        onSuccess: () => {
                                            setSaving(false)
                                        },
                                    },
                                )
                            }}
                        />{' '}
                        Default Start Time To Now
                    </div>
                    <div>
                        <Switch
                            checked={userSettings?.activityDefaults?.defaultEndToNow}
                            onChange={checked => {
                                setSaving(true)
                                userSettingsMutation.mutate(
                                    {
                                        ...userSettings,
                                        activityDefaults: {
                                            ...(userSettings?.activityDefaults ?? {}),
                                            defaultEndToNow: checked,
                                        },
                                    },
                                    {
                                        onSuccess: () => {
                                            setSaving(false)
                                        },
                                    },
                                )
                            }}
                        />{' '}
                        Default End Time To Now
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfileActivityDefaults

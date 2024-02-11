import { Switch, Typography } from 'antd'
import { useUpdateUserSettings, useUserSettings } from 'services/user_service'

export interface ProfileActivityDefaultsProps {}

const ProfileActivityDefaults = ({}: ProfileActivityDefaultsProps) => {
    const { data: userSettings } = useUserSettings()
    const userSettingsMutation = useUpdateUserSettings()
    return (
        <div style={{ width: '100%', height: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <Typography.Title level={4}>Status</Typography.Title>
                    <div>
                        <Switch
                            checked={userSettings?.activityDefaults?.defaultPending}
                            onChange={checked => {
                                userSettingsMutation.mutate(
                                    {
                                        ...userSettings,
                                        activityDefaults: {
                                            ...(userSettings?.activityDefaults ?? {}),
                                            defaultPending: checked,
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
                                userSettingsMutation.mutate(
                                    {
                                        ...userSettings,
                                        activityDefaults: {
                                            ...(userSettings?.activityDefaults ?? {}),
                                            defaultFinished: checked,
                                        },
                                    },
                                )
                            }}
                        />{' '}
                        New activities should default to Close out Item
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <Typography.Title level={4}>Times</Typography.Title>
                    <div>
                        <Switch
                            checked={userSettings?.activityDefaults?.defaultStartToNow}
                            onChange={checked => {
                                userSettingsMutation.mutate(
                                    {
                                        ...userSettings,
                                        activityDefaults: {
                                            ...(userSettings?.activityDefaults ?? {}),
                                            defaultStartToNow: checked,
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
                                userSettingsMutation.mutate(
                                    {
                                        ...userSettings,
                                        activityDefaults: {
                                            ...(userSettings?.activityDefaults ?? {}),
                                            defaultEndToNow: checked,
                                        },
                                    },
                                )
                            }}
                        />{' '}
                        Default End Time To Now
                    </div>
                    <div>
                        <Switch
                            checked={userSettings?.use24HrTime ?? true}
                            onChange={checked => {
                                userSettingsMutation.mutate(
                                    {
                                        ...userSettings,
                                        use24HrTime: checked,
                                    },
                                )
                            }}
                        />{' '}
                        Use 24 hr time in input fields
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfileActivityDefaults

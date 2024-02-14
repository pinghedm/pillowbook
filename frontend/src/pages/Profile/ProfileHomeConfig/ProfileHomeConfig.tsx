import { useUpdateUserSettings, useUserSettings } from 'services/user_service'
import { DefaultHomeScreenModules, HomeScreenModules } from 'pages/Home/Home'
import { Card, Flex, Switch, Typography } from 'antd'

export interface ProfileHomeConfigProps {}

const ProfileHomeConfig = ({}: ProfileHomeConfigProps) => {
    const { data: userSettings } = useUserSettings()
    const userSettingsMutation = useUpdateUserSettings()
    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Typography.Title level={4}>Home Screen Modules</Typography.Title>
            <Flex gap={5} wrap='wrap' id='home-modules-list'>
                {HomeScreenModules.map(mod => (
                    <Card
                        style={{ width: '250px' }}
                        title={mod.label}
                        key={mod.value}
                        actions={[
                            <Switch
                                checked={(
                                    userSettings?.homePageSettings?.activeModules ??
                                    DefaultHomeScreenModules
                                )?.includes(mod.value)}
                                onChange={checked => {
                                    const newModules = checked
                                        ? [
                                              ...(userSettings?.homePageSettings?.activeModules ??
                                                  DefaultHomeScreenModules),
                                              mod.value,
                                          ]
                                        : (
                                              userSettings?.homePageSettings?.activeModules ??
                                              DefaultHomeScreenModules
                                          ).filter(v => v !== mod.value)
                                    userSettingsMutation.mutate({
                                        ...userSettings,
                                        homePageSettings: {
                                            ...(userSettings?.homePageSettings ?? {}),
                                            activeModules: newModules,
                                        },
                                    })
                                }}
                            />,
                        ]}
                    >
                        <Card.Meta description={mod.descr} />
                    </Card>
                ))}
            </Flex>
        </div>
    )
}

export default ProfileHomeConfig

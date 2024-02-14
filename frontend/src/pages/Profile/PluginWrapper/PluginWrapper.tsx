import { Typography } from 'antd'
import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'

const PLUGIN_DETAILS_BY_NAME_TEMP: Record<string, { configPage: React.ReactNode }> = {
    goodreads: { configPage: <div>ok</div> },
}

const DEFAULT_PLUGIN_PAGE = ({ name }: { name: string }) => {
    return <Typography.Title level={3}>No Config for {name}</Typography.Title>
}

export interface PluginWrapperProps {}

const PluginWrapper = ({}: PluginWrapperProps) => {
    const { pluginName } = useParams()
    const pluginData = useMemo(
        () =>
            PLUGIN_DETAILS_BY_NAME_TEMP?.[pluginName ?? ''] ?? {
                configPage: <DEFAULT_PLUGIN_PAGE name={pluginName ?? '-'} />,
            },
        [pluginName],
    )
    return <div>{pluginData.configPage}</div>
}

export default PluginWrapper

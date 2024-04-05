import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { HomeScreenModules } from 'pages/Home/Home'

export interface UserSettings {
    ratingMax?: number
    itemTypesInQuickMenu?: string[]
    activityDefaults: {
        defaultPending?: boolean
        defaultFinished?: boolean
        defaultStartToNow?: boolean
        defaultEndToNow?: boolean
    }
    homePageSettings?: {
        activeModules?: (typeof HomeScreenModules)[number]['value'][]
    }
    use24HrTime?: boolean
}

export const useUserSettings = () => {
    const _get = async () => {
        const res = await axios.get<{ settings: UserSettings }>('/api/settings')
        return res.data.settings
    }

    const query = useQuery({ queryKey: ['userSettings'], queryFn: _get })
    return query
}

export const useUpdateUserSettings = () => {
    const _patch = async (newSettings: Partial<UserSettings>) => {
        const res = await axios.patch<UserSettings>('/api/settings', { settings: newSettings })
        return res.data
    }

    const queryClient = useQueryClient()
    const mutation = useMutation({
        mutationFn: (patch: Partial<UserSettings>) => _patch(patch),
        onMutate: () => {
            queryClient.cancelQueries({ queryKey: ['userSettings'] })
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['userSettings'] })
        },
    })
    return mutation
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

export interface UserSettings {
    ratingMax?: number
    itemTypesInQuickMenu?: string[]
    activityDefaults: {
        defaultStatus?: 'pending' | 'finished' | ''
        defaultStartToNow?: boolean
        defaultEndToNow?: boolean
    }
}

export const useUserSettings = () => {
    const _get = async () => {
        const res = await axios.get<{ settings: UserSettings }>('/api/settings/1')
        return res.data.settings
    }

    const query = useQuery({ queryKey: ['userSettings'], queryFn: _get })
    return query
}

export const useUpdateUserSettings = () => {
    const _patch = async (newSettings: Partial<UserSettings>) => {
        const res = await axios.patch<UserSettings>('/api/settings/1', { settings: newSettings })
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

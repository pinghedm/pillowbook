import axios from 'axios'
import { ItemDetail } from './item_service'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BookOutlined, VideoCameraOutlined } from '@ant-design/icons'
import { ReactNode } from 'react'
export const ActivityIconByItemType: Record<string, ReactNode> = {
    book: <BookOutlined />,
    movie: <VideoCameraOutlined />,
}

export interface Activity {
    token: string
    item_type: string
    item_name: string

    start_time: string // isoformat
    end_time: string // isoformat
    finished: boolean

    rating: number
}

export interface ActivityDetail {
    token: string
    item: string // token
    item_type: string // slug

    start_time: string // isoformat
    end_time: string // isoformat
    finished: boolean

    rating: number
    notes: string
    info: Record<string, any>
}

export interface CreateActivityType {
    itemDetails: { info: ItemDetail['info']; item_type: ItemDetail['item_type'] }
    activityDetails: Omit<ActivityDetail, 'token' | 'item' | 'item_type'>
}

export const useCreateActivity = () => {
    const _post = async (newActivity: CreateActivityType) => {
        const res = await axios.post('/api/activity', newActivity)
        return res.data
    }
    const queryClient = useQueryClient()
    const mutation = useMutation({
        mutationFn: (newActivity: CreateActivityType) => _post(newActivity),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['activities'] })
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['activities'] })
        },
    })
    return mutation
}

export const useActivities = () => {
    const _get = async () => {
        const res = await axios.get<Activity[]>('/api/activity')
        return res.data
    }

    const query = useQuery({ queryKey: ['activities'], queryFn: _get })
    return query
}

export const useActivity = (token?: string) => {
    const _get = async (token: string) => {
        const res = await axios.get<ActivityDetail>('/api/activity/' + token)
        return res.data
    }
    const query = useQuery({
        queryKey: ['activities', token],
        queryFn: () => _get(token ?? ''),
        enabled: !!token,
    })
    return query
}

export const useUpdateActivity = () => {
    const _patch = async (token: string, patch: Partial<ActivityDetail>) => {
        const res = await axios.patch<ActivityDetail>('/api/activity/' + token, patch)
        return res.data
    }

    const queryClient = useQueryClient()
    const mutation = useMutation({
        mutationFn: ({ token, patch }: { token: string; patch: Partial<ActivityDetail> }) =>
            _patch(token, patch),

        onMutate: () => {
            queryClient.cancelQueries({ queryKey: ['activities'] })
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['activities'] })
        },
    })
    return mutation
}

import axios from 'axios'
import { ItemDetail } from './item_service'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BookOutlined, VideoCameraOutlined } from '@ant-design/icons'
import { ReactNode } from 'react'

import { PaginatedResult, getDjangoShapedFilters } from './utils'

export interface Activity {
    token: string
    item_type: string
    item_name: string
    start_time: string // isoformat
    end_time: string // isoformat
    finished: boolean
    pending: boolean
    rating: number
    icon_url: string
}

export interface ActivityDetail {
    token: string
    item: string // token
    item_type: string // slug

    start_time?: string // isoformat
    end_time?: string // isoformat
    finished: boolean
    pending: boolean

    rating?: number
    notes: string
    info: Record<string, any>
}

export interface CreateActivityType {
    itemDetails: {
        info: ItemDetail['info']
        item_type: ItemDetail['item_type']
        parent_token?: string
    }
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
            await queryClient.cancelQueries({ queryKey: ['autocomplete'] })
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['activities'] })
            queryClient.invalidateQueries({ queryKey: ['autocomplete'] })
        },
    })
    return mutation
}

export const useActivityStaticFilters = () => {
    const _get = async () => {
        const res = await axios.get<{
            itemTypes: { value: string; label: string }[]
            items: { value: string; label: string }[]
        }>('/api/get_activities_static_filters')
        return res.data
    }
    const query = useQuery({
        queryKey: ['activities', 'staticFilters'],
        queryFn: _get,
    })
    return query
}

export interface FilterInfoFilters {
    // cascader options type wasnt happy when these were optional? so do this extra nonsense to appease it
    itemTypes: string[]
    completed: string[] // tragically, cascader doesnt allow bool
    items: string[]
    pending: string[] // tragically, cascader doesnt allow bool
}

export interface FilterInfo {
    pageNumber: number
    search?: string
    filters?: Partial<FilterInfoFilters>
}

export const useActivities = (
    pageNumber: number,
    pageSize: number,
    searchQuery?: string,
    filters?: FilterInfo['filters'],
) => {
    const _get = async () => {
        const res = await axios.get<PaginatedResult<Activity>>('/api/activity', {
            params: {
                page: pageNumber,
                page_size: pageSize,
                search: searchQuery,
                ...getDjangoShapedFilters(filters ?? {}),
            },
        })
        return res.data
    }

    const query = useQuery({
        queryKey: [
            'activities',
            pageNumber,
            pageSize,
            searchQuery ?? '',
            JSON.stringify(Object.entries(filters ?? {}).sort()),
        ],
        queryFn: _get,
    })
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

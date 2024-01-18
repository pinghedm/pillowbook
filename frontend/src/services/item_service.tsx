import { BookOutlined, LaptopOutlined, VideoCameraOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { ReactNode } from 'react'
import { PaginatedResult, getDjangoShapedFilters, getOrderingString } from './utils'

export interface ItemFilterInfoFilters {
    itemTypes: string[]
}
export interface ItemFilterInfo {
    pageNumber: number
    searchQuery?: string
    filters?: Partial<ItemFilterInfoFilters>
    ordering?: { key: string; order: 'ascend' | 'descend' }
}

export interface Item {
    token: string
    name: string
    rating?: number
    item_type: string
    parent_item_type: string
    icon_url: string
}

export interface ItemDetail {
    token: string
    rating: number
    notes: string
    item_type: string // slug
    info: Record<string, any>
    name: string
    parent_name: string
    parent_token?: string
}

export const useItems = (
    pageNumber: number,
    pageSize: number,
    search?: string,
    filters?: ItemFilterInfo['filters'],
    ordering?: { key: string; order: 'ascend' | 'descend' },
) => {
    const _get = async () => {
        const res = await axios.get<PaginatedResult<Item>>('/api/item', {
            params: {
                page: pageNumber,
                page_size: pageSize,
                ordering: getOrderingString(ordering),
                search,
                ...getDjangoShapedFilters(filters ?? {}),
            },
        })
        return res.data
    }

    const query = useQuery({
        queryKey: [
            'items',
            pageNumber,
            pageSize,
            JSON.stringify(ordering),
            search ?? '',
            JSON.stringify(Object.entries(filters ?? {}).sort()),
        ],
        queryFn: _get,
    })
    return query
}

export const useItemStaticFilters = () => {
    const _get = async () => {
        const res = await axios.get<{
            itemTypes: { value: string; label: string }[]
        }>('/api/get_items_static_filters')
        return res.data
    }
    const query = useQuery({
        queryKey: ['items', 'staticFilters'],
        queryFn: _get,
    })
    return query
}

export const useItem = (token?: string) => {
    const _get = async (token: string) => {
        const res = await axios.get<ItemDetail>('/api/item/' + token)
        return res.data
    }

    const query = useQuery({
        queryKey: ['items', token],
        queryFn: () => _get(token ?? ''),
        enabled: token?.startsWith('I'),
    })
    return query
}

export const useUpdateItem = () => {
    const _patch = async (token: string, patch: Partial<ItemDetail>) => {
        const res = await axios.patch('/api/item/' + token, patch)
        return res.data
    }
    const queryClient = useQueryClient()
    const mutation = useMutation({
        mutationFn: ({ token, patch }: { token: string; patch: Partial<ItemDetail> }) =>
            _patch(token, patch),
        onMutate: () => {
            queryClient.cancelQueries({ queryKey: ['items'] })
            queryClient.cancelQueries({ queryKey: ['autocomplete'] })
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['items'] })
            queryClient.invalidateQueries({ queryKey: ['autocomplete'] })
        },
    })
    return mutation
}

interface CreateItemType {
    info: Record<string, string>
    item_type: string
    setAsParentTo?: string // token of item
}

export const useCreateItem = () => {
    const _post = async (item: CreateItemType) => {
        const res = await axios.post<Item>('/api/item', item)
        return res.data
    }

    const queryClient = useQueryClient()
    const mutation = useMutation({
        mutationFn: (newItem: CreateItemType) => _post(newItem),
        onMutate: () => {
            queryClient.cancelQueries({ queryKey: ['items'] })
            queryClient.cancelQueries({ queryKey: ['autocomplete'] })
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['items'] })
            queryClient.invalidateQueries({ queryKey: ['autocomplete'] })
        },
    })
    return mutation
}

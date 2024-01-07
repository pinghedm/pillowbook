import { BookOutlined, LaptopOutlined, VideoCameraOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { ReactNode } from 'react'

export interface Item {
    token: string
    name: string
    rating?: number
    item_type: string
    parent_item_type: string
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

export const useItems = () => {
    const _get = async () => {
        const res = await axios.get<Item[]>('/api/item')
        return res.data
    }

    const query = useQuery({ queryKey: ['items'], queryFn: _get })
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
        enabled: !!token,
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

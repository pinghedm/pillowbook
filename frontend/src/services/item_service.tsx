import { BookOutlined, VideoCameraOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { ReactNode } from 'react'

export const ItemIconByItemType: Record<string, ReactNode> = {
    book: <BookOutlined />,
    movie: <VideoCameraOutlined />,
}

export interface Item {
    token: string
    name: string
    rating?: number
    item_type: string
}

export interface ItemDetail {
    token: string
    rating: number
    notes: string
    item_type: string // slug
    info: Record<string, any>
    name: string
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
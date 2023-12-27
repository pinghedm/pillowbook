import { BookOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { ReactNode } from 'react'

export const ItemIconByItemType: Record<string, ReactNode> = {
    book: <BookOutlined />,
}

export interface Item {
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

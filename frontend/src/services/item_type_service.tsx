import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export interface ItemType {
    slug: string
    name: string
}

export interface ItemTypeDetail extends ItemType {
    item_schema: Record<string, any>
    activity_schema: Record<string, any>
}

export const useItemTypes = () => {
    const _get = async () => {
        const res = await axios.get<ItemType[]>('/api/item_type')
        return res.data
    }

    const query = useQuery({ queryKey: ['itemTypes'], queryFn: _get })
    return query
}

export const useItemType = (slug?: string) => {
    const _get = async (slug: string) => {
        const res = await axios.get<ItemTypeDetail>('/api/item_type/' + slug)
        return res.data
    }

    const query = useQuery({
        queryKey: ['itemTypes', slug],
        queryFn: () => _get(slug ?? ''),
        enabled: !!slug,
    })
    return query
}

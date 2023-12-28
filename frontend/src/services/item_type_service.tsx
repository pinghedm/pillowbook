import { RJSFSchema } from '@rjsf/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

export const NON_FORM_FIELD_PROPERTIES = ['autocompleteFields', 'labelMap']
export const FORM_FIELD_TYPES = ['string', 'number'] as const
export interface ItemType {
    slug: string
    name: string
}

export interface ItemTypeDetail extends ItemType {
    item_schema: RJSFSchema
    name_schema: string
    auto_complete_config: {}
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

export const useUpdateItemType = () => {
    const _patch = async (slug: string, patch: Partial<ItemTypeDetail>) => {
        const res = await axios.patch<ItemTypeDetail>('/api/item_type/' + slug, patch)
        return res.data
    }

    const queryClient = useQueryClient()
    const mutation = useMutation({
        mutationFn: ({ slug, patch }: { slug: string; patch: Partial<ItemTypeDetail> }) =>
            _patch(slug, patch),
        onMutate: () => {
            queryClient.cancelQueries({ queryKey: ['itemTypes'] })
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['itemTypes'] })
        },
    })
    return mutation
}

export const useCreateItemType = () => {
    const _post = async (name: string, slug: string) => {
        const res = await axios.post<ItemType>('/api/item_type', { name, slug })
        return res.data
    }

    const queryClient = useQueryClient()
    const mutation = useMutation({
        mutationFn: ({ slug, name }: { slug: string; name: string }) => _post(slug, name),
        onMutate: () => {
            queryClient.cancelQueries({ queryKey: ['itemTypes'] })
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['itemTypes'] })
        },
    })
    return mutation
}

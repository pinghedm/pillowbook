import { RJSFSchema } from '@rjsf/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

export const NON_FORM_FIELD_PROPERTIES = ['autocompleteFields', 'labelMap']
export const FORM_FIELD_TYPES = ['string', 'number'] as const
export interface ItemType {
    slug: string
    name: string
    icon_url?: string
}

export interface ItemTypeDetail extends ItemType {
    item_schema: RJSFSchema
    name_schema: string
    auto_complete_config: Record<string, never>
    activity_schema: Record<string, any>
    parent_slug: string
    plugin_config: Record<string, any>
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

type UpdateItemTypeType = Partial<
    Omit<ItemTypeDetail, 'parent_slug'> & { parent_slug?: string | boolean }
>

export const useUpdateItemType = () => {
    const _patch = async (slug: string, patch: UpdateItemTypeType) => {
        const res = await axios.patch<ItemTypeDetail>('/api/item_type/' + slug, patch)
        return res.data
    }

    const queryClient = useQueryClient()
    const mutation = useMutation({
        mutationFn: ({ slug, patch }: { slug: string; patch: UpdateItemTypeType }) =>
            _patch(slug, patch),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['itemTypes'] })
            await queryClient.cancelQueries({ queryKey: ['autocomplete'] })
            await queryClient.cancelQueries({ queryKey: ['items'] })
            await queryClient.cancelQueries({ queryKey: ['activities'] })
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['itemTypes'] })
            queryClient.invalidateQueries({ queryKey: ['autocomplete'] })
            queryClient.invalidateQueries({ queryKey: ['items'] })
            queryClient.invalidateQueries({ queryKey: ['activities'] })
        },
    })
    return mutation
}

export const useCreateItemType = () => {
    const _post = async (name: string, parentSlug?: string, icon?: File) => {
        const form = new FormData()
        form.append('name', name)
        if (parentSlug) {
            form.append('parentSlug', parentSlug)
        }
        if (icon) {
            form.append('icon', icon)
        }
        const res = await axios.post<ItemType>('/api/item_type', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        return res.data
    }

    const queryClient = useQueryClient()
    const mutation = useMutation({
        mutationFn: ({
            name,
            parentSlug,
            icon,
        }: {
            name: string
            parentSlug?: string
            icon?: File
        }) => _post(name, parentSlug, icon),
        onMutate: () => {
            queryClient.cancelQueries({ queryKey: ['itemTypes'] })
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['itemTypes'] })
        },
    })
    return mutation
}

export const useDeleteItemType = () => {
    const _delete = async (slug: string) => {
        const res = await axios.delete<ItemType>('/api/item_type/' + slug)
        return res.data
    }

    const queryClient = useQueryClient()
    const mutation = useMutation({
        mutationFn: _delete,
        onMutate: () => {
            queryClient.cancelQueries({ queryKey: ['itemTypes'] })
            queryClient.cancelQueries({ queryKey: ['items'] })
            queryClient.cancelQueries({ queryKey: ['activities'] })
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['itemTypes'] })
            queryClient.invalidateQueries({ queryKey: ['items'] })
            queryClient.invalidateQueries({ queryKey: ['activities'] })
        },
    })
    return mutation
}

export const useItemTypeAutoCompleteSuggestions = (itemSlug?: string) => {
    const _get = async (itemSlug: string) => {
        const res = await axios.get<Record<string, { value: string | number; label: string }[]>>(
            '/api/get_autocomplete_suggestions/' + itemSlug,
        )
        return res.data
    }
    const query = useQuery({
        queryKey: ['autocomplete', itemSlug],
        queryFn: () => _get(itemSlug ?? ''),
        enabled: !!itemSlug,
    })
    return query
}

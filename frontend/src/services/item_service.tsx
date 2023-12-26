export interface Item {
    token: string
    rating: number
    notes: string
    item_type: string // slug
    info: Record<string, any>
}

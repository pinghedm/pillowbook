export const capitalizeWords = (s?: string) =>
    s
        ?.replace('_', ' ')
        ?.split(' ')
        ?.map(w => w[0].toUpperCase() + w.slice(1))
        ?.join(' ')

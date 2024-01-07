export const capitalizeWords = (s?: string) =>
    s
        ?.replace('_', ' ')
        ?.split(' ')
        ?.map(w => w[0].toUpperCase() + w.slice(1))
        ?.join(' ')

export const readCookie = (name?: string) => {
    if (!name) return null
    const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'))
    return match ? decodeURIComponent(match[3]) : null
}

// services/youthIdService.ts
export const generateYouthIdService = async (): Promise<string | null> => {
    try {
        const res = await fetch('/api/youth', { method: 'POST' })
        const data = await res.json()
        if (data.youthId) return data.youthId
        return null
    } catch (err) {
        console.error('Error generating YouthID:', err)
        return null
    }
}

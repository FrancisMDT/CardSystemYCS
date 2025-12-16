import { NextResponse } from 'next/server'
import pool  from '@/lib/db'
import { generateYouthId } from '@/lib/generateYouthId'

export async function POST(req: Request) {
    try {
        const body = await req.json()

        // Insert user data + generate YouthID safely
        const youthId = await generateYouthId()

        // Optionally insert other form data here
        await pool.query(
            'UPDATE tblyouth SET name = ?, age = ? WHERE YouthID = ?',
            [body.name, body.age, youthId]
        )

        return NextResponse.json({ youthId })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Failed to create YouthID' }, { status: 500 })
    }
}

// lib/generateYouthId.ts
import pool from './db'

export async function generateYouthId(): Promise<string> {
    const conn = await pool.getConnection()
    try {
        await conn.beginTransaction()

        // Get the last number and lock row
        const [rows]: any = await conn.query(`
            SELECT CAST(SUBSTRING(YouthID, 8, 6) AS UNSIGNED) AS num
            FROM tblyouth
            ORDER BY num DESC
            LIMIT 1
            FOR UPDATE
        `)

        const nextNum = (rows[0]?.num ?? 0) + 1
        const youthId = `LC-YMC-${String(nextNum).padStart(6, '0')}`

        await conn.commit()
        return youthId
    } catch (err) {
        await conn.rollback()
        throw err
    } finally {
        conn.release()
    }
}

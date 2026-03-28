import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono<{ Bindings: Env }>();
const ALLOWED_EMOJIS = ["😄", "😭", "😡", "😖", "😴", "🤩"];

// Enable CORS
app.use('*', async (c, next) => {
    const corsMiddlewareHandler = cors({
        origin: c.env.CORS_ORIGINS,
        credentials: true,
        allowHeaders: ['Content-Type'],
        maxAge: 3600,
        allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    });
    return corsMiddlewareHandler(c, next);
});

// POST `/api/reaction` - Add or Update a reaction
app.post("/api/reaction", async (c) => {
    try {
        const { date, emoji } = await c.req.json();

        // Check date matches YYYY-MM-DD format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return c.json({ error: 'Invalid date format (expected YYYY-MM-DD)' }, 400);
        }

        // Extract and validate year (2026 to current year)
        const year = parseInt(date.split('-')[0]);
        const currentYear = new Date().getFullYear();
        if (year < 2026 || year > currentYear) {
            console.warn(`⚠️ Blocked reaction for invalid year: ${year}`);
            return c.json({
                error: 'Invalid year',
                allowedRange: '2026 - current year',
                receivedYear: year
            }, 400);
        }

        // Validate date is TODAY (don't allow reactions to past and future days/years)
        const today = new Date();
        const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        if (date !== todayString) {
            console.warn(`⚠️ Blocked reaction for invalid date: ${date} (expected: ${todayString})`);
            return c.json({
                error: 'Reactions are only allowed for today',
                allowedDate: todayString
            }, 403); // 403 = Forbidden
        }

        if (!ALLOWED_EMOJIS.includes(emoji)) {
            return c.json({ error: 'Invalid emoji', allowed: ALLOWED_EMOJIS }, 400);
        }

        // Get or create anonymous token from cookie
        let token = c.req.header("Cookie")?.match(/mood_token=([^;]+)/)?.[1];
        if (!token) {
            token = crypto.randomUUID();
            c.header("Set-Cookie", `mood_token=${token}; Path=/; Max-Age=31536000; SameSite=Lax`);
        }

        // Hash the token for privacy (simple sha-256)
        const encoder = new TextEncoder();
        const data = encoder.encode(token);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const tokenHash = Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join("");

        // Get DB binding from Cloudflare env
        const db = c.env.DB;

        // Get `emoji_id` from emoji string
        const emojiRow = await db.prepare("SELECT id FROM emojis WHERE emoji = ?")
            .bind(emoji)
            .first();

        if (!emojiRow) {
            return c.json({ error: "Invalid emoji" }, 400);
        }

        // UPSERT: Insert new OR update existing if (date, token_hash) conflict
        // possible reason being user changed their reaction (maybe mood changed? ₍^.  ̫.^₎)
        const result = await db.prepare(`
            INSERT INTO reactions (date, emoji_id, token_hash)
            VALUES (?, ?, ?)
            ON CONFLICT(date, token_hash)
            DO UPDATE SET
                emoji_id = excluded.emoji_id,
                updated_at = CURRENT_TIMESTAMP
        `).bind(date, emojiRow.id, tokenHash).run();

        if (!result.success) {
            return c.json({ error: "Already reacted today!" }, 409);
        }

        return c.json({ success: true });
    } catch (error) {
        console.error("Reaction error:", error);
        return c.json({ error: "Server error" }, 500);
    }
});

// GET `/api/reactions?date=YYYY-MM-DD` - Get all reactions for a day
app.get("/api/reactions", async (c) => {
    try {
        const date = c.req.query("date");
        if (!date) {
            return c.json({ error: "Date parameter required" }, 400);
        }

        // Check date matches YYYY-MM-DD format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return c.json({ error: 'Invalid date format (expected YYYY-MM-DD)' }, 400);
        }

        // Extract and validate year (2026 to current year)
        const year = parseInt(date.split('-')[0]);
        const currentYear = new Date().getFullYear();
        if (year < 2026 || year > currentYear) {
            console.warn(`⚠️ Blocked fetch for invalid year: ${year}`);
            return c.json({
                error: 'Invalid year',
                allowedRange: '2026 - current year',
                receivedYear: year
            }, 400);
        }

        // Get current user's token
        const token = c.req.header('Cookie')?.match(/mood_token=([^;]+)/)?.[1];
        let currentTokenHash = null;

        if (token) {
            const encoder = new TextEncoder();
            const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(token));
            currentTokenHash = Array.from(new Uint8Array(hashBuffer))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        }

        const db = c.env.DB;

        // Get counter per emoji for this date
        // Also which reaction's belong to current user
        const results = await db.prepare(`
            SELECT
                e.emoji,
                COUNT(*) as count,
                CASE WHEN r.token_hash = ? THEN 1 ELSE 0 END as is_yours
            FROM reactions r
            JOIN emojis e ON r.emoji_id = e.id
            WHERE r.date = ?
            GROUP BY e.emoji, r.token_hash = ?
            ORDER BY count DESC
        `).bind(currentTokenHash, date, currentTokenHash).all();

        // Format response
        const reactions = (results.results || []).map(row => ({
            emoji: row.emoji as string,
            count: row.count as number,
            isYours: (row.is_yours as number) === 1
        }));

        return c.json({ date, reactions });

    } catch (error) {
        console.error("Fetch reactions error:", error);
        return c.json({ error: "Server error" }, 500);
    }
});

// DELETE `/api/reaction` - Remove a reaction
app.delete("/api/reaction", async (c) => {
    try {
        const { date } = await c.req.json();

        // Check date matches YYYY-MM-DD format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return c.json({ error: 'Invalid date format (expected YYYY-MM-DD)' }, 400);
        }

        //  Validate date is TODAY
        const today = new Date();
        const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        if (date !== todayString) {
            console.warn(`⚠️ Blocked deletion for invalid date: ${date} (expected: ${todayString})`);
            return c.json({
                error: 'Reactions can only be modified for today',
                allowedDate: todayString
            }, 403);
        }

        // Get token from cookie
        const token = c.req.header('Cookie')?.match(/mood_token=([^;]+)/)?.[1];
        if (!token) return c.json({ error: 'No token' }, 401);

        // Hash token
        const encoder = new TextEncoder();
        const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(token));
        const tokenHash = Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join("");

        const db = c.env.DB;

        // Delete the reaction
        await db.prepare(`
            DELETE FROM reactions
            WHERE date = ? AND token_hash = ?
        `).bind(date, tokenHash).run();

        return c.json({ success: true });
    } catch (error) {
        console.error("Delete reaction error:", error);
        return c.json({ error: "Server error" }, 500);
    }
});

// GET `/api/reactions/bulk?year=2026` - Fetch all reactions for entire year in ONE request!
app.get('/api/reactions/bulk', async (c) => {
    try {
        const year = c.req.query('year');
        if (!year) return c.json({ error: 'Year parameter required' }, 400);

        // Check year format (must be 4 digits)
        const yearRegex = /^\d{4}$/;
        if (!yearRegex.test(year)) {
            return c.json({ error: 'Invalid year format (expected YYYY)' }, 400);
        }

        // Check year range (2026 to current year)
        const yearNum = parseInt(year);
        const currentYear = new Date().getFullYear();
        if (yearNum < 2026 || yearNum > currentYear) {
            console.warn(`⚠️ Blocked bulk fetch for invalid year: ${yearNum}`);
            return c.json({
                error: 'Invalid year',
                allowedRange: '2026 - current year',
                receivedYear: yearNum
            }, 400);
        }


        const db = c.env.DB;

        // Fetch ALL reactions for the year in ONE query
        const results = await db.prepare(`
            SELECT
                r.date,
                e.emoji,
                COUNT(*) as count
            FROM reactions r
            JOIN emojis e ON r.emoji_id = e.id
            WHERE r.date LIKE ?
            GROUP BY r.date, e.emoji
            ORDER BY count DESC
        `).bind(`${year}%`).all();

        // Group by date
        const grouped: Record<string, { emoji: string; count: number }[]> = {};
        for (const row of results.results || []) {
            const date = row.date as string;
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push({
                emoji: row.emoji as string,
                count: row.count as number
            });
        }

        return c.json({ year, reactions: grouped });

    } catch (error) {
        console.error('Bulk fetch error:', error);
        return c.json({ error: 'Server error' }, 500);
    }
});


export default app;

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const apiKey = sqliteTable('api_key', {
	keyId: integer('key_id').primaryKey({ autoIncrement: true }),
	keyName: text('key_name').notNull(),
	apiKey: text('api_key').notNull(),
	userId: integer('user_id').notNull(),
	status: integer('status').default(1).notNull(),
	lastUsed: text('last_used'),
	createTime: text('create_time').default(sql`CURRENT_TIMESTAMP`),
	expireTime: text('expire_time'),
	isDel: integer('is_del').default(0).notNull()
});

export default apiKey;

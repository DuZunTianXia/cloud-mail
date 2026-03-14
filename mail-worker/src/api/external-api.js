import app from '../hono/hono';
import apiKeyService from '../service/api-key-service';
import emailService from '../service/email-service';
import result from '../model/result';
import BizError from '../error/biz-error';
import account from '../entity/account';
import orm from '../entity/orm';
import { eq, and, gte, desc, or, inArray, sql } from 'drizzle-orm';
import { isDel } from '../const/entity-const';
import { emailConst } from '../const/entity-const';
import email from '../entity/email';
import { t } from '../i18n/i18n';

app.get('/external/emails', async (c) => {
	const apiKeyValue = c.req.header('X-API-Key');

	await apiKeyService.verifyApiKey(c, apiKeyValue);

	const { email: targetEmail, limit, afterTime } = c.req.query();

	if (!targetEmail) {
		throw new BizError(t('emailRequired'));
	}

	// 查询邮箱是否已添加
	const accountRow = await orm(c).select().from(account).where(
		and(
			eq(account.email, targetEmail),
			eq(account.isDel, isDel.NORMAL)
		)
	).get();

	let conditions = [
		eq(email.isDel, isDel.NORMAL),
		eq(email.type, emailConst.type.RECEIVE),
		sql`${email.toEmail} COLLATE NOCASE = ${targetEmail}`
	];

	// 如果邮箱已添加，查询该账户的邮件（包括历史 NOONE 邮件已关联的）
	// 如果邮箱未添加，查询 NOONE 状态的邮件
	if (accountRow) {
		conditions.push(
			or(
				eq(email.accountId, accountRow.accountId),
				eq(email.status, emailConst.status.NOONE)
			)
		);
	} else {
		// 未添加的邮箱，只查询 NOONE 状态的邮件
		conditions.push(eq(email.status, emailConst.status.NOONE));
	}

	if (afterTime) {
		conditions.push(gte(email.createTime, afterTime));
	}

	const list = await orm(c).select().from(email)
		.where(and(...conditions))
		.orderBy(desc(email.emailId))
		.limit(parseInt(limit) || 10)
		.all();

	await emailService.emailAddAtt(c, list);

	return c.json(result.ok({ list }));
});

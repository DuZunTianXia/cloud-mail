import app from '../hono/hono';
import apiKeyService from '../service/api-key-service';
import emailService from '../service/email-service';
import result from '../model/result';
import BizError from '../error/biz-error';
import account from '../entity/account';
import orm from '../entity/orm';
import { eq, and, gte, desc } from 'drizzle-orm';
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

	const accountRow = await orm(c).select().from(account).where(
		and(
			eq(account.email, targetEmail),
			eq(account.isDel, isDel.NORMAL)
		)
	).get();

	if (!accountRow) {
		throw new BizError(t('accountNotFound'));
	}

	let conditions = [
		eq(email.userId, accountRow.userId),
		eq(email.accountId, accountRow.accountId),
		eq(email.isDel, isDel.NORMAL),
		eq(email.type, emailConst.type.RECEIVE)
	];

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

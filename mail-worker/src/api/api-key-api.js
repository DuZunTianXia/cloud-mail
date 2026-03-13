import app from '../hono/hono';
import apiKeyService from '../service/api-key-service';
import result from '../model/result';
import userContext from '../security/user-context';
import userService from '../service/user-service';
import BizError from '../error/biz-error';
import { t } from '../i18n/i18n';

app.post('/apiKey/generate', async (c) => {
	const userId = userContext.getUserId(c);
	
	const userRow = await userService.selectById(c, userId);
	if (c.env.admin !== userRow.email) {
		throw new BizError(t('unauthorized'), 403);
	}

	const apiKey = await apiKeyService.generate(c, await c.req.json(), userId);
	return c.json(result.ok(apiKey));
});

app.get('/apiKey/list', async (c) => {
	const userId = userContext.getUserId(c);
	
	const userRow = await userService.selectById(c, userId);
	if (c.env.admin !== userRow.email) {
		throw new BizError(t('unauthorized'), 403);
	}

	const list = await apiKeyService.list(c, userId);
	return c.json(result.ok(list));
});

app.delete('/apiKey/delete', async (c) => {
	const userId = userContext.getUserId(c);
	
	const userRow = await userService.selectById(c, userId);
	if (c.env.admin !== userRow.email) {
		throw new BizError(t('unauthorized'), 403);
	}

	await apiKeyService.delete(c, c.req.query(), userId);
	return c.json(result.ok());
});

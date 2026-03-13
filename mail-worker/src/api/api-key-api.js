import app from '../hono/hono';
import apiKeyService from '../service/api-key-service';
import result from '../model/result';
import userService from '../service/user-service';
import jwtUtils from '../utils/jwt-utils';
import BizError from '../error/biz-error';
import { t } from '../i18n/i18n';

app.post('/apiKey/generate', async (c) => {
	const jwt = c.req.header('Authorization')?.replace('Bearer ', '');
	if (!jwt) {
		throw new BizError(t('authExpired'), 401);
	}

	const verifyResult = await jwtUtils.verifyToken(c, jwt);
	if (!verifyResult) {
		throw new BizError(t('authExpired'), 401);
	}

	const { userId } = verifyResult;
	const userRow = await userService.selectById(c, userId);
	
	if (c.env.admin !== userRow.email) {
		throw new BizError(t('unauthorized'), 403);
	}

	const apiKey = await apiKeyService.generate(c, await c.req.json(), userId);
	return c.json(result.ok(apiKey));
});

app.get('/apiKey/list', async (c) => {
	const jwt = c.req.header('Authorization')?.replace('Bearer ', '');
	if (!jwt) {
		throw new BizError(t('authExpired'), 401);
	}

	const verifyResult = await jwtUtils.verifyToken(c, jwt);
	if (!verifyResult) {
		throw new BizError(t('authExpired'), 401);
	}

	const { userId } = verifyResult;
	const userRow = await userService.selectById(c, userId);
	
	if (c.env.admin !== userRow.email) {
		throw new BizError(t('unauthorized'), 403);
	}

	const list = await apiKeyService.list(c, userId);
	return c.json(result.ok(list));
});

app.delete('/apiKey/delete', async (c) => {
	const jwt = c.req.header('Authorization')?.replace('Bearer ', '');
	if (!jwt) {
		throw new BizError(t('authExpired'), 401);
	}

	const verifyResult = await jwtUtils.verifyToken(c, jwt);
	if (!verifyResult) {
		throw new BizError(t('authExpired'), 401);
	}

	const { userId } = verifyResult;
	const userRow = await userService.selectById(c, userId);
	
	if (c.env.admin !== userRow.email) {
		throw new BizError(t('unauthorized'), 403);
	}

	await apiKeyService.delete(c, c.req.query(), userId);
	return c.json(result.ok());
});

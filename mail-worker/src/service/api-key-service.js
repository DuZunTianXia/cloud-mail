import orm from '../entity/orm';
import { apiKey } from '../entity/api-key';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { isDel } from '../const/entity-const';
import BizError from '../error/biz-error';
import dayjs from 'dayjs';
import { t } from '../i18n/i18n';
import userContext from '../security/user-context';
import cryptoUtils from '../utils/crypto-utils';

const apiKeyService = {

	async generate(c, params, userId) {
		const { keyName, expireDays } = params;

		if (!keyName) {
			throw new BizError(t('apiKeyNameRequired'));
		}

		const apiKeyValue = await cryptoUtils.generateApiKey();

		let expireTime = null;
		if (expireDays && expireDays > 0) {
			expireTime = dayjs().add(expireDays, 'day').format('YYYY-MM-DD HH:mm:ss');
		}

		await orm(c).insert(apiKey).values({
			keyName,
			apiKey: apiKeyValue,
			userId,
			expireTime
		});

		return { apiKey: apiKeyValue };
	},

	async list(c, userId) {
		const list = await orm(c).select().from(apiKey).where(
			and(
				eq(apiKey.userId, userId),
				eq(apiKey.isDel, isDel.NORMAL)
			)
		).orderBy(desc(apiKey.createTime));

		return list;
	},

	async delete(c, params, userId) {
		const { keyId } = params;

		await orm(c).update(apiKey).set({ isDel: isDel.DELETE }).where(
			and(
				eq(apiKey.keyId, keyId),
				eq(apiKey.userId, userId)
			)
		).run();
	},

	async verifyApiKey(c, apiKeyValue) {
		if (!apiKeyValue) {
			throw new BizError(t('apiKeyRequired'), 401);
		}

		const keyRow = await orm(c).select().from(apiKey).where(
			and(
				eq(apiKey.apiKey, apiKeyValue),
				eq(apiKey.isDel, isDel.NORMAL)
			)
		).get();

		if (!keyRow) {
			throw new BizError(t('apiKeyInvalid'), 401);
		}

		if (keyRow.status !== 1) {
			throw new BizError(t('ApiKeyDisabled'), 401);
		}

		if (keyRow.expireTime) {
			const now = dayjs();
			const expire = dayjs(keyRow.expireTime);
			if (now.isAfter(expire)) {
				throw new BizError(t('apiKeyExpired'), 401);
			}
		}

		await orm(c).update(apiKey).set({
			lastUsed: dayjs().format('YYYY-MM-DD HH:mm:ss')
		}).where(eq(apiKey.keyId, keyRow.keyId)).run();

		return keyRow;
	}
};

export default apiKeyService;

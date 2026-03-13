<template>
  <div class="api-key">
    <div class="header-actions">
      <Icon class="icon" icon="ion:add-outline" width="23" height="23" @click="openAdd"/>
      <Icon class="icon" icon="ion:reload" width="18" height="18" @click="refresh"/>
    </div>

    <el-scrollbar class="scrollbar">
      <div class="loading" :class="apiKeyLoading ? 'loading-show' : 'loading-hide'" :style="apiKeyFirst ? 'background: transparent' : ''">
        <loading/>
      </div>
      
      <!-- API使用指南 -->
      <div class="usage-guide">
        <el-collapse v-model="activeGuide">
          <el-collapse-item :title="$t('apiUsageGuide')" name="guide">
            <div class="guide-content">
              <!-- 基本信息 -->
              <div class="guide-section">
                <h4>{{ $t('apiEndpoint') }}</h4>
                <div class="code-block">
                  <span class="method-badge method-get">GET</span>
                  <code>{{ apiBase }}/api/external/emails</code>
                </div>
              </div>

              <div class="guide-section">
                <h4>{{ $t('apiHeaders') }}</h4>
                <div class="code-block">
                  <code>X-API-Key: &lt;{{ $t('apiKey') }}&gt;</code>
                </div>
                <p class="desc">{{ $t('apiKeyHeaderDesc') }}</p>
              </div>

              <!-- 请求参数 -->
              <div class="guide-section">
                <h4>{{ $t('apiParams') }}</h4>
                <el-table :data="paramsData" stripe style="width: 100%" size="small">
                  <el-table-column prop="name" :label="$t('name')" width="120" />
                  <el-table-column prop="type" :label="$t('type')" width="80" />
                  <el-table-column prop="required" :label="$t('apiRequired')" width="80" />
                  <el-table-column prop="desc" :label="$t('description')" />
                </el-table>
              </div>

              <!-- cURL示例 -->
              <div class="guide-section">
                <h4>{{ $t('curlExample') }}</h4>
                <pre class="code-example"><code>curl -H "X-API-Key: api_abc123def456..." \
  "{{ apiBase }}/api/external/emails?email=user@example.com&limit=20"</code></pre>
              </div>

              <!-- Python示例 -->
              <div class="guide-section">
                <h4>{{ $t('pythonExample') }}</h4>
                <pre class="code-example"><code>import requests

headers = {"X-API-Key": "api_abc123def456..."}
params = {"email": "user@example.com", "limit": 20}

response = requests.get(
    "{{ apiBase }}/api/external/emails",
    headers=headers,
    params=params
)
data = response.json()
print(data)</code></pre>
              </div>

              <!-- JavaScript示例 -->
              <div class="guide-section">
                <h4>{{ $t('jsExample') }}</h4>
                <pre class="code-example"><code>const API_BASE = "{{ apiBase }}";
const API_KEY = "api_abc123def456...";

async function getEmails() {
  const response = await fetch(
    `${API_BASE}/api/external/emails?email=user@example.com&limit=20`,
    { headers: { "X-API-Key": API_KEY } }
  );
  const data = await response.json();
  console.log(data);
}
getEmails();</code></pre>
              </div>

              <!-- 响应示例 -->
              <div class="guide-section">
                <h4>{{ $t('apiResponse') }}</h4>
                <pre class="code-example"><code>{
  "code": 0,
  "data": {
    "list": [
      {
        "emailId": 123,
        "sendEmail": "sender@example.com",
        "name": "Sender Name",
        "subject": "Email Subject",
        "text": "Plain text content",
        "content": "&lt;html&gt;Email HTML content&lt;/html&gt;",
        "createTime": "2026-03-13 10:30:00"
      }
    ]
  },
  "message": "success"
}</code></pre>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>

      <div class="key-box">
        <div class="key-item" v-for="item in apiKeyData">
          <div class="key-info">
            <div class="info-left">
              <div class="info-left-item">
                <span class="key-name">{{ item.keyName }}</span>
              </div>
              <div class="info-left-item">
                <span class="label">{{ $t('apiKey') }}：</span>
                <span class="key" @click="copyApiKey(item.apiKey)">{{ item.apiKey }}</span>
              </div>
              <div class="info-left-item">
                <span class="label">{{ $t('createTime') }}：</span>
                <span>{{ formatTime(item.createTime) }}</span>
              </div>
              <div class="info-left-item">
                <span class="label">{{ $t('expireTime') }}：</span>
                <span v-if="item.expireTime">{{ formatTime(item.expireTime) }}</span>
                <el-tag v-else type="success">{{ $t('neverExpire') }}</el-tag>
              </div>
              <div class="info-left-item">
                <span class="label">{{ $t('lastUsed') }}：</span>
                <span v-if="item.lastUsed">{{ formatTime(item.lastUsed) }}</span>
                <span v-else class="text-gray">{{ $t('neverUsed') }}</span>
              </div>
              <div class="info-left-item">
                <span class="label">{{ $t('status') }}：</span>
                <el-tag :type="item.status === 1 ? 'success' : 'danger'">
                  {{ item.status === 1 ? $t('enabled') : $t('disabled') }}
                </el-tag>
              </div>
            </div>
            <div class="info-right">
              <el-dropdown class="setting">
                <Icon icon="fluent:settings-24-filled" width="21" height="21" color="#909399"/>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="copyApiKey(item.apiKey)">{{ $t('copy') }}</el-dropdown-item>
                    <el-dropdown-item @click="deleteApiKey(item)">{{ $t('delete') }}</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </div>
      </div>
      <div class="empty" v-if="apiKeyData.length === 0">
        <el-empty v-if="!apiKeyFirst" :image-size="isMobile ? 120 : null" :description="$t('noApiKeyFound')"/>
      </div>
    </el-scrollbar>

    <el-dialog v-model="showAdd" :title="$t('addApiKey')">
      <div class="container">
        <el-input v-model="addForm.keyName" :placeholder="$t('apiKeyName')"/>
        <el-input-number v-model="addForm.expireDays" :min="0" :max="3650" :placeholder="$t('expireDaysDesc')"/>
        <div class="expire-tip">{{ $t('expireDaysTip') }}</div>
        <el-button class="btn" type="primary" @click="submit" :loading="addLoading">
          {{ $t('generate') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import {defineOptions, reactive, ref, computed} from "vue"
import {Icon} from "@iconify/vue";
import loading from "@/components/loading/index.vue";
import {apiKeyList, apiKeyAdd, apiKeyDelete} from "@/request/api-key.js";
import {useSettingStore} from "@/store/setting.js";
import dayjs from "dayjs";
import {tzDayjs} from "@/utils/day.js";
import {useI18n} from "vue-i18n";

defineOptions({
  name: 'api-key'
})

const settingStore = useSettingStore();
const {t} = useI18n();

const addLoading = ref(false)
const showAdd = ref(false)
const apiKeyLoading = ref(true)
const apiKeyFirst = ref(true)
const isMobile = window.innerWidth < 1025
const activeGuide = ref('')

const apiBase = computed(() => window.location.origin)

const addForm = reactive({
  keyName: '',
  expireDays: 30
})

const apiKeyData = reactive([])

const paramsData = computed(() => [
  { name: 'email', type: 'string', required: t('apiRequired'), desc: t('emailParamDesc') },
  { name: 'limit', type: 'number', required: t('apiOptional'), desc: t('limitParamDesc') },
  { name: 'afterTime', type: 'string', required: t('apiOptional'), desc: t('afterTimeParamDesc') }
])

getList(true)

function refresh() {
  getList(true)
}

function getList(showLoading = false) {
  if (showLoading) {
    apiKeyLoading.value = true
  }
  apiKeyList().then(list => {
    apiKeyData.length = 0
    apiKeyData.push(...list)
    apiKeyLoading.value = false
    setTimeout(() => {
      apiKeyFirst.value = false
    }, 200)
  })
}

async function copyApiKey(apiKey) {
  try {
    await navigator.clipboard.writeText(apiKey);
    ElMessage({
      message: t('copySuccessMsg'),
      type: 'success',
      plain: true,
    })
  } catch (err) {
    console.error('复制失败:', err);
    ElMessage({
      message: '复制失败',
      type: 'error',
      plain: true,
    })
  }
}

function submit() {
  if (!addForm.keyName) {
    ElMessage({
      message: t('apiKeyNameRequired'),
      type: "error",
      plain: true
    })
    return
  }

  addLoading.value = true
  apiKeyAdd(addForm).then(() => {
    showAdd.value = false
    resetForm()
    ElMessage({
      message: t('generateSuccessMsg'),
      type: "success",
      plain: true
    })
    getList()
  }).finally(() => {
    addLoading.value = false
  })
}

function deleteApiKey(apiKey) {
  ElMessageBox.confirm(t('delConfirm', {msg: apiKey.apiKey}), {
    confirmButtonText: t('confirm'),
    cancelButtonText: t('cancel'),
    type: 'warning'
  }).then(() => {
    apiKeyDelete(apiKey.keyId).then(() => {
      getList()
      ElMessage({
        message: t('delSuccessMsg'),
        type: "success",
        plain: true
      })
    })
  });
}

function resetForm() {
  addForm.keyName = ''
  addForm.expireDays = 30
}

function openAdd() {
  showAdd.value = true
}

function formatTime(time) {
  const dateTime = tzDayjs(time);
  const currentYear = dayjs().year();
  const timeYear = dateTime.year();

  if (settingStore.lang === 'en') {
    return timeYear === currentYear
        ? dateTime.format('MMM D, HH:mm')
        : dateTime.format('MMM D, YYYY HH:mm');
  } else {
    return timeYear === currentYear
        ? dateTime.format('M月D日 HH:mm')
        : dateTime.format('YYYY年M月D日 HH:mm');
  }
}
</script>

<style scoped lang="scss">
.api-key {
  height: 100%;
  overflow: hidden;
}

.scrollbar {
  height: calc(100% - 48px);
  position: relative;
  background: var(--extra-light-fill);
  @media (max-width: 372px) {
    height: calc(100% - 85px);
  }

  .usage-guide {
    margin: 15px;
    background: var(--el-bg-color);
    border-radius: 8px;
    border: 1px solid var(--el-border-color);
    overflow: hidden;

    .guide-content {
      padding: 20px;
    }

    .guide-section {
      margin-bottom: 25px;

      &:last-child {
        margin-bottom: 0;
      }

      h4 {
        margin: 0 0 12px 0;
        font-size: 15px;
        font-weight: 600;
        color: #303133;
      }

      .code-block {
        background: #f5f7fa;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        padding: 12px;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        overflow-x: auto;

        .method-badge {
          flex-shrink: 0;
          padding: 2px 8px;
          border-radius: 3px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          color: white;

          &.method-get {
            background: #67c23a;
          }
        }

        code {
          font-family: 'Courier New', monospace;
          font-size: 13px;
          color: #303133;
          word-break: break-all;
        }
      }

      .code-example {
        background: #282c34;
        border-radius: 6px;
        padding: 15px;
        margin: 0;
        overflow-x: auto;

        code {
          font-family: 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.6;
          color: #abb2bf;
          white-space: pre;
        }
      }

      .desc {
        margin: 8px 0 0 0;
        font-size: 13px;
        color: #909399;
        line-height: 1.5;
      }
    }
  }

  .key-box {
    padding: 0 15px 25px 15px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 15px;

    .key-item {
      background: var(--el-bg-color);
      border-radius: 8px;
      border: 1px solid var(--el-border-color);
      transition: all 200ms;
      padding: 15px;

      .key-info {
        display: flex;

        .info-left {
          flex: 1;
          min-width: 0;

          .info-left-item {
            display: flex;
            padding-top: 5px;
            font-size: 14px;

            .label {
              color: #909399;
              min-width: 70px;
            }

            .key-name {
              font-weight: bold;
              font-size: 16px;
            }

            .key {
              font-family: 'Courier New', monospace;
              font-weight: bold;
              font-size: 14px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              cursor: pointer;
              color: var(--el-color-primary);
            }

            .text-gray {
              color: #909399;
            }
          }

          .info-left-item:first-child {
            padding-top: 0;
          }
        }

        .info-right {
          display: flex;
          flex-direction: column;
          padding-top: 2px;
          gap: 5px;
        }
      }
    }
  }
}

.empty {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.loading {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--loadding-background);
  z-index: 2;
}

.loading-show {
  transition: all 200ms ease 200ms;
  opacity: 1;
}

.loading-hide {
  pointer-events: none;
  transition: var(--loading-hide-transition);
  opacity: 0;
}

.container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;

  .expire-tip {
    font-size: 12px;
    color: #909399;
  }
}

::deep(.el-dialog) {
  width: 450px !important;
  @media (max-width: 490px) {
    width: calc(100% - 40px) !important;
    margin-right: 20px !important;
    margin-left: 20px !important;
  }
}

.setting {
  cursor: pointer;
}

.header-actions {
  padding: 9px 15px;
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  align-items: center;
  box-shadow: inset 0 -1px 0 0 rgba(100, 121, 143, 0.12);
  font-size: 18px;
  @media (max-width: 767px) {
    gap: 15px;
  }

  .icon {
    cursor: pointer;
  }
}
</style>

<script setup lang="ts">
import { computed, getCurrentInstance, type Component } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import { defineLayer, LayerTemplate } from 'vue-layerx'
import { useDialog } from '../../core/layers'
import { getUser, type UserId } from './users'

const props = withDefaults(
  defineProps<{
    userId: UserId
    /** 0 = 页内；每再开一层 +1，仅用于 demo 展示 */
    depth?: number
  }>(),
  { depth: 0 },
)

const user = computed(() => getUser(props.userId))
const contextLabel = computed(() =>
  props.depth === 0 ? '页内内容' : `弹层 depth=${props.depth}`,
)

const emit = defineEmits<{
  close: []
}>()

const layer = defineLayer(() => ({
  props: {
    title: `${user.value.name} · 用户详情`,
    width: '420px',
    draggable: true,
  },
  content: { closeOn: ['close'] },
}))

/**
 * 避免 Content.vue import 自身造成循环依赖：
 * 用当前组件定义再 useDialog，每次 setup 得到独立 instance，可继续叠层。
 */
const Self = getCurrentInstance()!.type as Component
const friendDialog = useDialog(Self)

function openFriend(friendId: UserId) {
  friendDialog.open({
    props: {
      userId: friendId,
      depth: props.depth + 1,
    },
  })
}
</script>

<template>
  <div class="user-detail">
    <div class="user-detail__head">
      <strong>{{ user.name }}</strong>
      <ElTag size="small" type="info">{{ user.role }}</ElTag>
      <ElTag size="small" :type="depth === 0 ? 'success' : 'warning'" effect="plain">
        {{ contextLabel }}
      </ElTag>
      <ElTag v-if="layer.exists" size="small" type="primary" effect="plain">
        layer.exists
      </ElTag>
    </div>

    <p class="user-detail__bio">{{ user.bio }}</p>

    <p class="user-detail__friends-label">好友</p>
    <ul class="user-detail__friends">
      <li v-for="friendId in user.friends" :key="friendId">
        <ElButton link type="primary" @click="openFriend(friendId)">
          {{ getUser(friendId).name }}
          <span class="user-detail__friend-role">· {{ getUser(friendId).role }}</span>
        </ElButton>
      </li>
    </ul>
  </div>

  <LayerTemplate v-if="layer.exists" :to="layer" name="footer">
    <ElButton @click="emit('close')">关闭本层</ElButton>
  </LayerTemplate>
</template>

<style scoped>
.user-detail {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.user-detail__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.user-detail__bio {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--el-text-color-regular);
}

.user-detail__friends-label {
  margin: 4px 0 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}

.user-detail__friends {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.user-detail__friend-role {
  color: var(--el-text-color-secondary);
  font-weight: 400;
}
</style>

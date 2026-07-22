<script setup lang="ts">
import { computed, getCurrentInstance, type Component } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import { defineLayer, LayerTemplate } from 'vue-layerx'
import { useDialog } from '../shared/layers'
import { getUser, type UserId } from './users'

const props = withDefaults(
  defineProps<{
    userId: UserId
    /** 0 = 页内；每再开一层 +1 */
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

/** 用当前组件定义再 useDialog，避开自引用循环依赖；每层独立 instance */
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
  <div class="detail">
    <div class="detail__head">
      <strong>{{ user.name }}</strong>
      <ElTag size="small" type="info">{{ user.role }}</ElTag>
      <ElTag size="small" :type="depth === 0 ? 'success' : 'warning'" effect="plain">
        {{ contextLabel }}
      </ElTag>
    </div>

    <p class="detail__bio">{{ user.bio }}</p>

    <p class="detail__label">好友</p>
    <ul class="detail__friends">
      <li v-for="friendId in user.friends" :key="friendId">
        <ElButton link type="primary" @click="openFriend(friendId)">
          {{ getUser(friendId).name }}
        </ElButton>
      </li>
    </ul>
  </div>

  <LayerTemplate v-if="layer.exists" :to="layer" name="footer">
    <ElButton @click="emit('close')">关闭本层</ElButton>
  </LayerTemplate>
</template>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.detail__bio {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--el-text-color-regular);
}

.detail__label {
  margin: 4px 0 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}

.detail__friends {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}
</style>

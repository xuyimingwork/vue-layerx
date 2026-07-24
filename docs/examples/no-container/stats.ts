import { ref } from 'vue'

/** Demo 观测：内容 setup 次数（每次挂载 +1） */
export const definePathSetupCount = ref(0)
export const factoryPathSetupCount = ref(0)

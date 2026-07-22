<script setup>
import DemoBlock from '../../.vitepress/theme/components/DemoBlock.vue'
import Demo from '../../examples/confirm/App.vue'
import AppSource from '../../examples/confirm/App.vue?raw'
import PickerSource from '../../examples/confirm/MemberPicker.vue?raw'
</script>

# 获取弹层结果

需要从**复杂内容**拿回数据时（例如成员列表：页内可勾选，也可弹层多选），用 `confirm()` 等待关闭并拿到结果——不是 `ElMessageBox` 那种一句话确认。

```ts
try {
  const result = await picker.confirm({ props: { modelValue: ids } })
  // result.data 为 confirm 事件的第一个参数（此处为选中成员）
} catch (e) {
  if (e instanceof LayerConfirmError) {
    // 取消、关闭，或 busy
  }
}
```

内容里把「确定」标成 `closeOn` 的确认路径（`confirmed: true`）。

<DemoBlock
  :demo="Demo"
  :files="[
    { name: 'App.vue', code: AppSource },
    { name: 'MemberPicker.vue', code: PickerSource },
  ]"
/>

API 与错误码见[实例的更多能力](/guide/instance)与 [LayerInstance](/api/layer-instance)。

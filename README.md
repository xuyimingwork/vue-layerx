# vue-layerx

Vue3 命令式弹窗工具库，告别冗余模板，随用随开

```ts
import { createLayer } from 'vue-layerx'
import { ElDialog } from 'element-plus'
import UserForm from './UserForm.vue'

const useDialog = createLayer(ElDialog);
const dialog = useDialog(UserForm);
dialog.open({ props: { id: '1' } })
```

## 安装

```bash
pnpm add vue-layerx
# or
npm install vue-layerx
```



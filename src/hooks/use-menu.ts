import { Input, MessagePlugin } from 'tdesign-vue-next'

export const clearLink = (onConfirm: (link: string) => Promise<void>) => {
  const value = ref('')
  const dialog = DialogPlugin.confirm({
    header: '请输入要清除的链接',
    confirmBtn: '清除',
    placement: 'center',
    body: () => {
      return h(Input, {
        style: { marginTop: '16px' },
        placeholder: '例如：https://example.com/path/link',
        onChange(val) {
          value.value = val.toString()
        },
      })
    },
    onClosed: () => {
      dialog.destroy()
    },
    onConfirm: async () => {
      if (!value.value) {
        MessagePlugin.error('请输入要清除的链接')
        return
      }
      try {
        await onConfirm(
          value.value.startsWith('http')
            ? value.value.replace(window.location.origin, '')
            : value.value
        )
        MessagePlugin.success('清除成功')
        dialog.destroy()
      } catch (e) {
        MessagePlugin.error('清除失败，链接不存在')
      }
    },
  })
}

<script setup lang="ts">
import { useClickListener } from '@/hooks/use-click-listener';
import { useStorage } from './hooks/use-storage';
import { ChevronRightIcon } from 'tdesign-icons-vue-next'
import { DialogPlugin, Input, MessagePlugin, Textarea } from 'tdesign-vue-next';

const CLICKED_LINK_STYLE = {
  color: 'rgba(180, 180, 180, 0.5)',
  textDecoration: 'none',
}

const storage = useStorage()
// 监听点击事件
useClickListener((e,) => {
  storage.saveLink(e.pathname)
  Object.assign(e.ref.style, CLICKED_LINK_STYLE);
})

// 初始化
const initLinks = () => {
  const clickedLinks = storage.getCurrentDomainLinks();
  const links = document.querySelectorAll("a");
  links.forEach((link) => {
    if (clickedLinks[link.pathname]) {
      Object.assign(link.style, CLICKED_LINK_STYLE);
    } else {
      if (link.style.color === CLICKED_LINK_STYLE.color) {
        link.style.color = ''
        link.style.textDecoration = ''
      }
    }
  });
}
initLinks()

const visible = ref(false)
GM_registerMenuCommand(
  "导入导出功能",
  () => {
    visible.value = true
  }
);

const menus = [{
  title: '导入导出',
  items: [{
    title: '导入数据',
    action: () => {
      const value = ref('')
      const dialog = DialogPlugin.confirm({
        header: '请输入要导入的链接',
        confirmBtn: '导入',
        placement: 'center',
        body: () => {
          return h(Textarea, {
            style: { marginTop: '16px' },
            placeholder: `例如：
{
  "domains": [
    "https://example.com"
  ],
  "data": {
    "https://example.com": {
      "/path/link": { "timestamp": 1761747737985 }
    }
  }
}`,
            autosize: {
              minRows: 10,
              maxRows: 20,
            },
            onChange(val) {
              value.value = val.toString()
            }
          })
        },
        onClosed: () => {
          dialog.destroy()
        },
        onConfirm: () => {
          if (!value.value) {
            MessagePlugin.error('导入数据不能为空')
            return
          }
          let data
          try {
            data = JSON.parse(value.value)
          }
          catch (e) {
            MessagePlugin.error('导入数据格式错误')
            return
          }
          if (!data.data || typeof data.data !== 'object') {
            MessagePlugin.error('导入数据格式错误')
            return
          }
          const allDomains = storage.getAllDomains()
          Object.keys(data.data).forEach((domain) => {
            const linkMap = data.data[domain]
            if (typeof linkMap === 'object') {
              const src = storage.getLinksByDomain(domain)
              Object.assign(src, linkMap)
              storage.setLinksByDomain(domain, src)
              if (!allDomains.includes(domain)) {
                allDomains.push(domain)
                storage.updateDomains(allDomains)
              }
            }
          })
          initLinks()
          MessagePlugin.success('导入成功')
          dialog.destroy()
          visible.value = false
        }
      })
    }
  }, {
    title: '导出当前网站数据',
    action: () => {
      const clickedLinks = storage.getCurrentDomainLinks();
      const exportData = {
        timestamp: Date.now(),
        domains: [window.location.origin],
        data: { [window.location.origin]: clickedLinks },
      };
      const jsonString = JSON.stringify(exportData, null, 2);
      GM_setClipboard(jsonString, "text");
      MessagePlugin.success('导出成功，已将当前数据复制到剪贴板')
    }
  },
  {
    title: '导出所有网站数据',
    action: () => {
      const allData = storage.getAllDomainsLinks();
      const exportData = {
        timestamp: Date.now(),
        domains: Object.keys(allData),
        data: allData,
      };
      const jsonString = JSON.stringify(exportData, null, 2);
      GM_setClipboard(jsonString, "text");
      MessagePlugin.success('导出成功，已将所有数据复制到剪贴板')
    }
  }
  ]
}, {
  title: '清除数据',
  items: [{
    title: '清除指定链接',
    action: () => {
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
            }
          })
        },
        onClosed: () => {
          dialog.destroy()
        },
        onConfirm: () => {
          if (!value.value) {
            MessagePlugin.error('请输入要清除的链接')
            return
          }
          if (storage.removeLink(value.value.startsWith('http') ? value.value.replace(window.location.origin, '') : value.value)) {
            MessagePlugin.success('清除成功')
            dialog.destroy()
            initLinks()
          } else {
            MessagePlugin.error('清除失败，链接不存在')
          }
        }
      })
    }
  }, {
    title: '清除当前网站数据',
    action: () => {
      const dialog = DialogPlugin.confirm({
        header: '提示',
        body: '请确认是否清除当前网站的所有点击数据',
        confirmBtn: '清除',
        placement: 'center',
        onConfirm: () => {
          storage.clearCurrentDomainData()
          MessagePlugin.success('清除当前网站点击数据成功')
          dialog.destroy()
          initLinks()
        },
        onClosed: () => dialog.destroy()
      })
    }
  },
  {
    title: '清除所有网站数据',
    action: () => {
      const dialog = DialogPlugin.confirm({
        header: '提示',
        body: '请确认是否清除所有网站的所有点击数据',
        confirmBtn: '清除',
        placement: 'center',
        onConfirm: () => {
          storage.clearAllDomainsData()
          MessagePlugin.success('清除所有网站点击数据成功')
          dialog.destroy()
          initLinks()
        },
        onClosed: () => dialog.destroy()
      })
    }
  }
  ]
}]
</script>

<template>
  <div>
    <t-drawer v-model:visible="visible" attach="body" header="链接点击记录器" :footer="false" :closeBtn="true" :lazy="true"
      :z-index="2499">
      <template v-for="(menu, idx) in menus">
        <t-typography-title level="h6" class="group-title" :style="{ 'margin-top': idx === 0 ? '0' : '40px' }">{{
          menu.title }}</t-typography-title>
        <t-list split style="margin-bottom: 40px;">
          <t-list-item v-for="item in menu.items" :key="item.title" @click="item.action">
            <div class="list-item">
              <span>{{ item.title }}</span>
              <chevron-right-icon :stroke-width="2" />
            </div>
          </t-list-item>
        </t-list>
      </template>
    </t-drawer>
  </div>
</template>

<style scoped>
.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  user-select: none;
}

.t-list-item {
  cursor: pointer;
}

.t-list-item:hover {
  background-color: var(--td-bg-color-container-hover);
}

.group-title {
  margin-top: 0 !important;
}
</style>

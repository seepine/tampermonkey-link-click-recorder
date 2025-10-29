type LinkEvent = {
  /**
   * https://example.com
   */
  origin: string
  /**
   * /api/123
   */
  pathname: string
  /**
   * https://example.com/api/123
   */
  url: string
  /**
   * 触发方式
   */
  target: 'click' | 'contextmenu'
  /**
   * 触发元素
   */
  ref: HTMLAnchorElement
}
export const useClickListener = (callback: (ev: LinkEvent) => void) => {
  const clickEvent = (target: any, from: 'click' | 'contextmenu') => {
    if (!target || target.closest === undefined) {
      return
    }
    const link = target.closest('a')
    if (link && link.href) {
      callback({
        ref: link,
        origin: link.origin,
        pathname: link.pathname,
        url: `${link.origin}${link.pathname}`,
        target: from,
      })
    }
  }

  const clickListener = (e: MouseEvent) => {
    clickEvent(e.target, 'click')
  }
  const contextmenuListener = (e: MouseEvent) => {
    clickEvent(e.target, 'contextmenu')
  }

  onMounted(() => {
    document.addEventListener('click', clickListener)
    document.addEventListener('contextmenu', contextmenuListener)
  })
  onUnmounted(() => {
    document.removeEventListener('click', clickListener)
    document.removeEventListener('contextmenu', contextmenuListener)
  })
}

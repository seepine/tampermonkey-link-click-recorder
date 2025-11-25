const RECORD_DOMAINS_KEY = 'record_domains'

export const useRecordStatus = () => {
  /**
   * 是否需要记录点击状态
   */
  const needRecord = ref(false)

  /**
   * 重置记录状态
   */
  const resetRecordStatus = () => {
    const recordDomains = GM_getValue<string[]>(RECORD_DOMAINS_KEY, [])
    const currentDomain = window.location.origin
    needRecord.value = recordDomains.includes(currentDomain)
  }
  resetRecordStatus()
  /**
   * 切换记录状态
   */
  const switchRecordStatus = () => {
    const recordDomains = GM_getValue<string[]>(RECORD_DOMAINS_KEY, [])
    const currentDomain = window.location.origin
    const idx = recordDomains.indexOf(currentDomain)
    if (idx > -1) {
      recordDomains.splice(idx, 1)
    } else {
      recordDomains.push(currentDomain)
    }
    GM_setValue(RECORD_DOMAINS_KEY, recordDomains)
    resetRecordStatus()
  }

  return {
    needRecord,
    switchRecordStatus,
  }
}

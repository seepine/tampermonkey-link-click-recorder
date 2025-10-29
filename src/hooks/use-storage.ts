// 类型定义
type ClickedLinkRecord = { timestamp: number }
type LinksMap = Record<string, ClickedLinkRecord>
type AllDomainsLinksMap = Record<string, LinksMap>
// 配置
const CLICKED_LINKS_PREFIX = 'clicked_links_'
const DOMAINS_KEY = 'clicked_links_domains'

// 转为 hook/composable 方式
export const useStorage = () => {
  // 获取当前域名的存储键
  const DomainKey = CLICKED_LINKS_PREFIX + window.location.origin

  // 获取或更新域名列表
  const updateDomainsList = (): string[] => {
    const domains = GM_getValue<string[]>(DOMAINS_KEY, [])
    const currentDomain = window.location.origin

    if (!domains.includes(currentDomain)) {
      domains.push(currentDomain)
      GM_setValue(DOMAINS_KEY, domains)
    }

    return domains
  }

  const updateDomains = (domains: string[]) => {
    GM_setValue(DOMAINS_KEY, domains)
  }

  // 获取所有域名
  const getAllDomains = (): string[] => {
    return GM_getValue<string[]>(DOMAINS_KEY, [])
  }

  // 获取当前网站的点击记录
  const getCurrentDomainLinks = (): LinksMap => {
    return GM_getValue<LinksMap>(DomainKey, {})
  }

  const getLinksByDomain = (domain: string): LinksMap => {
    const domainKey = CLICKED_LINKS_PREFIX + domain
    return GM_getValue<LinksMap>(domainKey, {})
  }

  const setLinksByDomain = (domain: string, data: LinksMap) => {
    GM_setValue(CLICKED_LINKS_PREFIX + domain, data)
  }

  // 获取所有域名的点击记录
  const getAllDomainsLinks = (): AllDomainsLinksMap => {
    const domains = getAllDomains()
    const allData: AllDomainsLinksMap = {}

    domains.forEach(domain => {
      const domainKey = CLICKED_LINKS_PREFIX + domain
      const domainData = GM_getValue<LinksMap>(domainKey, {})
      allData[domain] = domainData
    })

    return allData
  }

  // 保存点击记录
  const saveLink = (url: string) => {
    // 更新域名列表
    updateDomainsList()

    // 保存点击记录，只保存时间戳，不保存文本内容
    const clickedLinks = getCurrentDomainLinks()
    clickedLinks[url] = {
      timestamp: Date.now(),
    }
    GM_setValue(DomainKey, clickedLinks)
  }

  // 移除特定链接的点击记录
  const removeLink = (pathname: string): boolean => {
    const clickedLinks = getCurrentDomainLinks()
    if (clickedLinks[pathname]) {
      delete clickedLinks[pathname]
      GM_setValue(DomainKey, clickedLinks)
      return true
    }
    return false
  }

  // 保存指定域名的数据
  const saveDomainData = (domain: string, data: LinksMap) => {
    const domainKey = CLICKED_LINKS_PREFIX + domain
    GM_setValue(domainKey, data)
  }

  // 清除当前网站的点击记录
  const clearCurrentDomainData = () => {
    GM_setValue(DomainKey, {})
  }

  // 清除所有网站的点击记录
  const clearAllDomainsData = () => {
    const domains = getAllDomains()

    // 清除每个域名的数据
    domains.forEach(domain => {
      const domainKey = CLICKED_LINKS_PREFIX + domain
      GM_setValue(domainKey, {})
    })

    // 清除域名列表
    GM_setValue(DOMAINS_KEY, [])
  }

  return {
    updateDomainsList,
    updateDomains,
    getLinksByDomain,
    setLinksByDomain,
    getAllDomains,
    getCurrentDomainLinks,
    getAllDomainsLinks,
    saveLink,
    removeLink,
    saveDomainData,
    clearCurrentDomainData,
    clearAllDomainsData,
  }
}

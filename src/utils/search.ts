const search = (searchKeyWord: string | null, replace: boolean = false) => {
    
    const url = new URL(window.location.href)
    const currentPath = url.pathname
    const currentSearch = url.search
    // 優先使用傳入參數，否則根據 referrer 自動判斷
    const shouldReplace = replace
  
    // 組合新的 URL
    const newUrl = searchKeyWord && searchKeyWord.trim()
      ? `${url.pathname}?keyWord=${encodeURIComponent(searchKeyWord.trim())}`
      : `${url.pathname}?keyWord`
  
      if (shouldReplace) {
        history.replaceState({}, '', newUrl)
      } else {
        // 🛑 若與當前網址完全一致，則不進行任何操作
        if (`${currentPath}${currentSearch}` === newUrl) {
          return
        } else {
          history.pushState({}, '', newUrl)
        }  
      }
    
  
    // 主動觸發 popstate
    window.dispatchEvent(new Event('popstate'))
}
  
export default search

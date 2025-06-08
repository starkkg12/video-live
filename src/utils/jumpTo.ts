/**
 * 通用导航函数，专为PWA和iOS standalone模式优化
 */
function jumpTo(url: string) {
  if (typeof window === 'undefined') return;
  
  // 检查是否在standalone模式
  const isStandalone = window.navigator.standalone || 
                       window.matchMedia('(display-mode: standalone)').matches;
  
  // 检查是否是iOS设备
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  
  if (isStandalone && isIOS && url.startsWith('/')) {
    // iOS standalone模式下的特殊处理
    
    // 使用iframe技术维持全屏体验
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    // 使用iframe进行导航
    iframe.onload = () => {
      setTimeout(() => {
        document.body.removeChild(iframe);
        // 延迟导航以确保维持全屏状态
        setTimeout(() => {
          window.location.href = url;
        }, 50);
      }, 0);
    };
    
    iframe.src = url;
    return;
  }
  
  // 非iOS或非standalone模式下的常规导航
  window.location.href = url;
}

export default jumpTo

function isMobile() {
    if (typeof navigator === 'undefined') return false
    const userAgent = navigator.userAgent || navigator.vendor
    return /android|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent.toLowerCase())
  }
  
  export default function () {
    return isMobile() ? 'C_H5' : 'C_WEB'
  }
  
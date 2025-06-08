function jumpToLogin() {
  if (
    typeof window !== 'undefined' &&
    window.location.pathname !== '/' &&
    window.location.pathname !== '/login' &&
    !window.location.pathname.startsWith('/user/') &&
    !window.location.pathname.startsWith('/history')
  ) {
    window.location.replace('/')
  }
}

export default jumpToLogin

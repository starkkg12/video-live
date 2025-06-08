declare const adapter: any

const loadAdapter = async () => {
  if (typeof adapter === 'undefined') {
    const script = document.createElement('script')
    script.src = 'https://webrtc.github.io/adapter/adapter-latest.js'
    document.head.appendChild(script)

    return new Promise((resolve, reject) => {
      script.onload = () => resolve(true)
      script.onerror = () => reject(new Error('Failed to load adapter.js'))
    })
  }
}
export default loadAdapter

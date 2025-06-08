type WebSocketConfig = {
  cid: string // 客户端唯一标识
  token: string // JWT令牌
  userId: string // 用户ID
  roomId: string // 房间ID
  manageSiteId?: string // 管理站点ID，可选
  clientType?: string // 客户端类型
  businessType?: string // 业务类型
  protocols?: string[] // 可选协议
  heartbeatInterval?: number // 心跳间隔 (ms)，默认 30000
  reconnectionDelay?: number // 重连延迟基础时间 (ms)，默认 1000
  maxReconnectAttempts?: number // 最大重连尝试次数，默认 10
  userAvatar?: string // 用户头像
}

type MessageCallback = (data: any) => void

// 消息类型枚举，与文档保持一致
enum MessageType {
  USER_LEAVE = 'user_leave',
  USER_JOIN = 'user_join',
  MESSAGE = 'message',
  CONFIRM = 'confirm',
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
  VIEWERS_UPDATE = 'viewers_update',
  PING = 'ping',
  PONG = 'pong',
  MESSAGE_DELETED = 'message_deleted',
  MESSAGE_CLEAR = 'message_clear',
  ERROR = 'error',
  FLYING_HEART = 'like',
  FOLLOW = 'follow',
}

const createWebSocketClient = (config: WebSocketConfig) => {
  const {
    cid,
    token,
    userId,
    roomId,
    manageSiteId,
    clientType = 'C_H5',
    businessType = 'XTK',
    protocols = [],
    heartbeatInterval = 30000, // 30秒发送一次心跳，符合文档推荐
    reconnectionDelay = 1000, // 基础重连延迟
    maxReconnectAttempts = 10,
    userAvatar,
  } = config

  const url = `wss://short-video-core.yeskiss007-917.workers.dev/ws/room/${roomId}/connect`
  // const url = `ws://localhost:8787/ws/room/${roomId}/connect`
  let ws: WebSocket | null = null
  let isConnected = false
  let heartbeatTimer: NodeJS.Timeout | null = null // 心跳定时器
  let reconnectTimer: NodeJS.Timeout | null = null // 重连定时器
  let onMessages: MessageCallback[] = []
  let reconnectAttempts = 0 // 重连尝试次数
  let isLoginFromDiffLocation: boolean = false
  let isDestroyed: boolean = false // 添加销毁状态标志

  const buildAuthUrl = () => {
    const params = new URLSearchParams()
    params.append('token', token)
    params.append('cid', cid)
    params.append('userAvatar', userAvatar || '')
    if (manageSiteId) {
      params.append('manageSiteId', manageSiteId)
    }
    return `${url}?${params.toString()}`
  }

  // 创建自定义WebSocket连接
  const connect = async () => {
    // 检查销毁状态，如果已销毁则不创建连接
    if (isDestroyed) {
      return
    }

    await closeWebSocket()

    try {
      // 使用自定义WebSocket构造，允许添加请求头
      ws = new WebSocket(buildAuthUrl())

      // 添加请求头前必须监听open事件
      ws.addEventListener('open', () => {
        // 连接成功后设置
        isConnected = true
        reconnectAttempts = 0 // 重置重连次数
        startHeartbeat() // 启动心跳
        console.log('WebSocket连接已建立！')
      })

      ws.onmessage = handleMessage
      ws.onclose = handleClose
      ws.onerror = handleError
    } catch (error) {
      console.error('创建WebSocket连接失败:', error)
      scheduleReconnect()
    }
  }

  // 处理接收到的消息
  const handleMessage = (event: MessageEvent) => {
    if (!event.data) return

    try {
      const data = JSON.parse(event.data)

      // 特殊处理PONG消息
      if (data.message && data.message.type === MessageType.PONG) {
        // 心跳响应处理
        return
      }

      // 处理错误消息
      if (data.message && data.message.type === MessageType.ERROR) {
        console.error('WebSocket错误:', data.message.content)

        // 处理特定错误，例如被踢出
        if (data.message.content === 'You have been kicked out') {
          isLoginFromDiffLocation = true
          closeWebSocket()
          return
        }
      }

      // 通知所有消息回调
      onMessages.forEach(cb => cb(data))
    } catch (error) {
      console.error('解析WebSocket消息失败:', error)
    }
  }

  const handleClose = (event: CloseEvent) => {
    isConnected = false
    stopHeartbeat()

    // 检查是否已销毁，如果已销毁则不重连
    if (!isLoginFromDiffLocation && !isDestroyed) {
      scheduleReconnect()
    }

    console.log(`WebSocket连接已关闭: ${event.code} ${event.reason}`)
  }

  const handleError = (error: Event) => {
    console.error('WebSocket错误:', error)

    if (ws) {
      ws.close()
    } else if (!isDestroyed) {
      // 检查销毁状态
      scheduleReconnect()
    }
  }

  const closeWebSocket = (): Promise<void> => {
    return new Promise(resolve => {
      if (!ws) {
        console.log('WebSocket连接已关闭（未初始化）')
        resolve()
        return
      }

      const currentState = ws.readyState
      console.log(`WebSocket当前状态: ${currentState} (0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED)`)

      // 清理所有事件监听
      ws.onopen = null
      ws.onmessage = null
      ws.onerror = null
      ws.onclose = null

      if (currentState === WebSocket.OPEN || currentState === WebSocket.CONNECTING) {
        let isResolved = false

        // 设置超时机制，防止onclose事件不触发
        const closeTimeout = setTimeout(() => {
          if (!isResolved) {
            console.log('WebSocket关闭超时，强制完成')
            isResolved = true
            ws = null
            resolve()
          }
        }, 5000) // 5秒超时

        // 临时设置onclose来处理关闭完成
        ws.onclose = () => {
          if (!isResolved) {
            console.log('WebSocket连接已手动关闭')
            isResolved = true
            clearTimeout(closeTimeout)
            ws = null
            resolve()
          }
        }

        console.log('正在关闭WebSocket连接...')
        ws.close()
      } else {
        // WebSocket已经是CLOSING或CLOSED状态
        console.log('WebSocket连接已关闭（已处于关闭状态）')
        ws = null
        resolve()
      }
    })
  }

  // 发送文本消息
  const sendText = async (content: string, retryCount = 0) => {
    // 检查销毁状态
    if (isDestroyed) {
      return
    }

    if (!ws) {
      console.warn('WebSocket未初始化，尝试重新连接...')
      await connect()
      if (retryCount < 3) {
        return sendText(content, retryCount + 1)
      }
      return
    }

    try {
      if (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
        console.warn('WebSocket已关闭，尝试重新连接...')
        await connect()
        if (retryCount < 3) {
          return sendText(content, retryCount + 1)
        }
        return
      }

      const message = {
        type: MessageType.MESSAGE,
        cId: generateClientId(),
        cTs: Date.now(),
        content: content,
      }

      ws.send(JSON.stringify(message))
    } catch (error) {
      console.error('发送消息失败:', error)
      if (retryCount < 3) {
        console.log(`尝试重新发送消息，第 ${retryCount + 1} 次重试`)
        await connect()
        return sendText(content, retryCount + 1)
      }
    }
  }

  // 发送图片消息
  const sendImage = async (imgUrl: string, retryCount = 0) => {
    // 检查销毁状态
    if (isDestroyed) {
      return
    }

    if (!ws) {
      console.warn('WebSocket未初始化，尝试重新连接...')
      await connect()
      if (retryCount < 3) {
        return sendImage(imgUrl, retryCount + 1)
      }
      return
    }

    try {
      if (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
        console.warn('WebSocket已关闭，尝试重新连接...')
        await connect()
        if (retryCount < 3) {
          return sendImage(imgUrl, retryCount + 1)
        }
        return
      }

      const message = {
        type: MessageType.MESSAGE,
        cId: generateClientId(),
        cTs: Date.now(),
        content: '',
        imageUrl: imgUrl,
      }

      ws.send(JSON.stringify(message))
    } catch (error) {
      console.error('发送图片失败:', error)
      if (retryCount < 3) {
        console.log(`尝试重新发送图片，第 ${retryCount + 1} 次重试`)
        await connect()
        return sendImage(imgUrl, retryCount + 1)
      }
    }
  }

  // 发送飞心消息
  const sendFlyingHeart = async (retryCount = 0) => {
    // 检查销毁状态
    if (isDestroyed) {
      return
    }

    if (!ws) {
      console.warn('WebSocket未初始化，尝试重新连接...')
      await connect()
      if (retryCount < 3) {
        return sendFlyingHeart(retryCount + 1)
      }
      return
    }

    try {
      if (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
        console.warn('WebSocket已关闭，尝试重新连接...')
        await connect()
        if (retryCount < 3) {
          return sendFlyingHeart(retryCount + 1)
        }
        return
      }

      const flyingHeartMessage = {
        type: MessageType.FLYING_HEART,
        cId: generateClientId(),
        cTs: Date.now(),
      }

      ws.send(JSON.stringify(flyingHeartMessage))
    } catch (error) {
      console.error('发送飞心失败:', error)
      if (retryCount < 3) {
        console.log(`尝试重新发送飞心，第 ${retryCount + 1} 次重试`)
        await connect()
        return sendFlyingHeart(retryCount + 1)
      }
    }
  }

  // 发送关注消息
  const sendFollow = async (retryCount = 0) => {
    // 检查销毁状态
    if (isDestroyed) {
      return
    }

    if (!ws) {
      console.warn('WebSocket未初始化，尝试重新连接...')
      await connect()
      if (retryCount < 3) {
        return sendFollow(retryCount + 1)
      }
      return
    }

    try {
      if (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
        console.warn('WebSocket已关闭，尝试重新连接...')
        await connect()
        if (retryCount < 3) {
          return sendFollow(retryCount + 1)
        }
        return
      }

      const flyingHeartMessage = {
        type: MessageType.FOLLOW,
        cId: generateClientId(),
        cTs: Date.now(),
      }

      ws.send(JSON.stringify(flyingHeartMessage))
    } catch (error) {
      console.error('发送关注失败:', error)
      if (retryCount < 3) {
        console.log(`尝试重新发送关注，第 ${retryCount + 1} 次重试`)
        await connect()
        return sendFollow(retryCount + 1)
      }
    }
  }

  // 生成客户端消息ID
  const generateClientId = () => {
    return `${cid}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // 发送ping心跳
  const sendPing = () => {
    if (!isConnected || !ws || isLoginFromDiffLocation || isDestroyed) {
      return
    }

    const pingMessage = {
      type: MessageType.PING,
      cId: generateClientId(),
      cTs: Date.now(),
    }

    ws.send(JSON.stringify(pingMessage))
  }

  // 启动心跳检测
  const startHeartbeat = () => {
    stopHeartbeat() // 确保没有重复的定时器

    heartbeatTimer = setInterval(() => {
      // 发送心跳
      sendPing()
    }, heartbeatInterval)
  }

  // 停止心跳检测
  const stopHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
  }

  // 指数退避重连策略
  const scheduleReconnect = () => {
    // 检查销毁状态，如果已销毁则不重连
    if (isDestroyed) {
      return
    }

    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
    }

    if (reconnectAttempts >= maxReconnectAttempts || isLoginFromDiffLocation) {
      console.log('达到最大重连次数或用户已在其他地方登录，停止重连')
      return
    }

    // 计算指数退避延迟时间
    const delay = Math.min(reconnectionDelay * Math.pow(2, reconnectAttempts), 30000)

    console.log(`安排重连尝试 ${reconnectAttempts + 1}/${maxReconnectAttempts}，延迟：${delay}ms`)

    reconnectTimer = setTimeout(() => {
      // 再次检查销毁状态
      if (!isDestroyed) {
        reconnectAttempts++
        connect()
      }
    }, delay)
  }

  // 用户活动监听，用于保持连接活跃
  const setupActivityListeners = () => {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart']

    const resetActivityTimer = () => {
      // 检查销毁状态，如果已销毁则不重连
      if (!isDestroyed && !isConnected && !reconnectTimer) {
        scheduleReconnect()
      }
    }

    events.forEach(event => {
      window.addEventListener(event, resetActivityTimer)
    })

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetActivityTimer)
      })
    }
  }

  // 获取WebSocket实例
  const getSocket = (): WebSocket => {
    if (!ws) {
      throw new Error('Socket未初始化或未打开！')
    }
    return ws
  }

  // 初始化
  connect()
  const removeActivityListeners = setupActivityListeners()

  // 返回WebSocket客户端控制接口
  return {
    sendText,
    sendImage,
    sendFlyingHeart,
    sendFollow,
    close: () => {
      stopHeartbeat()
      isConnected = false

      if (ws) {
        ws.close()
      }
    },
    setOnMessage: (callback: MessageCallback) => {
      onMessages.push(callback)
    },
    destroy: async () => {
      console.log('开始销毁WebSocket客户端...')

      // 设置销毁状态标志
      isDestroyed = true
      isConnected = false

      stopHeartbeat()
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
        reconnectTimer = null
      }

      // 等待WebSocket完全关闭
      await closeWebSocket()
      removeActivityListeners()

      console.log('WebSocket客户端已完全销毁')
    },
    getSocket,
  }
}

export default createWebSocketClient

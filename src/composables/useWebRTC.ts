import { ref } from 'vue'

export interface MessageInterface {
  sender: 'local' | 'remote'
  content: string
}

interface SignalMessage {
  type: 'join' | 'offer' | 'answer' | 'candidate' | 'ready'
  roomId: string
  payload: any
}

export function useWebRTC(roomId: string, signalingUrl = 'ws://localhost:3000') {
  const connection = ref<RTCPeerConnection | null>(null)
  const dataChannel = ref<RTCDataChannel | null>(null)
  const remoteChannel = ref<RTCDataChannel | null>(null)
  const socket = ref<WebSocket | null>(null)

  const messages = ref<MessageInterface[]>([])
  const isConnected = ref(false)
  const isInitiator = ref(false)

  const ICE_SERVERS = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  }

  const setup = async () => {
    messages.value = []
    isConnected.value = false
    isInitiator.value = false

    connection.value = new RTCPeerConnection(ICE_SERVERS)

    // ICE candidates
    connection.value.onicecandidate = event => {
      if (event.candidate && socket.value) {
        socket.value.send(
          JSON.stringify({
            type: 'candidate',
            roomId,
            payload: event.candidate,
          })
        )
      }
    }

    // 接收 DataChannel
    connection.value.ondatachannel = event => {
      remoteChannel.value = event.channel
      remoteChannel.value.onmessage = e => {
        messages.value.push({ sender: 'remote', content: e.data })
      }
    }

    socket.value = new WebSocket(signalingUrl)

    socket.value.onopen = () => {
      socket.value?.send(
        JSON.stringify({
          type: 'join',
          roomId,
          payload: {},
        })
      )
    }

    socket.value.onmessage = async event => {
      const msg: SignalMessage = JSON.parse(event.data)

      if (msg.type === 'offer') {
        await connection.value?.setRemoteDescription(new RTCSessionDescription(msg.payload))
        const answer = await connection.value?.createAnswer()
        await connection.value?.setLocalDescription(answer!)
        socket.value?.send(
          JSON.stringify({
            type: 'answer',
            roomId,
            payload: answer,
          })
        )
      }

      if (msg.type === 'answer') {
        await connection.value?.setRemoteDescription(new RTCSessionDescription(msg.payload))
      }

      if (msg.type === 'candidate') {
        try {
          await connection.value?.addIceCandidate(new RTCIceCandidate(msg.payload))
        } catch (e) {
          console.warn('Invalid ICE candidate', e)
        }
      }
    }

    // 延遲發起 offer（等到 server 知道有其他人）
    socket.value.onmessage = async event => {
      const msg: SignalMessage = JSON.parse(event.data)

      if (msg.type === 'offer') {
        await connection.value?.setRemoteDescription(new RTCSessionDescription(msg.payload))
        const answer = await connection.value?.createAnswer()
        await connection.value?.setLocalDescription(answer!)
        socket.value?.send(JSON.stringify({ type: 'answer', roomId, payload: answer }))
      }

      if (msg.type === 'answer') {
        await connection.value?.setRemoteDescription(new RTCSessionDescription(msg.payload))
      }

      if (msg.type === 'candidate') {
        await connection.value?.addIceCandidate(new RTCIceCandidate(msg.payload))
      }

      if (msg.type === 'ready') {
        // Server 發訊通知已有其他人在線，可發起 offer
        isInitiator.value = true
        dataChannel.value = connection.value!.createDataChannel('chat')
        dataChannel.value.onopen = () => (isConnected.value = true)
        dataChannel.value.onmessage = e => {
          messages.value.push({ sender: 'remote', content: e.data })
        }

        const offer = await connection.value!.createOffer()
        await connection.value!.setLocalDescription(offer)
        socket.value?.send(JSON.stringify({ type: 'offer', roomId, payload: offer }))
      }
    }
  }

  const sendMessage = (msg: string) => {
    const channel = dataChannel.value || remoteChannel.value
    if (channel?.readyState === 'open') {
      channel.send(msg)
      messages.value.push({ sender: 'local', content: msg })
    }
  }

  return {
    setup,
    sendMessage,
    messages,
    isConnected,
  }
}

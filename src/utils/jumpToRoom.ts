function jumpToRoom({ roomId, type }: { roomId: string; type: 'VOICE' | 'CHAT' }) {
  if (type === 'VOICE') {
    window.location.assign(`/voiceRoom/${roomId}`)
  } else {
    window.location.assign(`/room/chat?roomId=${roomId}`)
  }
}

export default jumpToRoom

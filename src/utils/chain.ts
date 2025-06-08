import { showDialog, showToast } from 'vant'

interface AskInterface {
  title?: string
  message?: string
  messageSub?: string
  confirmText?: string
  confirmColor?: string
  cancelText?: string
  cancelColor?: string
  showCancel?: boolean
}

export function confirmFirst({
  title = '提示',
  message = '',
  messageSub = '',
  confirmText = '确认',
  confirmColor = '#07c160',
  cancelText = '取消',
  cancelColor = '#434343',
  showCancel = true,
}: AskInterface) {
  return new Promise(resolve => {
    showDialog({
      title,
      message:
        `<div style="font-size:16px;font-weight:600;color:#434343">${message}</div>` +
        (messageSub ? `<div style="font-size:14px;color:#656565;padding-top:4px;">${messageSub}</div>` : ''),
      confirmButtonText: confirmText,
      confirmButtonColor: confirmColor,
      cancelButtonText: cancelText,
      cancelButtonColor: cancelColor,
      showCancelButton: showCancel,
      allowHtml: true,
    })
      .then(() => {
        resolve(true)
      })
      .catch(() => {
        resolve(false)
      })
  })
}
export default function chain() {
  let shouldContinue = true // 控制是否继续执行链式调用
  let isPending = false // 控制是否有操作在进行中，避免下一个操作提前执行
  let data: any = null
  const queue: Array<Function> = [] // 队列，用来按顺序执行链式调用

  // 用于执行队列中的操作
  const executeNext = async () => {
    if (queue.length > 0 && !isPending) {
      isPending = true // 标记为正在执行
      const nextAction = queue.shift() // 获取下一个操作
      nextAction && (await nextAction()) // 执行操作
      isPending = false // 操作完成，标记为空闲状态
      executeNext() // 继续执行下一个操作（如果有）
    }
  }

  const chain = {
    ask: (askConfig: AskInterface) => {
      // 将操作加入队列
      queue.push(async () => {
        if (!shouldContinue) return chain
        const confirmed = await confirmFirst(askConfig)
        if (!confirmed) {
          shouldContinue = false // 中断链式调用
        }
        data = confirmed
        executeNext() // 执行下一个操作
      })
      executeNext() // 立即执行队列中的操作
      return chain
    },
    fetch: (responsePromise: Function, params: any, successMsg?: string, failureMsg?: string) => {
      // 将操作加入队列
      queue.push(async () => {
        if (!shouldContinue) return chain
        const response = await responsePromise(params)
        if (response.data.errCode === '0') {
          successMsg && showToast(successMsg)
        } else {
          showToast(failureMsg || JSON.stringify(response.data))
          shouldContinue = false // 中断链式调用
        }
        data = response
        executeNext() // 执行下一个操作
      })
      executeNext() // 立即执行队列中的操作
      return chain
    },
    next: (callback: Function) => {
      // 将操作加入队列
      queue.push(async () => {
        if (!shouldContinue) return chain
        const result = callback(data)
        if (result instanceof Promise) {
          await result
        }
        data = result
        executeNext() // 执行下一个操作
      })
      executeNext() // 立即执行队列中的操作
      return chain
    },
    catch: (callback: Function) => {
      // 将操作加入队列
      queue.push(async () => {
        if (shouldContinue) return chain
        const result = callback(data)
        if (result instanceof Promise) {
          await result
        }
        data = result
        executeNext() // 执行下一个操作
      })
      executeNext() // 立即执行队列中的操作
      return chain
    },
  }

  return chain
}

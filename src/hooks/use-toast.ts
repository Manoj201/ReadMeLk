import * as React from 'react'
import type { ToastProps } from '@/components/ui/toast'

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 5000

export interface ToasterToast extends Omit<ToastProps, 'title'> {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
}

type State = { toasts: ToasterToast[] }

let count = 0
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

const listeners: Array<(state: State) => void> = []
let memoryState: State = { toasts: [] }
const timeouts = new Map<string, ReturnType<typeof setTimeout>>()

function setState(next: State) {
  memoryState = next
  listeners.forEach((l) => l(memoryState))
}

function scheduleRemove(id: string) {
  if (timeouts.has(id)) return
  timeouts.set(
    id,
    setTimeout(() => {
      timeouts.delete(id)
      setState({ toasts: memoryState.toasts.filter((t) => t.id !== id) })
    }, TOAST_REMOVE_DELAY),
  )
}

export function toast(props: Omit<ToasterToast, 'id'>) {
  const id = genId()
  const dismiss = () =>
    setState({
      toasts: memoryState.toasts.map((t) =>
        t.id === id ? { ...t, open: false } : t,
      ),
    })

  setState({
    toasts: [
      {
        ...props,
        id,
        open: true,
        onOpenChange: (open: boolean) => {
          if (!open) {
            dismiss()
            scheduleRemove(id)
          }
        },
      },
      ...memoryState.toasts,
    ].slice(0, TOAST_LIMIT),
  })

  scheduleRemove(id)
  return { id, dismiss }
}

export function useToast() {
  const [state, setLocal] = React.useState<State>(memoryState)
  React.useEffect(() => {
    listeners.push(setLocal)
    return () => {
      const i = listeners.indexOf(setLocal)
      if (i > -1) listeners.splice(i, 1)
    }
  }, [])
  return { ...state, toast }
}

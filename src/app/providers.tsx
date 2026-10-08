import type { PropsWithChildren } from 'react'
import { ThemeProvider } from '../features/theme/ThemeProvider'
import { InstallPromptProvider } from '../features/pwa/useInstallPrompt'
import { ToastProvider } from '../shared/ui/Toast'

export function Providers({ children }: PropsWithChildren) {
  return (
    <ToastProvider>
      <ThemeProvider>
        <InstallPromptProvider>{children}</InstallPromptProvider>
      </ThemeProvider>
    </ToastProvider>
  )
}

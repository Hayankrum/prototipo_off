import { createHashRouter, Navigate } from 'react-router-dom'
import { AppShell } from './layout/AppShell'
import { HomePage } from '../features/home/HomePage'
import { ItemsPage } from '../features/items/ItemsPage'
import { AboutPage } from '../features/about/AboutPage'
import { SettingsPage } from '../features/settings/SettingsPage'

export const router = createHashRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'itens', element: <ItemsPage /> },
      { path: 'sobre', element: <AboutPage /> },
      { path: 'config', element: <SettingsPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])

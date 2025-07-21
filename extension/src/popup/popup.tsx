
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ReflectFlowPanel } from '@/components/reflect-flow/ReflectFlowPanel'
import { Toaster } from "@/components/ui/toaster"

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ReflectFlowPanel />
    <Toaster />
  </React.StrictMode>,
)

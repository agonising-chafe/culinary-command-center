import React from 'react'
import AppHeader from './AppHeader'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <AppHeader />
        {children}
      </div>
    </div>
  )
}

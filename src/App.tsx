import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Index from '@/pages/Index'
import AdminLogin from '@/pages/AdminLogin'
import BiolinkPage from '@/pages/BiolinkPage'
import ShortlinkRedirect from '@/pages/ShortlinkRedirect'
import DirectoryPage from '@/components/DirectoryPage'
import Dashboard from '@/components/Dashboard'
import NotFound from '@/pages/NotFound'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            {/* Specific routes must come first to avoid conflicts with catch-all route */}
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/directory" element={<DirectoryPage />} />
            <Route path="/404" element={<NotFound />} />
            
            {/* Shortlink redirects - /s/:slug */}
            <Route path="/s/:slug" element={<ShortlinkRedirect />} />
            
            {/* Biolink pages - /:username (catch-all route, must be last) */}
            <Route path="/:username" element={<BiolinkPage />} />
            
            {/* Fallback for unmatched routes */}
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
          
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'white',
                color: 'black',
                border: '1px solid #e5e7eb',
              },
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App
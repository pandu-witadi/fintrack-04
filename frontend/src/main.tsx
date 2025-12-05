//
//
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'


import App from './App.tsx'
import { Toaster } from "sonner"


// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
})

// Set base URL for API requests
axios.defaults.baseURL = 'http://localhost:5200/api';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <Toaster />
            <App />
        </QueryClientProvider>
    </StrictMode>
)
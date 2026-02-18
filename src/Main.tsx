import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter ,RouterProvider } from 'react-router-dom'
import './styles/global.css'
import App from './App.tsx'

//paginas das rotas
import Home from './router/Home.tsx'
import Study from './router/Study.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,

    //errorElement:

    children:[
      {
        path:'/',
        element: <Home />
      },
      {
        path:'Formacao',
        element: <Study/>  
      }
    ]

  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)

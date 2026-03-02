import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter ,RouterProvider } from 'react-router-dom'
import './styles/global.css'
import App from './App.tsx'

//paginas das rotas
import Home from './router/Home.tsx'
import Study from './router/Study.tsx'
import Projects from './router/Projects.tsx'
import Contact from './router/Contact.tsx'

export const routePaths = ['/', '/formações', '/projetos', '/contatos'];

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
        path:'formações',
        element: <Study/>  
      },
      {
        path: 'projetos',
        element: <Projects />
      },
      {
        path: 'contatos',
        element: <Contact />
      }
    ]

  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)

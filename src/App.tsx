import './styles/global.css'
import { Outlet } from 'react-router-dom'
import Nav from './components/Nav'

const App = () => {
  return (
    <div className='App flex flex-col items-center w-full'> 
      <Nav />
      <Outlet />
    </div>
  )
}

export default App

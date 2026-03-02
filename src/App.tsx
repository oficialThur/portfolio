import './styles/global.css'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import Nav from './components/Nav'
import { CaretCircleDownIcon, CaretCircleUpIcon } from '@phosphor-icons/react'
import { routePaths } from './Main'

const App = () => {
  return (
    <div className='App flex flex-col items-center w-full'> 
      <Nav />
      <Outlet />
      <RouteNavigator />
    </div>
  )
}


function RouteNavigator() {
  const navigate = useNavigate()
  const location = useLocation()
  const current = location.pathname

  // ensure encoded paths match the location (handles acentos/URL-encoding)
  const normalized = routePaths.map((p) => encodeURI(p))
  const idx = normalized.indexOf(current)
  const hasPrev = idx > 0
  const hasNext = idx !== -1 && idx < normalized.length - 1

  if (idx === -1) return null // route desconhecida

  return (
    <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 flex gap-2">
      {hasPrev && (
        <button
          onClick={() => navigate(normalized[idx - 1])}
          className="flex items-center justify-center m-0 text-shadow-lg text-shadow-black-100 hover:bg-[#101010]/10 w-12 h-12 p-0.5 rounded-full transition duration-200 delay-200"
        >
          <CaretCircleUpIcon className="w-12 h-12" />
        </button>
      )}
      {hasNext && (
        <button
          onClick={() => navigate(normalized[idx + 1])}
          className="flex items-center justify-center m-0 text-shadow-lg text-shadow-black-100 hover:bg-[#101010]/10 w-12 h-12 p-0.5 rounded-full transition duration-200 delay-200"
        >
          <CaretCircleDownIcon className="w-12 h-12" />
        </button>
      )}
    </div>
  )
}

export default App

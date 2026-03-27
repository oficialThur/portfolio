import './styles/global.css'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation, useOutlet } from 'react-router-dom'
import Nav from './components/Nav'
import { CaretCircleDownIcon, CaretCircleUpIcon } from '@phosphor-icons/react'
import { routePaths } from './Main'
import gsap from 'gsap'

function getAnimationTargets(container: HTMLElement) {
  const selectors = [
    'section',
    'header',
    'article',
    'form',
    'h1',
    'h2',
    'h3',
    'p',
    'time',
    'button',
    'a',
    'input',
    'textarea',
    'label',
    'li',
    '[data-slot]'
  ].join(',')

  const nodes = Array.from(container.querySelectorAll<HTMLElement>(selectors))

  if (nodes.length) return nodes

  return Array.from(container.children) as HTMLElement[]
}

const App = () => {
  const outlet = useOutlet()
  const location = useLocation()
  const [renderedPath, setRenderedPath] = useState(location.pathname)
  const [renderedOutlet, setRenderedOutlet] = useState(outlet)
  const pageRef = useRef<HTMLDivElement>(null)
  const transitionRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    if (location.pathname === renderedPath) {
      return
    }

    const container = pageRef.current
    if (!container) {
      queueMicrotask(() => {
        setRenderedOutlet(outlet)
        setRenderedPath(location.pathname)
      })
      return
    }

    const currentNodes = getAnimationTargets(container)

    transitionRef.current?.kill()
    gsap.killTweensOf(currentNodes)

    const exitTl = gsap.timeline({
      onComplete: () => {
        setRenderedOutlet(outlet)
        setRenderedPath(location.pathname)
      }
    })

    transitionRef.current = exitTl

    exitTl.to(currentNodes.length ? currentNodes : [container], {
      opacity: 0,
      y: -28,
      stagger: 0.03,
      duration: 0.35,
      ease: 'power2.inOut'
    })

    return () => {
      exitTl.kill()
    }
  }, [location.pathname, outlet, renderedPath])

  useEffect(() => {
    const container = pageRef.current
    if (!container || renderedPath !== location.pathname) return

    const nodes = getAnimationTargets(container)
    const target = nodes.length ? nodes : [container]

    gsap.killTweensOf(target)

    const enterTl = gsap.timeline()

    enterTl.fromTo(
      target,
      { opacity: 0, y: 22 },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: 'power3.out',
        stagger: 0.05,
        clearProps: 'opacity,transform'
      }
    )

    return () => {
      enterTl.kill()
    }
  }, [renderedPath, location.pathname])

  return (
    <div className='App flex flex-col items-center w-full'> 
      <Nav />
      <div
        ref={pageRef}
        className='w-full flex flex-col items-center'
        data-route-transition
      >
        {renderedOutlet}
      </div>
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
    <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
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

import '../styles/global.css'
import { useEffect, useRef, useState } from 'react'
import { Button } from "./ui/button"
import { Link } from 'react-router-dom';
import { Switch } from "./ui/switch"
import gsap from 'gsap'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

const Nav = () => {
  const navRef = useRef<HTMLElement>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false

    const storedTheme = window.localStorage.getItem('theme')
    if (storedTheme === 'dark') return true
    if (storedTheme === 'light') return false

    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement

    if (isDarkMode) {
      root.classList.add('dark')
      window.localStorage.setItem('theme', 'dark')
      return
    }

    root.classList.remove('dark')
    window.localStorage.setItem('theme', 'light')
  }, [isDarkMode])

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const targets = nav.querySelectorAll<HTMLElement>('[data-nav-fade]')
    gsap.fromTo(
      targets,
      { autoAlpha: 0, y: -8 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.45,
        stagger: 0.08,
        ease: 'power2.out',
        clearProps: 'opacity,visibility,transform'
      }
    )
  }, [])

  useEffect(() => {
    if (!isMenuOpen) return

    const content = document.querySelector<HTMLElement>('[data-nav-dropdown-content]')
    if (!content) return

    const items = content.querySelectorAll<HTMLElement>('[data-nav-dropdown-item]')
    gsap.fromTo(
      items,
      { autoAlpha: 0, y: -6 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.28,
        stagger: 0.05,
        ease: 'power2.out',
        clearProps: 'opacity,visibility,transform'
      }
    )
  }, [isMenuOpen])

  return (
    <nav ref={navRef} className='container h-11.25 flex justify-between items-center px-2 md:px-7.5'>
      <h1 data-nav-fade className='text-shadow-lg text-shadow-black-100'>
        Dev Thur
      </h1>
      <DropdownMenu onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button data-nav-fade className='w-32 shadow-lg shadow-black-100 dark:border dark:border-border dark:bg-white/5' variant="outline">Open</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" data-nav-dropdown-content>
          <DropdownMenuGroup>
            <DropdownMenuItem data-nav-dropdown-item className='text-center text-shadow-lg text-shadow-black-100'>
              <Link to='/'>Home</Link>
            </DropdownMenuItem>
            <DropdownMenuItem data-nav-dropdown-item className='text-center text-shadow-lg text-shadow-black-100'>
              <Link to='/formações'>Formações</Link>
            </DropdownMenuItem>
            <DropdownMenuItem data-nav-dropdown-item className='text-center text-shadow-lg text-shadow-black-100'>
              <Link to='/projetos'>Projetos</Link>
            </DropdownMenuItem>
            <DropdownMenuItem data-nav-dropdown-item className='text-center text-shadow-lg text-shadow-black-100'>
              <Link to='/contatos'>Contato</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              data-nav-dropdown-item
              onSelect={(event) => event.preventDefault()}
              className='justify-center text-shadow-lg text-shadow-black-100 '
            >
              <Switch
                className='border-input shadow-lg shadow-black-100 **:data-[slot=switch-thumb]:border **:data-[slot=switch-thumb]:border-input'
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
                aria-label='Alternar modo escuro'
              />
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      
    </nav>
  )
}

export default Nav

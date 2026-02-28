import '../styles/global.css'
import { Button } from "./ui/button"
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

const Nav = () => {
  return (
    <nav className='container h-11.25 flex justify-between items-center px-2 md:px-7.5'>
      <h1 className='text-shadow-lg'>
        Dev Thur
      </h1>
      <DropdownMenu >
        <DropdownMenuTrigger asChild>
          <Button className='w-32 shadow-lg shadow-black-100' variant="outline">Open</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuGroup>
            <DropdownMenuItem className='text-center'>
              <Link to='/'>Home</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className='text-center'>
              <Link to='/formações'>Formações</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className='text-center'>
              <Link to='/projetos'>Projetos</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className='text-center'>
              <Link to='/contatos'>Contato</Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      
    </nav>
  )
}

export default Nav

import '../styles/global.css'
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

const Nav = () => {
  return (
    <nav className='container h-11.25 flex justify-between items-center px-7.5'>
      <h1 className='text-shadow-lg'>
        Dev Thur
      </h1>
      <DropdownMenu >
        <DropdownMenuTrigger asChild>
          <Button className='w-32' variant="outline">Open</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuGroup>
            <DropdownMenuItem className='text-center'>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className='text-center'>
              Billing
            </DropdownMenuItem>
            <DropdownMenuItem className='text-center'>
              Settings
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      
    </nav>
  )
}

export default Nav

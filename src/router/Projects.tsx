import { GithubLogoIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

const Projects = () => {
  return (
    <div className=" container h-screen">
      <section className="w-full flex flex-col justify-center p-2 md:p-30 gap-10 pb-10">
        <h2 className="text-shadow-lg text-shadow-black-100">
          Meus projetos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2 md:p-10 w-full place-items-center">
          <div className="shadow-lg shadow-black-100 border border-input rounded-lg w-full flex justify-center items-center md:row-span-3 p-1">
            <div className="w-full h-80 max-h-80 rounded-lg inset-shadow-sm inset-shadow-black-900 p-2.5 flex items-end-safe">
              <div className="w-[50%] max-w-[50%]">
                <h3 className="text-shadow-lg text-shadow-black-100">Teste</h3>
                <p className="py-2.5 text-shadow-lg">Lorem ipsum dolor, sit amet consectetur adipisicing elit.</p>
                <Button className="shadow-lg shadow-black-100">
                  veja
                </Button>
              </div>
            </div>
          </div>
          <div className="shadow-lg shadow-black-100 border border-input rounded-lg w-full flex justify-center items-center md:row-span-3 p-1">
            <div className="w-full h-80 max-h-80 flex justify-center items-center rounded-lg inset-shadow-sm inset-shadow-black-900 gap-1">
              <p className=" text-shadow-lg text-shadow-black-100">Para mais projetos me siga no</p>
              <Link to="https://www.linkedin.com/in/arthur-henrique-072354303/">
                <GithubLogoIcon className='w-5 h-5 text-shadow-lg text-shadow-black-100 shadow-black-900 hover:bg-[#101010]/10 p-0.5 rounded-full transition duration-200 delay-200' />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Projects

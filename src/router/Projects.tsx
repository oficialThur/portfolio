import { GithubLogoIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useState } from "react"
import cloudInfraBg from "../../assets/image/Screenshot 2026-03-30 at 13-38-34 Cloud Infra.png"

const Projects = () => {

  const [projects] = useState([
    {
      id: 1,
      background: cloudInfraBg,
      title: 'Landing page para um projeto de escola ',
      description: 'Uma landing page para um trabalho de escola, onde utilizo minhas habilidades de design e desenvolvimento frontend Em react e css simples.',
      link: '',
    },
  ]);

  return (
    <div className=" container h-screen">
      <section className="w-full flex flex-col justify-center p-2 md:p-30 gap-10 pb-10">
        <h2 className="text-shadow-lg text-shadow-black-100">
          Meus projetos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2 md:p-10 w-full place-items-center">
          {projects.map((project) => (
            <div key={project.id} className="shadow-lg shadow-black-100 border border-input rounded-lg w-full flex justify-center items-center md:row-span-3 p-1">
              <div
                className="relative w-full h-80 max-h-80 rounded-lg inset-shadow-sm inset-shadow-black-900 p-2.5 flex items-end-safe bg-cover bg-top overflow-hidden"
                style={{ backgroundImage: `url(${project.background})` }}
              >
                <div className="absolute inset-0 bg-linear-to-r from-black/75 via-black/40 to-transparent" />
                <div className="relative z-10 w-[50%] max-w-[50%] p-3 text-white">
                  <h3 className="text-shadow-lg text-shadow-black-100">{project.title}</h3>
                  <p className="py-2.5 text-shadow-lg">{project.description}</p>
                  <Link to={project.link}>
                    <Button className="shadow-lg shadow-black-100">
                      veja
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}          
          <div className="shadow-lg shadow-black-100 border border-input rounded-lg w-full flex justify-center items-center md:row-span-3 p-1">
            <div className="w-full h-80 max-h-80 flex justify-center items-center rounded-lg inset-shadow-sm inset-shadow-black-900 gap-1">
              <p className="text-shadow-lg text-shadow-black-100">Para mais projetos me siga no</p>
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

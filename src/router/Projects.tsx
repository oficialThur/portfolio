import { GithubLogoIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useState } from "react"
import cloudInfraBg from "../../assets/image/Screenshot 2026-03-30 at 13-38-34 Cloud Infra.png"
import QRcodeBg from "../../assets/image/CodeQR.png"
import ExDommusBg from "../../assets/image/Screenshot 2026-03-30 at 14-19-10 CRM Imobiliário Dommus tecnologia para vender mais e melhor.png"

const Projects = () => {

  const [projects] = useState([
    {
      id: 1,
      background: cloudInfraBg,
      title: 'Landing page em React',
      description: 'Uma landing page para um trabalho de escola, onde utilizo minhas habilidades frontend em react e css simples.',
      link: 'https://github.com/oficialThur/Cloudinfra-project',
    },
    {
      id: 2,
      background: QRcodeBg,
      title: 'Simples gerador de QR code',
      description: 'Um simples gerador de QR code como c# feito na aula do professor Daniel de POO.',
      link: 'https://github.com/oficialThur/QrcodeGenereitor',
    },
    {
      id: 3,
      background: ExDommusBg,
      title: 'Todos os exercícios da Dommus tecnologia',
      description: 'Nesse repositório você encontrará todos os exercícios desenvolvidos durante o meu tempo na como estagiário na Dommus tecnologia.',
      link: 'https://github.com/oficialThur/Ex_Dommus',
    }
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
              <Link to="https://github.com/oficialThur">
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

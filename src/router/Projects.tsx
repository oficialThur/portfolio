import { GithubLogoIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import cloudInfraBg from "../../assets/image/Screenshot 2026-03-30 at 13-38-34 Cloud Infra.png"
import QRcodeBg from "../../assets/image/CodeQR.png"
import ExDommusBg from "../../assets/image/Screenshot 2026-03-30 at 14-19-10 CRM Imobiliário Dommus tecnologia para vender mais e melhor.png"

const Projects = () => {
  const marqueeRefs = useRef<Array<HTMLDivElement | null>>([])

  const [projects] = useState([
    {
      id: 1,
      background: cloudInfraBg,
      title: 'Landing page em React',
      description: 'Uma landing page para um trabalho escolar, em que utilizo minhas habilidades de frontend com React e CSS.',
      link: 'https://github.com/oficialThur/Cloudinfra-project',
    },
    {
      id: 2,
      background: QRcodeBg,
      title: 'Simples gerador de QR code',
      description: 'Um gerador simples de QR Code em C#, feito na aula de POO do professor Daniel.',
      link: 'https://github.com/oficialThur/QrcodeGenereitor',
    },
    {
      id: 3,
      background: ExDommusBg,
      title: 'Todos os exercícios da Dommus Tecnologia',
      description: 'Neste repositório, você encontrará todos os exercícios desenvolvidos durante meu período como estagiário na Dommus Tecnologia.',
      link: 'https://github.com/oficialThur/Ex_Dommus',
    }
  ]);

  useEffect(() => {
    const animations = marqueeRefs.current.map((marquee) => {
      if (!marquee) return null

      const distance = marquee.scrollWidth / 2
      if (distance <= 0) return null

      return gsap.fromTo(
        marquee,
        { x: 0 },
        {
          x: -distance,
          duration: 14,
          repeat: -1,
          ease: 'none',
        }
      )
    })

    return () => {
      animations.forEach((animation) => animation?.kill())
    }
  }, [projects])

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
                <div className="relative z-10 w-[65%] max-w-[65%] p-3 text-white flex flex-col overflow-hidden min-w-0">
                  <h3 className="text-shadow-lg text-shadow-black-100">{project.title}</h3>
                  <div className="py-2.5 overflow-hidden">
                    <div
                      ref={(element) => {
                        marqueeRefs.current[project.id] = element
                      }}
                      className="flex w-max gap-10 pr-10 whitespace-nowrap"
                    >
                      <span className="text-shadow-lg text-sm md:text-base">{project.description}</span>
                      <span aria-hidden="true" className="text-shadow-lg text-sm md:text-base">{project.description}</span>
                    </div>
                  </div>
                  <Link to={project.link} className="mt-2 shrink-0">
                    <Button className="shadow-lg shadow-black-100">
                      Ver
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}          
          <div className="shadow-lg shadow-black-100 border border-input rounded-lg w-full flex justify-center items-center md:row-span-3 p-1">
            <div className="w-full h-80 max-h-80 flex justify-center items-center rounded-lg inset-shadow-sm inset-shadow-black-900 gap-1">
              <p className="text-shadow-lg text-shadow-black-100">Para ver mais projetos, siga-me no</p>
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

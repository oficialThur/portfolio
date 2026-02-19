import { PlayIcon } from "@phosphor-icons/react"
import { useState } from "react"

const Study = () => {

   
    const [itens] = useState([
        { id: 1, icon: <PlayIcon size={15} />, data: '3 de Janeiro de 2023', title: 'Primeiro ano no cotemig', text: 'O inicio da minha jonada começou aqui, 1º ano do encino medio tecnico no cotemig.' },
        { id: 1, icon: <PlayIcon size={15} />, data: '3 de Janeiro de 2023', title: 'Primeiro ano no cotemig', text: 'O inicio da minha jonada começou aqui, 1º ano do encino medio tecnico no cotemig.' },
    ]);
   

    return (
        <div className="container h-screen">
            <section className="w-full h-full flex flex-col justify-center p-2 md:p-30 gap-10">
                <h2 className="text-shadow-lg">
                    Minhas formações
                </h2>
                <div className="p-2 md:p-10">
                    <ol className="items-center w-full sm:flex">
                        {itens.map(item => (

                            <li key={item.id} className="relative mb-6 sm:mb-0 min-h-35">
                                <div className="flex items-center gap-0.5">
                                    <div className="flex items-center w-6 h-6 rounded-full p-0 md:p-0.5">
                                        {item.icon}
                                    </div>
                                    <div className="hidden sm:flex w-full bg-neutral-quaternary h-px border"></div>
                                </div>
                                <div className="mt-3 sm:pe-8">
                                    <time className="bg-neutral-secondary-medium border border-default-medium text-heading text-xs font-medium px-1.5 py-0.5 rounded shadow-lg shadow-black-300">{item.data}</time>
                                    <h3 className="text-lg font-semibold text-heading my-2 text-shadow-lg">{item.title}</h3>
                                    <p className="text-body mb-4 text-shadow-lg">{item.text}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>
        </div>
    )
}

export default Study

import { PlayIcon } from "@phosphor-icons/react"

const Study = () => {
    return (
        <div className="container h-screen">
            <section className="w-full h-full flex flex-col justify-center p-30 gap-10">
                <h2 className="text-shadow-lg">
                    Minhas formações
                </h2>
                <div className="p-10">
                    <ol className="items-center sm:flex">
                        <li className="relative mb-6 sm:mb-0">
                            <div className="flex items-center gap-0.5">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full p-0.5">
                                    <PlayIcon size={15} />
                                </div>
                                <div className="hidden sm:flex w-full bg-neutral-quaternary h-px border"></div>
                            </div>
                            <div className="mt-3 sm:pe-8">
                                <time className="bg-neutral-secondary-medium border border-default-medium text-heading text-xs font-medium px-1.5 py-0.5 rounded">3 de Janeiro de 2023</time>
                                <h3 className="text-lg font-semibold text-heading my-2 text-shadow-lg">Primeiro ano no cotemig</h3>
                                <p className="text-body mb-4 text-shadow-lg">O inicio da minha jonada começou aqui, 1º ano do encino medio tecnico no cotemig.</p>
                            </div>
                        </li>


                        <li className="relative mb-6 sm:mb-0">
                            <div className="flex items-center gap-0.5">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full p-0.5">
                                    <PlayIcon size={15} />
                                </div>
                                <div className="hidden sm:flex w-full bg-neutral-quaternary h-px border"></div>
                            </div>
                            <div className="mt-3 sm:pe-8">
                                <time className="bg-neutral-secondary-medium border border-default-medium text-heading text-xs font-medium px-1.5 py-0.5 rounded">3 de Janeiro de 2023</time>
                                <h3 className="text-lg font-semibold text-heading my-2 text-shadow-lg">Primeiro ano no cotemig</h3>
                                <p className="text-body mb-4 text-shadow-lg">O inicio da minha jonada começou aqui, 1º ano do encino medio tecnico no cotemig.</p>
                            </div>
                        </li>


                        <li className="relative mb-6 sm:mb-0">
                            <div className="flex items-center gap-0.5">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full p-0.5">
                                    <PlayIcon size={15} />
                                </div>
                                <div className="hidden sm:flex w-full bg-neutral-quaternary h-px border"></div>
                            </div>
                            <div className="mt-3 sm:pe-8">
                                <time className="bg-neutral-secondary-medium border border-default-medium text-heading text-xs font-medium px-1.5 py-0.5 rounded">3 de Janeiro de 2023</time>
                                <h3 className="text-lg font-semibold text-heading my-2 text-shadow-lg">Primeiro ano no cotemig</h3>
                                <p className="text-body mb-4 text-shadow-lg">O inicio da minha jonada começou aqui, 1º ano do encino medio tecnico no cotemig.</p>
                            </div>
                        </li>
                    </ol>
                </div>
            </section>
        </div>
    )
}

export default Study

import { CaretLeftIcon, CaretRightIcon, PlayIcon } from "@phosphor-icons/react"
import { useRef, useState } from "react"

const Study = () => {
    const carouselRef = useRef<HTMLOListElement>(null)

   
    const [itens] = useState([
        { 
            id: 1, icon: <PlayIcon size={15} />, 
            data: '3 de Janeiro de 2023', 
            title: 'Primeiro ano no Cotemig', 
            text: 'O início da minha jornada começou aqui: 1º ano do ensino médio técnico no Cotemig.' 
        },
        {
            id: 2, icon: <PlayIcon size={15} />,
            data: '9 de Dezembro de 2025',
            title: 'Minha formatura no Cotemig',
            text: 'Foi o fim do meu ciclo como estudante do ensino médio técnico no Cotemig. Completei os 3 anos com excelência.'
        },
        {
            id: 3, icon: <PlayIcon size={15} />,
            data: '9 de Dezembro de 2025',
            title: 'Início na Dommus Tecnologia',
            text: 'No mesmo dia da formatura, dei o primeiro passo na minha carreira na Dommus Tecnologia como estagiário de desenvolvimento, usando PHP, Laravel, JavaScript, React, Angular, jQuery e MySQL.'
        },
        {
            id: 4, icon: <PlayIcon size={15} />,
            data: '4 de Janeiro de 2026',
            title: 'Primeiro ano na faculdade de ciência da computação',
            text: 'Comecei minha jornada na faculdade Cotemig no curso de ciência da computação, onde estou adquirindo conhecimentos e habilidades para minha carreira.'
        },
        {
            id: 5, icon: <PlayIcon size={15} />,
            data: '26 de março de 2026',
            title: 'Último dia na Dommus Tecnologia',
            text: 'Meu último dia na Dommus Tecnologia, onde desenvolvi minhas habilidades e conhecimentos em desenvolvimento web. Tenho muito a agradecer ao Bruno, Samuel, Miguel, Egydio e Mireli, meus orientadores, que me ajudaram muito nessa jornada. Obrigado!'
        },
    ]);

    const scrollByCard = (direction: number) => {
        const carousel = carouselRef.current
        if (!carousel) return

        const card = carousel.querySelector<HTMLElement>('[data-study-card]')
        const offset = card ? card.offsetWidth + 24 : carousel.clientWidth * 0.8

        carousel.scrollBy({
            left: direction * offset,
            behavior: 'smooth',
        })
    }
   

    return (
        <div className="container min-h-screen">
            <section className="w-full min-h-screen flex flex-col justify-start md:justify-center p-2 md:p-30 gap-10 pb-24 md:pb-10">
                <h2 className="text-shadow-lg text-shadow-black-100">
                    Minhas formações
                </h2>
                <div className="relative p-2 md:p-10">
                    <div className="mb-4 hidden justify-end gap-2 md:flex">
                        <button
                            type="button"
                            onClick={() => scrollByCard(-1)}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/80 hover:bg-accent"
                            aria-label="Voltar timeline"
                        >
                            <CaretLeftIcon size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollByCard(1)}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/80 hover:bg-accent"
                            aria-label="Avançar timeline"
                        >
                            <CaretRightIcon size={16} />
                        </button>
                    </div>

                    <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-12 bg-linear-to-r from-background to-transparent md:block" aria-hidden="true" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-12 bg-linear-to-l from-background to-transparent md:block" aria-hidden="true" />

                    <ol
                        ref={carouselRef}
                        className="grid grid-cols-1 gap-8 md:flex md:snap-x md:snap-mandatory md:gap-6 md:overflow-x-auto md:scroll-smooth md:pb-4 md:[scrollbar-width:none] md:[&::-webkit-scrollbar]:hidden"
                    >
                        {itens.map((item) => (
                            <li key={item.id} data-study-card className="relative min-w-0 pl-10 md:min-w-65 md:shrink-0 md:snap-start md:pl-0 md:basis-[88%] lg:basis-[42%] xl:basis-[32%]">
                                <span className="absolute left-3 top-7 -bottom-4 w-px bg-border md:hidden" aria-hidden="true" />
                                <span className="absolute top-3 left-8 right-0 hidden h-px bg-border md:block" aria-hidden="true" />

                                <div className="absolute left-0 top-0 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-background md:relative">
                                    {item.icon}
                                </div>

                                <div className="mt-0 md:mt-3 md:pr-4">
                                    <time className="bg-neutral-secondary-medium border border-default-medium dark:border dark:border-border dark:bg-white/5 text-heading text-xs font-medium px-1.5 py-0.5 rounded shadow-lg shadow-black-300">{item.data}</time>
                                    <h3 className="text-lg font-semibold text-heading my-2 text-shadow-lg text-shadow-black-100">{item.title}</h3>
                                    <p className="text-body mb-4 text-shadow-lg text-shadow-black-100">{item.text}</p>
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

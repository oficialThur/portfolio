import { CaretCircleDownIcon } from "@phosphor-icons/react"

const Home = () => {
  return (
    <div className="container h-screen">
      <section className="flex justify-center items-center h-screen">
        <div className="w-full h-full flex flex-col items-center justify-center p-2 md:p-30">
          <h2 className="mb-4 text-center">
            Ola me chamo Arthur Henrique, é sou um Desenvolvedor.
          </h2>
          <p className="text-center">
            <strong>Desenvolvedor Web</strong> focado no <strong>Frontend</strong>, com paixão por criar interfaces de usuário intuitivas e de alto desempenho. Atuo como <strong>Product Developer</strong>, trazendo uma visão completa para o desenvolvimento de soluções robustas.
          </p>
        </div>
        <div className="w-full h-full"></div>
        <button className="p-0 m-0 absolute bottom-10 left-1/2 transform -translate-x-1/2 text-shadow-lg text-shadow-black-100">
          <CaretCircleDownIcon className="w-12 h-12"/>
        </button>
      </section>
    </div>
  )
}

export default Home

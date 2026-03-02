
const Home = () => {
  return (
    <div className="container h-screen">
      <section className="flex flex-col-reverse md:flex-row justify-center items-center h-screen">
        <div className="w-full md:h-full flex flex-col items-center justify-center p-2 md:p-30">
          <h2 className="mb-4 text-center text-shadow-lg text-shadow-black-100">
            Ola me chamo Arthur Henrique, é sou um Desenvolvedor.
          </h2>
          <p className="text-center text-shadow-lg text-shadow-black-100">
            <strong>Desenvolvedor Web</strong> focado no <strong>Frontend</strong>, com paixão por criar interfaces de usuário intuitivas e de alto desempenho. Atuo como <strong>Product Developer</strong>, trazendo uma visão completa para o desenvolvimento de soluções robustas.
          </p>
        </div>
        <div className="w-full md:h-full"></div>
      </section>      
    </div>
  )
}

export default Home

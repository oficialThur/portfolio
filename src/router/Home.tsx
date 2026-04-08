
import { useEffect, useRef } from "react"
import gsap from "gsap"
import profileImage from "../../assets/image/link.jpeg"

const Home = () => {
  const photoContainerRef = useRef<HTMLDivElement | null>(null)
  const photoRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    const container = photoContainerRef.current
    const photo = photoRef.current

    if (!container || !photo) {
      return
    }

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width - 0.5
      const y = (event.clientY - rect.top) / rect.height - 0.5

      gsap.to(photo, {
        x: x * 18,
        y: y * 18,
        rotateY: x * 14,
        rotateX: y * -14,
        scale: 1.04,
        duration: 0.35,
        ease: "power3.out",
        transformPerspective: 900,
        transformOrigin: "center center"
      })
    }

    const handleMouseLeave = () => {
      gsap.to(photo, {
        x: 0,
        y: 0,
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.5,
        ease: "power3.out"
      })
    }

    container.addEventListener("mousemove", handleMouseMove)
    container.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      container.removeEventListener("mousemove", handleMouseMove)
      container.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  return (
    <div className="container min-h-screen">
      <section className="flex min-h-screen flex-col-reverse items-center justify-center gap-8 py-8 md:flex-row md:gap-0 md:py-0">
        <div className="flex w-full flex-col items-center justify-center p-4 md:h-full md:p-30">
          <h2 className="mb-4 text-center text-shadow-lg text-shadow-black-100">
            Ola me chamo Arthur Henrique, é sou um Desenvolvedor.
          </h2>
          <p className="text-center text-shadow-lg text-shadow-black-100">
            <strong>Desenvolvedor Web</strong> focado no <strong>Frontend</strong>, com paixão por criar interfaces de usuário intuitivas e de alto desempenho. Atuo como <strong>Product Developer</strong>, trazendo uma visão completa para o desenvolvimento de soluções robustas.
          </p>
        </div>
        <div ref={photoContainerRef} className="flex w-full items-center justify-center perspective-[900px] md:h-full">
          <img
            ref={photoRef}
            src={profileImage}
            alt="Arthur Henrique"
            className="h-56 w-56 rounded-full object-cover shadow-lg sm:h-64 sm:w-64 md:h-72 md:w-72 lg:h-80 lg:w-80"
          />
        </div>
      </section>      
    </div>
  )
}

export default Home

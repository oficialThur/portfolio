import {
    GithubLogoIcon,
    InstagramLogoIcon,
    LinkedinLogoIcon,
    WhatsappLogoIcon
} from "@phosphor-icons/react"
import { Link } from "react-router-dom"

import Footer from "@/components/Footer"

const Contact = () => {
    return (
        <div className="container h-screen">
            <section className="p-10 w-full flex flex-col justify-center items-center h-screen">
                <div className="w-full h-full flex flex-col items-center">
                    <header className="w-full h-11.25 flex flex-col gap-1.5 md:flex-row justify-between items-center px-2 md:px-7.5 ">
                        <h2 className="text-shadow-lg text-shadow-black-100">
                            Contato
                        </h2>
                        <ul className="flex justify-around w-75 text-shadow-lg text-shadow-black-100">
                            <Link to="https://www.linkedin.com/in/arthur-henrique-072354303/">
                                <LinkedinLogoIcon className='text-shadow-lg hover:bg-[#101010]/10 w-6 h-6 p-0.5 rounded-full transition duration-200 delay-200' />
                            </Link>
                            <Link to="https://www.linkedin.com/in/arthur-henrique-072354303/">
                                <GithubLogoIcon className='text-shadow-lg hover:bg-[#101010]/10 w-6 h-6 p-0.5 rounded-full transition duration-200 delay-200' />
                            </Link>
                            <Link to="https://www.linkedin.com/in/arthur-henrique-072354303/">
                                <InstagramLogoIcon className='text-shadow-lg hover:bg-[#101010]/10 w-6 h-6 p-0.5 rounded-full transition duration-200 delay-200' />
                            </Link>
                            <Link to="https://www.linkedin.com/in/arthur-henrique-072354303/">
                                <WhatsappLogoIcon className='text-shadow-lg hover:bg-[#101010]/10 w-6 h-6 p-0.5 rounded-full transition duration-200 delay-200' />
                            </Link>
                        </ul>
                    </header>
                    <Footer />
                </div>
            </section>
        </div>
    )
}

export default Contact

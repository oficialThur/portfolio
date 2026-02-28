import { Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import "@/styles/global.css"
import { Button } from "./ui/button"

const Footer = () => {
  return (
    <footer className="w-full h-full flex justify-center items-center">
      <form className="container max-w-100 h-full flex flex-col justify-center items-center">
        <Field >
          <FieldLabel>
            <p>Nome</p>
          </FieldLabel>
          <Input type="text" className="bg-input border-input" placeholder="Digite seu nome" />
          <FieldDescription className="text-(--border-input)">
            <p>Digite seu nome completo</p>
          </FieldDescription>
        </Field>
        <Field className="mt-4">
          <FieldLabel>
            <p>Email</p>
          </FieldLabel>
          <Input type="email" className="bg-input border-input" placeholder="Digite seu email" />
          <FieldDescription className="text-(--border-input)">
            <p>Digite seu endereço de email</p>
          </FieldDescription>
        </Field>
        <Field className=" mt-4">
          <FieldLabel>
            <p>Mensagem</p>
          </FieldLabel>
          <Textarea className="bg-input border-input" placeholder="Digite sua mensagem" />
          <FieldDescription className="text-(--border-input)">
            <p>Digite sua mensagem</p>
          </FieldDescription>
        </Field>
        <Field className="">
          <FieldLabel>
            <p>Você e um recrutador? </p>
          </FieldLabel>
          <div className="flex gap-4">
            <div className="flex items-center ">
              <Checkbox className="bg-input border-input" />
              <p className="ml-2 text-sm">Sim</p>
            </div>
            <div className="flex items-center ">
              <Checkbox className="bg-input border-input" />
              <p className="ml-2 text-sm">Não</p>
            </div>
          </div>
        </Field>
        <Button className="mt-4">Enviar</Button>
      </form>
    </footer>
  )
}

export default Footer

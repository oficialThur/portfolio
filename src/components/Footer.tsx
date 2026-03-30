import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "./ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { z } from 'zod'
import { useForm } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod'
import "@/styles/global.css"
import { Alert, AlertDescription } from "./ui/alert"
import { CheckCircleIcon, WarningCircleIcon } from "@phosphor-icons/react"

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

const Footer = () => {

  const contactSchema = z.object({
    name: z.string().min(1, "O nome é obrigatório"),
    email: z.string().email("E-mail inválido"),
    message: z.string()
      .min(10, "A mensagem deve ter pelo menos 10 caracteres")
      .max(700, "A mensagem muito longa, o limite é de 700 caracteres"),
    isRecruiter: z.boolean(),
  })

  type ContactFormData = z.infer<typeof contactSchema>

  type ApiError = {
    success: false
    errors?: Partial<Record<keyof ContactFormData, string[]>>
    message?: string
  }

  type ApiSuccess = { success: true; message: string }
  type ApiResponse = ApiSuccess | ApiError

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
      isRecruiter: false,
    },
  })

  const {
    setError,
    reset,
    formState: { isSubmitting, isSubmitSuccessful },
  } = form

  async function onSubmit(data: ContactFormData) {
    try {
      const resposta = await fetch(`${API_URL}/contato.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const json: ApiResponse = await resposta.json()

      if (!json.success) {
        if ('errors' in json && json.errors) {
          ;(Object.keys(json.errors) as (keyof ContactFormData)[]).forEach((field) => {
            const fieldErrors = json.errors?.[field]
            if (fieldErrors?.length) {
              setError(field, { message: fieldErrors.join(', ') })
            }
          })
        } else {
          setError('root', { message: json.message ?? 'Ocorreu um erro ao enviar a mensagem. Por favor, tente novamente mais tarde.' })
        }
        return
      }
      reset()
    } catch {
      setError('root', { message: 'Erro de conexão com o servidor. Tente novamente mais tarde.' })
    }
  }

  return (
    <footer className="container max-w-100 h-full flex flex-col justify-center items-center">
      {form.formState.errors.root && (
        <Alert className="mt-2.5 flex items-center border-red-500 text-red-700 dark:text-red-400" variant="destructive">
          <WarningCircleIcon className="w-3 h-3 mb-1" />
          <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
        </Alert>
      )}

      {isSubmitSuccessful && (
        <Alert className="border-green-500 text-green-700 dark:text-green-400 flex items-center mt-2.5">
          <CheckCircleIcon className="w-3 h-3 mb-1" />
          <AlertDescription>
            Mensagem enviada com sucesso!
          </AlertDescription>
        </Alert>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-lg flex flex-col justify-center items-center mt-1.5">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>
                <p className="text-shadow-lg text-shadow-black-100">Nome</p>
              </FormLabel>
              <FormControl>
                <Input {...field} type="text" className="bg-input border-input shadow-lg shadow-black-100" placeholder="Digite seu nome" />
              </FormControl>
              <FormDescription className="text-(--border-input)">
                <p>Digite seu nome completo</p>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem className="w-full mt-4">
              <FormLabel>
                <p className="text-shadow-lg text-shadow-black-100">Email</p>
              </FormLabel>
              <FormControl>
                <Input {...field} type="email" className="bg-input border-input shadow-lg shadow-black-100" placeholder="Digite seu email" />
              </FormControl>
              <FormDescription className="text-(--border-input)">
                <p>Digite seu endereço de e-mail</p>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="message" render={({ field }) => (
            <FormItem className="w-full mt-4">
              <FormLabel>
                <p className="text-shadow-lg text-shadow-black-100">Mensagem</p>
              </FormLabel>
              <FormControl>
                <Textarea {...field} className="bg-input border-input shadow-lg shadow-black-100" placeholder="Digite sua mensagem" />
              </FormControl>
              <FormDescription className="text-(--border-input)">
                <p>Digite sua mensagem</p>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="isRecruiter" render={({ field }) => (
            <FormItem className="w-full mt-4">
              <FormLabel>
                <p className="text-shadow-lg text-shadow-black-100">Você é um recrutador?</p>
              </FormLabel>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      id="is-recruiter-sim"
                      checked={field.value === true}
                      onCheckedChange={() => field.onChange(true)}
                      className="shadow-lg shadow-black-100"
                    />
                  </FormControl>
                  <FormLabel htmlFor="is-recruiter-sim" className="text-sm">Sim</FormLabel>
                </div>

                <div className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      id="is-recruiter-nao"
                      checked={field.value === false}
                      onCheckedChange={() => field.onChange(false)}
                      className="shadow-lg shadow-black-100"
                    />
                  </FormControl>
                  <FormLabel htmlFor="is-recruiter-nao" className="text-sm">Não</FormLabel>
                </div>

                <FormMessage />
              </div>
            </FormItem>
          )} />

          <Button type="submit" disabled={isSubmitting} className="mt-4 shadow-lg shadow-black-100">
            {isSubmitting ? 'Enviando...' : 'Enviar'}
          </Button>
        </form>
      </Form>
    </footer>
  )
}

export default Footer
          


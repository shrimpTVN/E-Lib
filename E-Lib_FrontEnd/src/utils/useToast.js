import { useToast } from 'primevue/usetoast'

export const useAppToast = () => {
  const toast = useToast()

  const addToast = (severity, summary, detail, life = 3000) => {
    toast.add({ severity, summary, detail, life })
  }

  return { addToast }
}

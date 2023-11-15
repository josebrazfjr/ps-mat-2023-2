import { z } from 'zod'

// O ano deve ser menor  ou igual que o ano atual
const maxYear = new Date()   // Hoje
maxYear.setFullYear(maxYear.getFullYear() - 0)
const currentDate = new Date();
const isoDateString = currentDate.toISOString();


const Car = z.object({
  brand: 
    z.string()
    .min(1, { message: 'Comprimento mínimo 1 caractere' })
    .max(25, { message: 'Comprimento máximo 25 caracteres' }),
    
    model: 
    z.string()
    .min(1, { message: 'Comprimento mínimo 1 caractere' })
    .max(25, { message: 'Comprimento máximo 25 caracteres' }),
  
  color: 
    z.string()
    .min(4, { message: 'Comprimento mínimo 4 caractere' })
    .max(20, { message: 'Comprimento máximo 20 caracteres' }),

  year_manufacture:
    z.number()
    .min(1940, { message: 'Ano deve ser acima de 1940'})
    .max(maxYear.getFullYear, { message: 'Ano deve ser até ' + maxYear.getFullYear() })
    .nullable(),

  imported: 
    z.boolean()
    .default(false),

  plates: 
    z.string()
    .transform(v => v.replace('_', ''))
    .refine(v => v.length == 8, { message: 'Sublinhados não são permitidos' }),
  
  selling_date:
    z.coerce.date()
    .nullable(),

  selling_price: 
    z.number()
    .gte(2000, { message: 'Valor mínimo 2000.' })
    .refine(value => typeof value === 'number', { message: 'Apenas números.'})
    .nullable(),
    
  customer_id: 
    z.number()
    .positive()
    .nullable(),
  
})

export default Car
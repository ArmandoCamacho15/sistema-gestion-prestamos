import * as z from 'zod';

export const clientSchema = z.object({
  fullName: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
  identification: z.string().min(5, { message: 'La identificación debe tener al menos 5 caracteres.' }),
  phone: z.string().min(7, { message: 'El teléfono debe tener al menos 7 caracteres.' }).optional().or(z.literal('')),
  email: z.string().email({ message: 'Introduce un correo electrónico válido.' }).optional().or(z.literal('')),
  address: z.string().min(5, { message: 'La dirección debe tener al menos 5 caracteres.' }).optional().or(z.literal('')),
});

export type ClientValues = z.infer<typeof clientSchema>;

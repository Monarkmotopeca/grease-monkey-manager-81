
const userFormSchema = z.object({
  nome: z.string(),
  email: z.string(),
  password: z.string(),
  perfil: z.enum(["admin", "usuario", "mecanico"]),
});

import { z } from "zod"

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const commentSchema = z.preprocess(
  (value) => {
    if (typeof value === "string" && value.trim() === "") return null
    return value
  },
  z.string().trim().max(500, "Comentário muito longo.").nullable().optional()
)

export const createProductSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório.").max(180, "Título muito longo."),
  slug: z
    .string()
    .trim()
    .min(1, "Slug é obrigatório.")
    .max(180, "Slug muito longo.")
    .regex(slugRegex, "Slug inválido. Use apenas letras minúsculas, números e hífen."),
  description: z
    .string()
    .trim()
    .min(1, "Descrição é obrigatória.")
    .max(4000, "Descrição muito longa."),
  comment: commentSchema,
  image_url: z.string().trim().url("URL da imagem inválida."),
  price_from: z.coerce.number().positive("Preço de deve ser maior que zero."),
  price_to: z.coerce.number().positive("Preço por deve ser maior que zero."),
  affiliate_link: z.string().trim().url("Link de afiliado inválido."),
  theme: z.string().trim().min(1, "Tema é obrigatório.").max(120, "Tema muito longo."),
})

export const updateProductSchema = createProductSchema.extend({
  active: z.boolean({
    required_error: "Status ativo/inativo é obrigatório.",
    invalid_type_error: "Status ativo/inativo inválido.",
  }),
})

export const patchProductSchema = z.object({
  active: z.boolean({
    required_error: "Status ativo/inativo é obrigatório.",
    invalid_type_error: "Status ativo/inativo inválido.",
  }),
})

export const importProductSchema = createProductSchema.extend({
  active: z.boolean().optional(),
})

export function getFirstZodErrorMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "Dados inválidos."
}

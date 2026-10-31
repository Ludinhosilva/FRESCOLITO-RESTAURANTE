import {
  CupSoda,
  Drumstick,
  Fish,
  Flame,
  IceCreamBowl,
  Salad,
  Soup,
  Utensils,
  UtensilsCrossed,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type CategoriaMeta = {
  Icon: LucideIcon
  label: string
  descripcion: string
}

const CATEGORIAS: Record<string, CategoriaMeta> = {
  'a la carta': {
    Icon: UtensilsCrossed,
    label: 'A la Carta',
    descripcion: 'Los clásicos de la casa',
  },
  'promo marino': {
    Icon: Flame,
    label: 'Promo Marino',
    descripcion: 'Combos para compartir',
  },
  'platos marinos': {
    Icon: Fish,
    label: 'Platos Marinos',
    descripcion: 'Del mar a tu mesa',
  },
  mariscos: {
    Icon: Fish,
    label: 'Mariscos',
    descripcion: 'Frescos de la región',
  },
  combos: {
    Icon: Flame,
    label: 'Combos',
    descripcion: 'Para compartir',
  },
  ceviche: {
    Icon: Fish,
    label: 'Ceviches',
    descripcion: 'Frescos del día',
  },
  ceviches: {
    Icon: Fish,
    label: 'Ceviches',
    descripcion: 'Frescos del día',
  },
  chicharron: {
    Icon: Drumstick,
    label: 'Chicharrones',
    descripcion: 'Crocantes y recién fritos',
  },
  chicharrones: {
    Icon: Drumstick,
    label: 'Chicharrones',
    descripcion: 'Crocantes y recién fritos',
  },
  chaufa: {
    Icon: Soup,
    label: 'Chaufas',
    descripcion: 'Al wok, bien calientes',
  },
  chaufas: {
    Icon: Soup,
    label: 'Chaufas',
    descripcion: 'Al wok, bien calientes',
  },
  bebidas: {
    Icon: CupSoda,
    label: 'Bebidas',
    descripcion: 'Para acompañar',
  },
  postres: {
    Icon: IceCreamBowl,
    label: 'Postres',
    descripcion: 'El toque dulce',
  },
  ensaladas: {
    Icon: Salad,
    label: 'Ensaladas',
    descripcion: 'Frescas y ligeras',
  },
}

const normalizar = (valor: string) =>
  valor
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

export function getCategoriaMeta(categoria?: string | null): CategoriaMeta {
  const valor = (categoria ?? 'Otros').trim()
  return CATEGORIAS[normalizar(valor)] ?? {
    Icon: Utensils,
    label: valor,
    descripcion: 'Sabores de la casa',
  }
}

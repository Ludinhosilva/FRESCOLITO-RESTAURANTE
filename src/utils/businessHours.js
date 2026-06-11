import { BUSINESS_HOURS } from '../data/config'

export function getBusinessStatus() {
  const now = new Date()
  const day = now.getDay()
  const minutes = now.getHours() * 60 + now.getMinutes()

  const isBusinessDay = BUSINESS_HOURS.days.includes(day)
  const openMinutes = BUSINESS_HOURS.open.h * 60 + BUSINESS_HOURS.open.m
  const closeMinutes = BUSINESS_HOURS.close.h * 60 + BUSINESS_HOURS.close.m

  const isOpen = isBusinessDay && minutes >= openMinutes && minutes < closeMinutes

  return {
    isOpen,
    label: BUSINESS_HOURS.label,
    openTime: `${BUSINESS_HOURS.open.h.toString().padStart(2, '0')}:${BUSINESS_HOURS.open.m.toString().padStart(2, '0')}`,
    closeTime: `${BUSINESS_HOURS.close.h.toString().padStart(2, '0')}:${BUSINESS_HOURS.close.m.toString().padStart(2, '0')}`,
  }
}

import { useState, useEffect, useCallback, useRef } from 'react'
import { generateOrderMessage, openWhatsApp, COMMISSION_PER_ITEM } from '../../utils/whatsapp'

export default function CartDrawer() {
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [isDelivery, setIsDelivery] = useState(false)
  const [mounted, setMounted] = useState(false)
  const openPing = useRef(false)

  useEffect(() => {
    setMounted(true)
    openPing.current = localStorage.getItem('frescolito-cart-open') === 'true'
  }, [])

  const loadCart = useCallback(() => {
    try {
      const data = JSON.parse(localStorage.getItem('frescolito-cart') || '[]')
      setItems(data)
    } catch {
      setItems([])
    }
  }, [])

  useEffect(() => {
    loadCart()

    const interval = setInterval(() => {
      const flag = localStorage.getItem('frescolito-cart-open')
      if (flag === 'true') {
        setOpen(true)
        localStorage.setItem('frescolito-cart-open', '')
        loadCart()
      }
    }, 200)

    return () => clearInterval(interval)
  }, [loadCart])

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)
  const commission = isDelivery ? count * COMMISSION_PER_ITEM : 0
  const total = subtotal + commission

  function updateQuantity(id, delta) {
    const updated = items
      .map((i) => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
      .filter((i) => i.quantity > 0)
    setItems(updated)
    localStorage.setItem('frescolito-cart', JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('cart-updated'))
  }

  function clearCart() {
    setItems([])
    localStorage.setItem('frescolito-cart', '[]')
    window.dispatchEvent(new CustomEvent('cart-updated'))
  }

  function sendOrder() {
    const msg = generateOrderMessage(items, subtotal, commission, isDelivery, notes)
    openWhatsApp(msg)
  }

  if (!open) return null

  return (
    <>
      <div onClick={() => setOpen(false)} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        zIndex: 1999,
      }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '400px', maxWidth: '100vw',
        background: 'var(--color-bg)', zIndex: 2000,
        display: 'flex', flexDirection: 'column',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
        fontFamily: 'var(--font-body)',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', padding: '1.5rem',
          borderBottom: '1px solid var(--color-light)',
        }}>
          <h2 style={{ fontSize: '1.3rem' }}>Tu Pedido ({count})</h2>
          <button onClick={() => setOpen(false)} style={{
            background: 'none', border: 'none',
            fontSize: '1.5rem', cursor: 'pointer', color: 'var(--color-mid)',
          }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 1.5rem' }}>
          {items.length === 0 ? (
            <p style={{ color: 'var(--color-mid)', textAlign: 'center', marginTop: '2rem' }}>
              Tu carrito está vacío
            </p>
          ) : (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '1rem 0', borderBottom: '1px solid var(--color-light)',
                marginBottom: '0.5rem',
              }}>
                <input
                  id="delivery-toggle"
                  type="checkbox"
                  checked={isDelivery}
                  onChange={(e) => setIsDelivery(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="delivery-toggle" style={{ fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
                  Para llevar <span style={{ color: 'var(--color-mid)', fontWeight: 400 }}>(+S/ {COMMISSION_PER_ITEM.toFixed(2)} x plato)</span>
                </label>
              </div>

              {items.map((item) => (
                <div key={item.id} style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', padding: '1rem 0',
                  borderBottom: '1px solid var(--color-light)',
                }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.name}</p>
                    <p style={{ color: 'var(--color-mid)', fontSize: '0.85rem' }}>
                      S/ {item.price.toFixed(2)} c/u
                      {isDelivery && <span style={{ color: 'var(--color-primary-hover)' }}> + S/ {COMMISSION_PER_ITEM.toFixed(2)} envío</span>}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button onClick={() => updateQuantity(item.id, -1)} style={{
                      background: 'var(--color-light)', border: 'none',
                      width: '32px', height: '32px', borderRadius: '50%',
                      cursor: 'pointer', fontWeight: 700, fontSize: '1rem',
                    }}>−</button>
                    <span style={{ fontWeight: 700 }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} style={{
                      background: 'var(--color-primary)', border: 'none',
                      width: '32px', height: '32px', borderRadius: '50%',
                      cursor: 'pointer', fontWeight: 700, fontSize: '1rem',
                    }}>+</button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {items.length > 0 && (
          <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-light)' }}>
            <textarea
              placeholder="Notas para el pedido (opcional)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%', padding: '0.75rem',
                border: '1px solid var(--color-light)', borderRadius: 'var(--radius)',
                fontFamily: 'var(--font-body)', fontSize: '0.9rem',
                resize: 'vertical', marginBottom: '1rem',
                minHeight: '60px',
              }}
            />

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 700 }}>S/ {subtotal.toFixed(2)}</span>
              </div>
              {isDelivery && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span>Comisión ({count} platos x S/ {COMMISSION_PER_ITEM.toFixed(2)})</span>
                  <span style={{ fontWeight: 700 }}>S/ {commission.toFixed(2)}</span>
                </div>
              )}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', paddingTop: '0.5rem',
                borderTop: '2px solid var(--color-dark)',
              }}>
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Total</span>
                <span style={{
                  fontFamily: 'var(--font-heading)', fontSize: '1.5rem',
                  fontWeight: 700, color: 'var(--color-primary-hover)',
                }}>
                  S/ {total.toFixed(2)}
                </span>
              </div>
            </div>

            <button onClick={sendOrder} className="btn btn-primary" style={{
              width: '100%', justifyContent: 'center',
              padding: '1rem', fontSize: '1.05rem',
            }}>
              Enviar pedido por WhatsApp
            </button>
            <button onClick={clearCart} style={{
              width: '100%', marginTop: '0.5rem',
              background: 'none', border: 'none',
              color: 'var(--color-mid)', cursor: 'pointer',
              fontSize: '0.85rem', padding: '0.5rem',
            }}>
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </>
  )
}

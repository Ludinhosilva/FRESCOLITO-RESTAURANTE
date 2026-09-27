export default function EmptyState({ icon: Icon, title, sub, children = null }) {
  return (
    <div className="empty">
      {Icon && <Icon />}
      {title && <div className="empty-title">{title}</div>}
      {sub && <div className="empty-sub">{sub}</div>}
      {children}
    </div>
  )
}

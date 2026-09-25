// Inspirado en ReactBits "Shiny Text": brillo que recorre el texto.
export default function ShinyText({ children, className = '', speed = 4 }) {
  return (
    <span className={'shiny-text ' + className} style={{ animationDuration: `${speed}s` }}>
      {children}
    </span>
  )
}

import React, { useState } from 'react'

const Accordion = ({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) => {
  const [open, setOpen] = useState(false)

  return (
    <div className={`collapse collapse-arrow ${open ? 'collapse-open' : ''} ${className ?? ''}`}>
      <button
        className="collapse-title text-left"
        onClick={() => {
          setOpen(!open)
        }}
      >
        {title}
      </button>
      <div className="collapse-content">{children}</div>
    </div>
  )
}

export default Accordion

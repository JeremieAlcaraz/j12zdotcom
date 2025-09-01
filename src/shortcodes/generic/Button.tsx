import React from 'react'

const Button = ({
  label,
  link,
  style,
  rel,
}: {
  label: string
  link: string
  style?: string
  rel?: string
}) => {
  return (
    <a
      href={link}
      target="_blank"
      rel={`noopener noreferrer ${rel ? (rel === 'follow' ? '' : rel) : 'nofollow'}`}
      className={`btn me-4 mb-4 hover:no-underline ${
        style === 'outline' ? 'btn-outline btn-primary' : 'btn-primary'
      }`}
    >
      {label}
    </a>
  )
}

export default Button

import React, { useEffect } from 'react'

const Youtube = ({ id, title, ...rest }: { id: string; title: string; [key: string]: any }) => {
  useEffect(() => {
    import('@justinribeiro/lite-youtube')
  }, [])

  // @ts-expect-error - custom element provided by lite-youtube
  return <lite-youtube videoid={id} videotitle={title} {...rest} />
}

export default Youtube

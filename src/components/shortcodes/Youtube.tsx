import React, { useEffect } from 'react'

export interface YoutubeProps extends Record<string, unknown> {
  id: string
  title: string
}

const Youtube = ({ id, title, ...rest }: YoutubeProps) => {
  useEffect(() => {
    import('@justinribeiro/lite-youtube')
  }, [])

  // @ts-expect-error - custom element provided by lite-youtube
  return <lite-youtube videoid={id} videotitle={title} {...rest} />
}

export default Youtube

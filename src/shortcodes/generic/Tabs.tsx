import { marked } from 'marked'
import React, { useEffect, useRef, useState } from 'react'

const Tabs = ({ children }: { children: React.ReactElement }) => {
  const [active, setActive] = useState<number>(0)
  const [defaultFocus, setDefaultFocus] = useState<boolean>(false)

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  useEffect(() => {
    if (defaultFocus) {
      tabRefs.current[active]?.focus()
    } else {
      setDefaultFocus(true)
    }
  }, [active])

  const tabLinks = Array.from(
    (children.props as any).value.matchAll(/<div\s+data-name="([^"]+)"[^>]*>((?:.|\n)*?)<\/div>/g),
    (match: RegExpMatchArray) => ({ name: match[1], children: match[0] })
  )

  const handleKeyDown = (event: React.KeyboardEvent<EventTarget>, index: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      setActive(index)
    } else if (event.key === 'ArrowRight') {
      setActive((active + 1) % tabLinks.length)
    } else if (event.key === 'ArrowLeft') {
      setActive((active - 1 + tabLinks.length) % tabLinks.length)
    }
  }

  return (
    <div>
      <div role="tablist" className="tabs tabs-bordered">
        {tabLinks.map((item: { name: string; children: string }, index: number) => (
          <button
            key={index}
            role="tab"
            className={`tab ${index === active ? 'tab-active' : ''}`}
            tabIndex={index === active ? 0 : -1}
            onKeyDown={event => handleKeyDown(event, index)}
            onClick={() => setActive(index)}
            ref={ref => {
              tabRefs.current[index] = ref
            }}
          >
            {item.name}
          </button>
        ))}
      </div>
      {tabLinks.map((item: { name: string; children: string }, i: number) => (
        <div
          key={i}
          className={`mt-4 ${active === i ? 'block' : 'hidden'}`}
          dangerouslySetInnerHTML={{
            __html: marked.parse(item.children),
          }}
        />
      ))}
    </div>
  )
}

export default Tabs

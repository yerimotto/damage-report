import type { AnchorHTMLAttributes } from 'react'
import { href, navigate, type Route } from '../lib/router'

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: Route }

/** An anchor that routes in-app instead of letting the browser handle the hash. */
export function Link({ to, onClick, ...rest }: LinkProps) {
  return (
    <a
      {...rest}
      href={href(to)}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return
        e.preventDefault()
        navigate(to)
      }}
    />
  )
}

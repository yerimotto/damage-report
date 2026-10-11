import type { ButtonHTMLAttributes } from 'react'
import { navigate, type Route } from '../lib/router'

type LinkProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & { to: Route }

/**
 * In-app navigation. Rendered as a button rather than an <a href="#/…">, so
 * hosts that intercept link clicks (embedded previews) can't hijack it.
 */
export function Link({ to, onClick, ...rest }: LinkProps) {
  return (
    <button
      {...rest}
      type="button"
      role="link"
      onClick={(e) => {
        onClick?.(e)
        if (!e.defaultPrevented) navigate(to)
      }}
    />
  )
}

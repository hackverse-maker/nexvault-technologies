'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { ArrowRight, Loader2, Lock, Mail } from 'lucide-react'
import { loginAction, type LoginState } from './actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button className="button primary" type="submit" disabled={pending} style={{ width: '100%' }}>
      {pending ? <Loader2 size={16} className="animate-spin" /> : <>Sign in <ArrowRight size={16} /></>}
    </button>
  )
}

export function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(loginAction, {})

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 8, color: '#aac0d5', fontSize: 12 }}>
        Email address
        <span style={{ position: 'relative' }}>
          <Mail size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#5f7a99' }} />
          <input
            required
            type="email"
            name="email"
            autoComplete="email"
            placeholder="admin@nexvault.com"
            style={inputStyle}
          />
        </span>
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 8, color: '#aac0d5', fontSize: 12 }}>
        Password
        <span style={{ position: 'relative' }}>
          <Lock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#5f7a99' }} />
          <input
            required
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            style={{ ...inputStyle, paddingLeft: 38 }}
          />
        </span>
      </label>
      {state.error && (
        <p role="alert" style={{ color: '#f0a3a3', fontSize: 12, margin: 0 }}>
          {state.error}
        </p>
      )}
      <SubmitButton />
    </form>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#091a31',
  border: '1px solid var(--line)',
  borderRadius: 6,
  padding: '13px 14px 13px 38px',
  color: 'white',
  font: 'inherit',
  fontSize: 13,
  outline: 'none',
}

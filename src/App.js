import React, { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Onboarding from './pages/Onboarding'
import { Analytics } from '@vercel/analytics/react'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) checkMode(session)
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) checkMode(session)
      else { setLoading(false); setMode(null) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function checkMode(session) {
    const cachedMode = localStorage.getItem(`rishta_mode_${session.user.id}`)
    if (cachedMode) {
      setMode(cachedMode)
      setLoading(false)
    }
    const { data } = await supabase.from('profiles').select('mode').eq('id', session.user.id).single()
    if (data?.mode) {
      setMode(data.mode)
      localStorage.setItem(`rishta_mode_${session.user.id}`, data.mode)
    }
    setLoading(false)
  }

  function handleOnboardingComplete(selectedMode) {
    setMode(selectedMode)
  }

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#FFF0F5',fontFamily:'DM Sans,sans-serif'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:'32px',marginBottom:'1rem'}}>💍</div>
        <div style={{color:'#C2185B',fontSize:'14px'}}>Loading Rishta Radar...</div>
      </div>
    </div>
  )

  if (!session) return <><Landing /><Analytics /></>
  if (!mode) return <><Onboarding session={session} onComplete={handleOnboardingComplete} /><Analytics /></>
  return <><Dashboard session={session} mode={mode} /><Analytics /></>
}

import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Onboarding from './pages/Onboarding'
import { Analytics } from '@vercel/analytics/react'
import Admin from './pages/Admin'
import Blog from './pages/Blog'

function LoadingScreen() {
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#FFF0F5',fontFamily:'DM Sans,sans-serif'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:'32px',marginBottom:'1rem'}}>💍</div>
        <div style={{color:'#C2185B',fontSize:'14px'}}>Loading Rishta Radar...</div>
      </div>
    </div>
  )
}

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

    await supabase.from('profiles').upsert({
      id: session.user.id,
      email: session.user.email,
    }, { onConflict: 'id' })

    await supabase.from('profiles').update({
      full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || null,
      google_id: session.user.user_metadata?.sub || null,
    }).eq('id', session.user.id)

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

  return (
    <BrowserRouter>
      <Analytics />
      <Routes>
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<Blog />} />
        <Route path="/admin" element={
          loading ? <LoadingScreen /> :
          !session ? <Navigate to="/" /> :
          <Admin session={session} />
        } />
        <Route path="/*" element={
          loading ? <LoadingScreen /> :
          !session ? <Landing /> :
          !mode ? <Onboarding session={session} onComplete={handleOnboardingComplete} /> :
          <Dashboard session={session} mode={mode} />
        } />
      </Routes>
    </BrowserRouter>
  )
}

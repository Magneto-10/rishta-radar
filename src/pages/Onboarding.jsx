import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Onboarding({ session, onComplete }) {
  const [loading, setLoading] = useState(false)

  async function selectMode(mode) {
    setLoading(true)
    await supabase.from('profiles').upsert({
      id: session.user.id,
      email: session.user.email,
      mode: mode
    })
    onComplete(mode)
  }

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#FFF0F5 0%,#FFF8F0 100%)',fontFamily:'DM Sans,sans-serif',display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem'}}>
      <div style={{textAlign:'center',maxWidth:'480px',width:'100%'}}>
        <div style={{fontSize:'48px',marginBottom:'1rem'}}>💍</div>
        <div style={{fontFamily:'Playfair Display,serif',fontSize:'28px',color:'#2C1810',marginBottom:'.75rem'}}>Welcome to Rishta Radar</div>
        <div style={{fontSize:'15px',color:'#7B5E6B',marginBottom:'2.5rem',lineHeight:1.7}}>
          Tell us what you're looking for so we can personalise your experience
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1.5rem'}}>
          <button onClick={()=>selectMode('she')} disabled={loading}
            style={{padding:'2rem 1rem',borderRadius:'16px',border:'2px solid rgba(194,24,91,0.2)',background:'#fff',cursor:'pointer',transition:'all .2s',fontFamily:'DM Sans,sans-serif'}}
            onMouseEnter={e=>{e.currentTarget.style.border='2px solid #C2185B';e.currentTarget.style.background='#FFF0F5'}}
            onMouseLeave={e=>{e.currentTarget.style.border='2px solid rgba(194,24,91,0.2)';e.currentTarget.style.background='#fff'}}>
            <div style={{fontSize:'40px',marginBottom:'12px'}}>💗</div>
            <div style={{fontSize:'15px',fontWeight:'500',color:'#C2185B',marginBottom:'6px'}}>I'm a Bride-to-be</div>
            <div style={{fontSize:'12px',color:'#7B5E6B',lineHeight:1.5}}>Track, rate and compare your groom prospects</div>
          </button>

          <button onClick={()=>selectMode('he')} disabled={loading}
            style={{padding:'2rem 1rem',borderRadius:'16px',border:'2px solid rgba(21,101,192,0.2)',background:'#fff',cursor:'pointer',transition:'all .2s',fontFamily:'DM Sans,sans-serif'}}
            onMouseEnter={e=>{e.currentTarget.style.border='2px solid #1565C0';e.currentTarget.style.background='#E3F2FD'}}
            onMouseLeave={e=>{e.currentTarget.style.border='2px solid rgba(21,101,192,0.2)';e.currentTarget.style.background='#fff'}}>
            <div style={{fontSize:'40px',marginBottom:'12px'}}>💙</div>
            <div style={{fontSize:'15px',fontWeight:'500',color:'#1565C0',marginBottom:'6px'}}>I'm a Groom-to-be</div>
            <div style={{fontSize:'12px',color:'#7B5E6B',lineHeight:1.5}}>Track, rate and compare your bride prospects</div>
          </button>
        </div>

        <div style={{fontSize:'11px',color:'#B39DAE'}}>You can always change this later in settings</div>
        {loading && <div style={{marginTop:'1rem',fontSize:'13px',color:'#C2185B'}}>Setting up your experience...</div>}
      </div>
    </div>
  )
}

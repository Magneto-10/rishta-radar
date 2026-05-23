import React from 'react'
import { supabase } from '../lib/supabase'

export default function Landing() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
  }

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#FFF0F5 0%,#FFF8F0 100%)',fontFamily:'DM Sans,sans-serif'}}>
      <nav style={{padding:'1.25rem 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(194,24,91,0.1)'}}>
        <div style={{fontFamily:'Playfair Display,serif',fontSize:'22px',color:'#C2185B'}}>💍 Rishta Radar</div>
        <button onClick={handleLogin} style={{padding:'8px 20px',borderRadius:'20px',background:'#C2185B',color:'#fff',border:'none',cursor:'pointer',fontSize:'13px',fontWeight:'500'}}>Sign in with Google</button>
      </nav>

      <div style={{textAlign:'center',padding:'5rem 2rem 3rem'}}>
        <div style={{display:'inline-block',background:'#FCE4EC',color:'#C2185B',padding:'4px 16px',borderRadius:'20px',fontSize:'12px',fontWeight:'500',marginBottom:'1.5rem'}}>Free forever · No credit card needed</div>
        <h1 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(32px,5vw,56px)',color:'#2C1810',lineHeight:1.2,maxWidth:'700px',margin:'0 auto 1.25rem'}}>
          The smartest way to shortlist your
          <span style={{color:'#C2185B',fontStyle:'italic'}}> perfect match</span>
        </h1>
        <p style={{fontSize:'16px',color:'#7B5E6B',maxWidth:'520px',margin:'0 auto 2.5rem',lineHeight:1.7}}>
          Rishta season is chaotic. Spreadsheets, WhatsApp forwards, mammi's opinions — all over the place.
          Rishta Radar gives you one beautiful place to track, rate, and compare your prospects.
        </p>
        <button onClick={handleLogin} style={{padding:'14px 36px',borderRadius:'30px',background:'#C2185B',color:'#fff',border:'none',cursor:'pointer',fontSize:'15px',fontWeight:'500',boxShadow:'0 4px 20px rgba(194,24,91,0.3)'}}>
          Get started free →
        </button>
        <div style={{marginTop:'1rem',fontSize:'12px',color:'#B39DAE'}}>Sign in with Google · Takes 30 seconds</div>
      </div>

      <div style={{maxWidth:'900px',margin:'0 auto',padding:'3rem 2rem'}}>
        <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'28px',color:'#2C1810',textAlign:'center',marginBottom:'2.5rem'}}>How it works</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'1.5rem'}}>
          {[
            {icon:'➕',title:'Add prospects',desc:'Add each prospect with their details — job, family background, city, height and more'},
            {icon:'⭐',title:'Rate them',desc:'Score across 6 sections — Emotional Quotient, Family, Financial, Lifestyle, Future fit, and Fun'},
            {icon:'⚖️',title:'Compare and decide',desc:'Side by side comparison of background facts and scores. Let the data help your heart decide'},
          ].map((s,i)=>(
            <div key={i} style={{background:'#fff',border:'1px solid rgba(194,24,91,0.12)',borderRadius:'16px',padding:'1.5rem',textAlign:'center'}}>
              <div style={{fontSize:'32px',marginBottom:'1rem'}}>{s.icon}</div>
              <div style={{fontFamily:'Playfair Display,serif',fontSize:'16px',color:'#2C1810',marginBottom:'8px'}}>{s.title}</div>
              <div style={{fontSize:'13px',color:'#7B5E6B',lineHeight:1.6}}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{background:'#fff',padding:'3rem 2rem'}}>
        <div style={{maxWidth:'900px',margin:'0 auto'}}>
          <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'28px',color:'#2C1810',textAlign:'center',marginBottom:'2.5rem'}}>Everything you need</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'1rem'}}>
            {[
              {icon:'📋',title:'Kanban board',desc:'Track each prospect through stages — shortlisted, met, discussion, favourite'},
              {icon:'💯',title:'Smart scoring',desc:'6 sections, 24 questions. Scores update live as you rate'},
              {icon:'⚖️',title:'Side by side compare',desc:'Compare facts and scores of up to 5 prospects at once'},
              {icon:'✨',title:'Fun Zone',desc:'MIL compatibility meter, Instagram husband score, and more'},
              {icon:'🏠',title:'Family background',desc:'Record family type, income, living situation, city plans'},
              {icon:'🔒',title:'Private and secure',desc:'Your data is yours only. Nobody else can see your shortlist'},
            ].map((f,i)=>(
              <div key={i} style={{background:'#FFF0F5',border:'1px solid rgba(194,24,91,0.1)',borderRadius:'12px',padding:'1.25rem'}}>
                <div style={{fontSize:'24px',marginBottom:'8px'}}>{f.icon}</div>
                <div style={{fontSize:'13px',fontWeight:'500',color:'#2C1810',marginBottom:'4px'}}>{f.title}</div>
                <div style={{fontSize:'12px',color:'#7B5E6B',lineHeight:1.5}}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{textAlign:'center',padding:'3rem 2rem',background:'linear-gradient(135deg,#FFF0F5,#FFF8F0)'}}>
        <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'28px',color:'#2C1810',marginBottom:'1rem'}}>Made for you</h2>
        <p style={{fontSize:'15px',color:'#7B5E6B',maxWidth:'520px',margin:'0 auto 2rem',lineHeight:1.7}}>
          For women navigating arranged or semi-arranged marriages who want clarity, not chaos.
          Because the most important decision of your life deserves more than a WhatsApp chat.
        </p>
        <button onClick={handleLogin} style={{padding:'14px 36px',borderRadius:'30px',background:'#C2185B',color:'#fff',border:'none',cursor:'pointer',fontSize:'15px',fontWeight:'500',boxShadow:'0 4px 20px rgba(194,24,91,0.3)'}}>
          Start for free →
        </button>
      </div>

      <div style={{textAlign:'center',padding:'1.5rem',borderTop:'1px solid rgba(194,24,91,0.1)',fontSize:'12px',color:'#B39DAE'}}>
        💍 Rishta Radar · Made with love in India
      </div>
    </div>
  )
}
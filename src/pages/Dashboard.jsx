import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard({ session }) {
  const [prospects, setProspects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProspects()
  }, [])

  async function fetchProspects() {
    const { data, error } = await supabase
      .from('prospects')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setProspects(data || [])
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <div style={{minHeight:'100vh',background:'#FFFAF8',fontFamily:'DM Sans,sans-serif'}}>
      <nav style={{padding:'1rem 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(194,24,91,0.1)',background:'#fff'}}>
        <div style={{fontFamily:'Playfair Display,serif',fontSize:'20px',color:'#C2185B'}}>💍 Rishta Radar</div>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <span style={{fontSize:'13px',color:'#7B5E6B'}}>{session.user.email}</span>
          <button onClick={handleLogout} style={{padding:'6px 14px',borderRadius:'16px',background:'#FCE4EC',color:'#C2185B',border:'none',cursor:'pointer',fontSize:'12px'}}>Sign out</button>
        </div>
      </nav>
      <div style={{padding:'2rem',textAlign:'center'}}>
        {loading ? (
          <div style={{color:'#C2185B',fontSize:'14px'}}>Loading your prospects...</div>
        ) : (
          <div>
            <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'24px',color:'#2C1810',marginBottom:'1rem'}}>
              Welcome back! 💍
            </h2>
            <p style={{color:'#7B5E6B',fontSize:'14px'}}>
              You have {prospects.length} prospect{prospects.length !== 1 ? 's' : ''} tracked
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const ADMIN_EMAIL = 'pranay.dhone1025@gmail.com'

export default function Admin({ session }) {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.email !== ADMIN_EMAIL) return
    fetchStats()
  }, [])// eslint-disable-line

  async function fetchStats() {
    setLoading(true)
    const { data: profiles } = await supabase.from('profiles').select('*')
    const { data: prospects } = await supabase.from('prospects').select('*')
    const userMap = {}
    profiles?.forEach(p => { userMap[p.id] = { ...p, prospectCount: 0 } })
    prospects?.forEach(p => { if (userMap[p.user_id]) userMap[p.user_id].prospectCount++ })
    const userList = Object.values(userMap).sort((a,b) => b.prospectCount - a.prospectCount)
    setStats({
      totalUsers: profiles?.length || 0,
      totalProspects: prospects?.length || 0,
      sheUsers: profiles?.filter(p => p.mode === 'she').length || 0,
      heUsers: profiles?.filter(p => p.mode === 'he').length || 0,
      noMode: profiles?.filter(p => !p.mode).length || 0,
      avgProspects: prospects?.length && profiles?.length ? (prospects.length / profiles.length).toFixed(1) : 0,
    })
    setUsers(userList)
    setLoading(false)
  }

  if (session?.user?.email !== ADMIN_EMAIL) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'DM Sans,sans-serif'}}>
      <div style={{textAlign:'center',color:'#C62828'}}>
        <div style={{fontSize:'32px',marginBottom:'1rem'}}>🚫</div>
        <div>Access denied</div>
      </div>
    </div>
  )

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'DM Sans,sans-serif'}}>
      <div style={{textAlign:'center',color:'#C2185B'}}>
        <div style={{fontSize:'32px',marginBottom:'1rem'}}>📊</div>
        <div>Loading dashboard...</div>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#FFFAF8',fontFamily:'DM Sans,sans-serif',padding:'2rem'}}>
      <div style={{maxWidth:'1000px',margin:'0 auto'}}>
        <div style={{marginBottom:'2rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <div style={{fontFamily:'Playfair Display,serif',fontSize:'28px',color:'#2C1810'}}>📊 Rishta Radar Admin</div>
            <div style={{fontSize:'12px',color:'#7B5E6B',marginTop:'4px'}}>Last updated: {new Date().toLocaleString()}</div>
          </div>
          <button onClick={fetchStats} style={{padding:'8px 16px',borderRadius:'18px',background:'#C2185B',color:'#fff',border:'none',cursor:'pointer',fontFamily:'DM Sans,sans-serif',fontSize:'12px'}}>
            🔄 Refresh
          </button>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:'1rem',marginBottom:'2rem'}}>
          {[
            {label:'Total Users',value:stats.totalUsers,icon:'👥',color:'#C2185B'},
            {label:'Total Prospects',value:stats.totalProspects,icon:'💍',color:'#1565C0'},
            {label:'Bride-to-be',value:stats.sheUsers,icon:'💗',color:'#C2185B'},
            {label:'Groom-to-be',value:stats.heUsers,icon:'💙',color:'#1565C0'},
            {label:'Mode not set',value:stats.noMode,icon:'❓',color:'#F57F17'},
            {label:'Avg prospects/user',value:stats.avgProspects,icon:'📈',color:'#2E7D32'},
          ].map((s,i)=>(
            <div key={i} style={{background:'#fff',border:'1px solid rgba(194,24,91,0.13)',borderRadius:'16px',padding:'1.25rem',textAlign:'center'}}>
              <div style={{fontSize:'28px',marginBottom:'8px'}}>{s.icon}</div>
              <div style={{fontFamily:'Playfair Display,serif',fontSize:'28px',fontWeight:'600',color:s.color,lineHeight:1}}>{s.value}</div>
              <div style={{fontSize:'11px',color:'#7B5E6B',marginTop:'6px'}}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{background:'#fff',border:'1px solid rgba(194,24,91,0.13)',borderRadius:'16px',overflow:'hidden'}}>
          <div style={{padding:'1rem 1.25rem',borderBottom:'1px solid rgba(194,24,91,0.1)',background:'#FFF0F5'}}>
            <div style={{fontFamily:'Playfair Display,serif',fontSize:'18px',color:'#2C1810'}}>👤 All Users</div>
            <div style={{fontSize:'11px',color:'#7B5E6B',marginTop:'2px'}}>Sorted by most active</div>
          </div>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px'}}>
              <thead>
                <tr style={{background:'#FFF8F0'}}>
                  <th style={{textAlign:'left',padding:'10px 1rem',fontSize:'10px',fontWeight:'500',color:'#B39DAE',textTransform:'uppercase',letterSpacing:'.5px',borderBottom:'1px solid rgba(194,24,91,0.1)'}}>Email</th>
                  <th style={{textAlign:'center',padding:'10px 1rem',fontSize:'10px',fontWeight:'500',color:'#B39DAE',textTransform:'uppercase',letterSpacing:'.5px',borderBottom:'1px solid rgba(194,24,91,0.1)'}}>Mode</th>
                  <th style={{textAlign:'center',padding:'10px 1rem',fontSize:'10px',fontWeight:'500',color:'#B39DAE',textTransform:'uppercase',letterSpacing:'.5px',borderBottom:'1px solid rgba(194,24,91,0.1)'}}>Prospects</th>
                  <th style={{textAlign:'center',padding:'10px 1rem',fontSize:'10px',fontWeight:'500',color:'#B39DAE',textTransform:'uppercase',letterSpacing:'.5px',borderBottom:'1px solid rgba(194,24,91,0.1)'}}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u,i)=>(
                  <tr key={u.id} style={{borderBottom:'1px solid rgba(194,24,91,0.08)',background:i%2===0?'#fff':'#FFFAF8'}}>
                    <td style={{padding:'10px 1rem',color:'#2C1810'}}>{u.email||'—'}</td>
                    <td style={{textAlign:'center',padding:'10px 1rem'}}>
                      <span style={{fontSize:'13px',padding:'2px 10px',borderRadius:'10px',background:u.mode==='she'?'#FCE4EC':u.mode==='he'?'#E3F2FD':'#F5F5F5',color:u.mode==='she'?'#C2185B':u.mode==='he'?'#1565C0':'#9E9E9E'}}>
                        {u.mode==='she'?'💗 Bride-to-be':u.mode==='he'?'💙 Groom-to-be':'Not set'}
                      </span>
                    </td>
                    <td style={{textAlign:'center',padding:'10px 1rem',fontWeight:'600',color:u.prospectCount>0?'#C2185B':'#B39DAE'}}>{u.prospectCount}</td>
                    <td style={{textAlign:'center',padding:'10px 1rem',color:'#7B5E6B',fontSize:'11px'}}>{u.created_at?new Date(u.created_at).toLocaleDateString('en-IN'):'—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

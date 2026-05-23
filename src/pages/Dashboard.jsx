import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// ── SECTIONS ─────────────────────────────────────────────────────────────────
const DEFAULT_SECTIONS = [
  {
    key:'emotional', icon:'💛', label:'Emotional Quotient',
    color:'#AD1457', desc:'How emotionally aware and mature is he?',
    questions:[
      {k:'eq_maturity', label:'Handles conflicts calmly without getting defensive', hint:'Does he stay composed during disagreements?'},
      {k:'eq_empathy', label:'Empathetic and understanding of your feelings', hint:'Does he listen and validate your emotions?'},
      {k:'eq_comm', label:'Communicates openly and honestly', hint:'Does he express himself clearly and respectfully?'},
      {k:'eq_patience', label:'Patient and non-reactive under stress', hint:'How does he behave when things go wrong?'},
    ]
  },
  {
    key:'family', icon:'🏠', label:'Family & Values',
    color:'#C2185B', desc:'Shared values, family orientation, and cultural alignment',
    questions:[
      {k:'fam_values', label:'Shares similar values and life principles', hint:'Are your core beliefs aligned?'},
      {k:'fam_compat', label:'His family is compatible with yours', hint:'Will families get along well?'},
      {k:'fam_respect', label:'Respectful to elders, parents, and family', hint:'How does he treat his own family?'},
      {k:'fam_religion', label:'Religious and cultural alignment', hint:'Same practices, festivals, traditions?'},
    ]
  },
  {
    key:'financial', icon:'💰', label:'Financial & Career',
    color:'#1D9E75', desc:'Stability, ambition, and financial responsibility',
    questions:[
      {k:'fin_stability', label:'Has a stable and reliable income', hint:'Is his financial situation secure?'},
      {k:'fin_ambition', label:'Ambitious and has clear career goals', hint:'Is he working towards something meaningful?'},
      {k:'fin_responsibl', label:"Financially responsible — saves, doesn't overspend", hint:'Does he manage money wisely?'},
      {k:'fin_provider', label:'Willing to be an equal financial partner', hint:'Comfortable with shared financial responsibilities?'},
    ]
  },
  {
    key:'lifestyle', icon:'✈️', label:'Lifestyle & Compatibility',
    color:'#1565C0', desc:'Day-to-day life, hobbies, and personal habits',
    questions:[
      {k:'ls_humor', label:'Makes you laugh and keeps things fun', hint:'Is he genuinely funny and playful?'},
      {k:'ls_social', label:'Social life and friend circle is compatible', hint:'Do you enjoy similar social settings?'},
      {k:'ls_travel', label:'Similar travel and adventure appetite', hint:'Does he enjoy similar activities as you?'},
      {k:'ls_habits', label:'Healthy lifestyle habits — fitness, food, sleep', hint:'Does his daily routine match yours?'},
    ]
  },
  {
    key:'future', icon:'💍', label:'Future & Long-term Fit',
    color:'#6A1B9A', desc:'Alignment on marriage, children, and life goals',
    questions:[
      {k:'fut_goals', label:'Aligned on life goals — where to live, lifestyle', hint:'Do your big life plans match?'},
      {k:'fut_kids', label:'Same views on children and parenting', hint:'On the same page about family planning?'},
      {k:'fut_respect', label:'Treats you as an equal partner', hint:'Does he genuinely respect your opinions and career?'},
      {k:'fut_milcompat', label:'Will likely get along well with your parents', hint:'Mammi and papa test 😄'},
    ]
  },
  {
    key:'fun', icon:'🎉', label:'Fun & MIL Compatibility',
    color:'#E65100', desc:'The fun stuff — vibes, humour, and the all-important mammi test',
    questions:[
      {k:'fun_milvibes', label:'His mom seems sweet and not too interfering', hint:'First impressions of MIL? Controlling or chill?'},
      {k:'fun_milstyle', label:"MIL's lifestyle is compatible with yours", hint:'Will you be able to get along with her day-to-day?'},
      {k:'fun_spontaneous', label:'He is spontaneous and knows how to surprise you', hint:'Flowers for no reason? Random plans? Or predictable?'},
      {k:'fun_boring', label:'You never feel bored around him', hint:'Is there always something to talk about?'},
      {k:'fun_socmed', label:"His social media presence doesn't embarrass you", hint:'Cringe posts? Oversharing? Or totally fine?'},
      {k:'fun_foodie', label:'Compatible on food — will happily eat what you cook', hint:'Fussy eater or will eat anything you make?'},
    ]
  },
]

function loadSections() {
  try {
    const saved = localStorage.getItem('rishta_sections_v4')
    if (saved) {
      const parsed = JSON.parse(saved)
      return DEFAULT_SECTIONS.map((sec, i) => parsed[i] ? {...sec, questions: parsed[i].questions} : sec)
    }
  } catch(e) {}
  return JSON.parse(JSON.stringify(DEFAULT_SECTIONS))
}

function saveSections(secs) {
  try { localStorage.setItem('rishta_sections_v4', JSON.stringify(secs.map(s=>({key:s.key,questions:s.questions})))) } catch(e) {}
}

const KCOLS = [
  {key:'shortlisted', label:'Shortlisted', icon:'🎯', bg:'#FCE4EC', pill:'#C2185B', colBg:'#fff5f8'},
  {key:'meeting_pending', label:'Meeting pending', icon:'📅', bg:'#FFF8E1', pill:'#F57F17', colBg:'#fffdf5'},
  {key:'meeting_done', label:'Met once', icon:'☕', bg:'#E8F5E9', pill:'#2E7D32', colBg:'#f5fff7'},
  {key:'discussion', label:'Discussion going on', icon:'💬', bg:'#EDE7F6', pill:'#6A1B9A', colBg:'#f8f5ff'},
  {key:'favourite', label:'Favourite ⭐', icon:'⭐', bg:'#FFF8E1', pill:'#F57F17', colBg:'#fffdf0'},
  {key:'eliminated', label:'Eliminated', icon:'❌', bg:'#FFEBEE', pill:'#C62828', colBg:'#fff8f8'},
]

const SWATCHES = ['#FCE4EC','#F8BBD0','#FFF0F5','#FFF8E1','#FFF3E0','#FAEEDA','#E8F5E9','#E0F2F1','#E3F2FD','#EDE7F6','#F3E5F5','#FBE9E7','#EFEBE9','#FFFDE7','#E8EAF6','#E0F7FA']
const EMOJIS = ['👨‍💻','👨‍⚕️','👨‍🍳','👨‍🎨','👨‍🏫','👨‍💼','👨‍🔬','👨‍✈️','👨‍⚖️','🧔','👱','🙋','🤵','👮','👷','🌟','✨','🎯','🚀','🏆','💡','🦁','🐯','🦊','🦅','🦋','💎','👑','🎸','⚽','🏋️','🎮','📚','🎭','🌈','🍕','☕','🎻']

// ── HELPERS ──────────────────────────────────────────────────────────────────
function spill(st) {
  const m = {
    shortlisted:{l:'Shortlisted',bg:'#FCE4EC',c:'#C2185B'},
    meeting_pending:{l:'Meeting pending',bg:'#FFF8E1',c:'#F57F17'},
    meeting_done:{l:'Met once',bg:'#E8F5E9',c:'#2E7D32'},
    discussion:{l:'Discussion going on',bg:'#EDE7F6',c:'#6A1B9A'},
    favourite:{l:'⭐ Favourite',bg:'#FFF8E1',c:'#F57F17'},
    eliminated:{l:'Eliminated',bg:'#FFEBEE',c:'#C62828'},
  }
  const s = m[st] || m.shortlisted
  return <span style={{display:'inline-block',fontSize:'10px',padding:'2px 9px',borderRadius:'16px',background:s.bg,color:s.c}}>{s.l}</span>
}

function secScore(p, sec) {
  const vals = sec.questions.map(q => (p.params||{})[q.k] || 0)
  return Math.round(vals.reduce((a,b)=>a+b,0) / vals.length)
}

function gsc(p, sections) {
  const allVals = sections.flatMap(sec => sec.questions.map(q => (p.params||{})[q.k] || 0))
  return Math.round(allVals.reduce((a,b)=>a+b,0) / allVals.length)
}

function gsty(s) {
  return s>=82?{bg:'#E8F5E9',col:'#2E7D32'}:s>=70?{bg:'#FFF8E1',col:'#F57F17'}:{bg:'#FFEBEE',col:'#C62828'}
}

function isUnrated(p, sections) {
  return sections.flatMap(s=>s.questions).every(q=>!(p.params||{})[q.k])
}

function defaultParams(sections) {
  return Object.fromEntries(sections.flatMap(s=>s.questions).map(q=>[q.k,0]))
}

// ── HEART SLIDER STYLE ───────────────────────────────────────────────────────
const heartThumb = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23C2185B' d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/%3E%3C/svg%3E")`

const sliderStyle = {
  WebkitAppearance: 'none',
  appearance: 'none',
  width: '100%',
  height: '4px',
  borderRadius: '2px',
  outline: 'none',
  cursor: 'pointer',
}

function HeartSlider({ value, onChange, color }) {
  const pct = Math.round((value / 100) * 100)
  const bg = `linear-gradient(to right, ${color||'#C2185B'} ${pct}%, #f5e6ec ${pct}%)`

  return (
    <input
      type="range" min="0" max="100" step="1"
      value={value}
      onChange={onChange}
      style={{
        ...sliderStyle,
        background: bg,
      }}
    />
  )
}

// inject global CSS for heart thumb
const heartCSS = `
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 24px; height: 24px;
  background: transparent;
  cursor: pointer;
  margin-top: -10px;
  background-image: ${heartThumb};
  background-repeat: no-repeat;
  background-position: center;
  background-size: 22px;
}
input[type=range]::-moz-range-thumb {
  width: 24px; height: 24px;
  border: none; border-radius: 0;
  background: transparent;
  cursor: pointer;
  background-image: ${heartThumb};
  background-repeat: no-repeat;
  background-position: center;
  background-size: 22px;
}
input[type=range]::-webkit-slider-runnable-track { height: 4px; border-radius: 2px; }
.q-edit-btn { font-size: 14px; cursor: pointer; opacity: 0; margin-left: 6px; transition: opacity .15s; vertical-align: middle; padding: 2px 5px; border-radius: 5px; line-height: 1; }
.q-edit-btn:hover { background: #FCE4EC; }
.q-row:hover .q-edit-btn { opacity: 1; }
`

// ── MAIN DASHBOARD ────────────────────────────────────────────────────────────
export default function Dashboard({ session }) {
  const [sections, setSections] = useState(loadSections)
  const [prospects, setProspects] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState('overview')
  const [ovTab, setOvTab] = useState('kanban')
  const [selId, setSelId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editProspect, setEditProspect] = useState(null)
  const [showDelConfirm, setShowDelConfirm] = useState(null)
  const [cmpSelected, setCmpSelected] = useState([])
  const [cmpQualOpen, setCmpQualOpen] = useState(false)
  const [cmpQuantOpen, setCmpQuantOpen] = useState(false)
  const [dragId, setDragId] = useState(null)
  const [emojiTrayOpen, setEmojiTrayOpen] = useState(false)
  const [form, setForm] = useState({})

  const fetchProspects = useCallback(async () => {
    const { data } = await supabase.from('prospects').select('*').order('created_at',{ascending:false})
    setProspects(data || [])
    setLoading(false)
    if (data && data.length > 0 && !selId) setSelId(data[0].id)
  }, [selId])

  useEffect(() => { fetchProspects() }, []) // eslint-disable-line

  // Section management
  function updateSections(newSecs) {
    setSections(newSecs)
    saveSections(newSecs)
  }

  function editQLabel(si, qi) {
    const current = sections[si].questions[qi].label
    const newLabel = window.prompt('Edit question text:', current)
    if (newLabel && newLabel.trim() && newLabel.trim() !== current) {
      const newSecs = sections.map((s,i) => i===si ? {...s, questions: s.questions.map((q,j)=>j===qi?{...q,label:newLabel.trim()}:q)} : s)
      updateSections(newSecs)
    }
  }

  function deleteQ(si, qi) {
    if (sections[si].questions.length <= 2) { alert('Each section needs at least 2 questions.'); return }
    if (!window.confirm('Delete this question?')) return
    const newSecs = sections.map((s,i) => i===si ? {...s, questions: s.questions.filter((_,j)=>j!==qi)} : s)
    updateSections(newSecs)
  }

  function addQ(si) {
    const label = window.prompt('Enter your new question:', 'e.g. He is kind to strangers')
    if (!label || !label.trim()) return
    const hint = window.prompt('Add a short hint (optional):', 'e.g. How does he treat waitstaff?') || ''
    const k = `custom_${si}_${Date.now()}`
    const newSecs = sections.map((s,i) => i===si ? {...s, questions:[...s.questions,{k,label:label.trim(),hint:hint.trim()}]} : s)
    updateSections(newSecs)
    // give all prospects default 0 for new key
    setProspects(prev => prev.map(p => ({...p, params:{...(p.params||{}), [k]:0}})))
  }

  async function saveProspect() {
    if (!form.name) return alert('Please enter a name!')
    const payload = {
      user_id: session.user.id,
      name: form.name, age: parseInt(form.age)||28, city: form.city||'',
      hometown: form.hometown||'', job: form.job||'', company: form.company||'',
      edu: form.edu||'', height: form.height||'', zodiac: form.zodiac||'Aries',
      emoji: form.emoji||'👤', color: form.color||'#FCE4EC',
      status: form.status||'shortlisted',
      greens: form.greens ? form.greens.split(',').map(x=>x.trim()).filter(Boolean) : [],
      flags: form.flags ? form.flags.split(',').map(x=>x.trim()).filter(Boolean) : [],
      vibes: form.vibes ? form.vibes.split(',').map(x=>x.trim()).filter(Boolean) : [],
      notes: form.notes||'', dealbreakers: [],
      famtype: form.famtype||'', famsize: form.famsize||'',
      parents: form.parents||'', siblings: form.siblings||'',
      sibst: form.sibst||'', income: form.income||'',
      living: form.living||'', cityplan: form.cityplan||'',
      params: editProspect ? editProspect.params : defaultParams(sections)
    }
    if (editProspect) {
      await supabase.from('prospects').update(payload).eq('id', editProspect.id)
    } else {
      const { data } = await supabase.from('prospects').insert(payload).select()
      if (data && data[0]) setSelId(data[0].id)
    }
    setShowModal(false); setEditProspect(null); setForm({})
    fetchProspects()
  }

  async function deleteProspect(id) {
    await supabase.from('prospects').delete().eq('id', id)
    setShowDelConfirm(null)
    if (selId === id) setSelId(null)
    fetchProspects()
  }

  async function updateStatus(id, status) {
    await supabase.from('prospects').update({status}).eq('id', id)
    setProspects(prev => prev.map(p => p.id===id ? {...p,status} : p))
  }

  async function updateParam(id, key, val) {
    const p = prospects.find(x=>x.id===id)
    if (!p) return
    const params = {...(p.params||{}), [key]: parseInt(val)}
    setProspects(prev => prev.map(x => x.id===id ? {...x,params} : x))
    await supabase.from('prospects').update({params}).eq('id', id)
  }

  async function updateNote(id, notes) {
    await supabase.from('prospects').update({notes}).eq('id', id)
  }

  function openAdd() {
    setEditProspect(null)
    setForm({color:'#FCE4EC', emoji:'👤', status:'shortlisted', zodiac:'Aries'})
    setShowModal(true); setEmojiTrayOpen(false)
  }

  function openEdit(p) {
    setEditProspect(p)
    setForm({
      name:p.name, age:p.age, city:p.city, hometown:p.hometown,
      job:p.job, company:p.company, edu:p.edu, height:p.height,
      zodiac:p.zodiac, emoji:p.emoji, color:p.color, status:p.status,
      greens:(p.greens||[]).join(', '), flags:(p.flags||[]).join(', '),
      vibes:(p.vibes||[]).join(', '), notes:p.notes||'',
      famtype:p.famtype||'', famsize:p.famsize||'', parents:p.parents||'',
      siblings:p.siblings||'', sibst:p.sibst||'', income:p.income||'',
      living:p.living||'', cityplan:p.cityplan||''
    })
    setShowModal(true); setEmojiTrayOpen(false)
  }

  function selAndView(id) { setSelId(id); setOvTab('detail'); setPage('overview') }
  const fi = (id) => (e) => setForm(f=>({...f,[id]:e.target.value}))
  const selP = prospects.find(x=>x.id===selId)

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#FFF0F5',fontFamily:'DM Sans,sans-serif'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:'32px',marginBottom:'1rem'}}>💍</div>
        <div style={{color:'#C2185B',fontSize:'14px'}}>Loading your prospects...</div>
      </div>
    </div>
  )

  const stats = {
    total:prospects.length,
    shortlisted:prospects.filter(p=>p.status==='shortlisted').length,
    met:prospects.filter(p=>p.status==='meeting_done').length,
    pending:prospects.filter(p=>p.status==='meeting_pending').length,
    eliminated:prospects.filter(p=>p.status==='eliminated').length,
  }

  return (
    <div style={{display:'flex',minHeight:'100vh',fontFamily:'DM Sans,sans-serif',background:'#FFFAF8'}}>
      <style>{heartCSS}</style>

      {/* SIDEBAR */}
      <aside style={{width:'240px',minWidth:'240px',background:'linear-gradient(160deg,#fff0f5,#fff8f0)',borderRight:'1px solid rgba(194,24,91,0.13)',display:'flex',flexDirection:'column',position:'sticky',top:0,height:'100vh',overflowY:'auto'}}>
        <div style={{padding:'1.25rem 1rem .75rem',borderBottom:'1px solid rgba(194,24,91,0.13)'}}>
          <div style={{fontFamily:'Playfair Display,serif',fontSize:'18px',color:'#C2185B'}}>💍 Rishta Radar</div>
          <div style={{fontSize:'10px',color:'#7B5E6B',marginTop:'2px'}}>{session.user.email}</div>
        </div>
        {[
          {id:'overview',icon:'📊',label:'Overview'},
          {id:'prospects',icon:'🎯',label:'All Prospects'},
          {id:'leaderboard',icon:'🏆',label:'Leaderboard'},
          {id:'compare',icon:'⚖️',label:'Compare'},
          {id:'funzone',icon:'✨',label:'Fun Zone'},
          {id:'notes',icon:'📝',label:'My Notes'},
        ].map(n=>(
          <div key={n.id} onClick={()=>setPage(n.id)}
            style={{display:'flex',alignItems:'center',gap:'9px',padding:'8px 1rem',fontSize:'13px',color:page===n.id?'#C2185B':'#7B5E6B',cursor:'pointer',borderRadius:'8px',margin:'1px 7px',background:page===n.id?'#FCE4EC':'transparent',fontWeight:page===n.id?'500':'400'}}>
            <span style={{fontSize:'15px'}}>{n.icon}</span>{n.label}
          </div>
        ))}
        <div style={{padding:'.75rem 1rem .3rem',fontSize:'9px',fontWeight:'500',color:'#B39DAE',letterSpacing:'1px',textTransform:'uppercase'}}>Prospects</div>
        <div style={{flex:1,padding:'.4rem 7px .75rem',overflowY:'auto'}}>
          {prospects.map(p=>{
            const s=gsc(p,sections),st=gsty(s),unr=isUnrated(p,sections)
            return (
              <div key={p.id} onClick={()=>{setSelId(p.id);setPage('overview');setOvTab('detail')}}
                style={{display:'flex',alignItems:'center',gap:'7px',padding:'7px 9px',borderRadius:'9px',cursor:'pointer',marginBottom:'2px',background:selId===p.id?'#FCE4EC':'transparent',borderLeft:selId===p.id?'3px solid #C2185B':'3px solid transparent',opacity:p.status==='eliminated'?0.4:1}}>
                <div style={{width:'28px',height:'28px',borderRadius:'50%',background:p.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',flexShrink:0}}>{p.emoji}</div>
                <div style={{fontSize:'12px',fontWeight:'500',color:'#2C1810',flex:1,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{p.name}</div>
                <span style={{fontSize:'10px',fontWeight:'500',padding:'2px 5px',borderRadius:'7px',background:unr?'#F5F5F5':st.bg,color:unr?'#B39DAE':st.col}}>{unr?'—':s}</span>
              </div>
            )
          })}
        </div>
        <div style={{padding:'.6rem 1rem',borderTop:'1px solid rgba(194,24,91,0.13)',display:'flex',flexDirection:'column',gap:'6px'}}>
          <button onClick={openAdd} style={{width:'100%',padding:'8px',borderRadius:'9px',background:'#C2185B',color:'#fff',border:'none',cursor:'pointer',fontSize:'12px',fontWeight:'500'}}>+ Add Prospect</button>
          <button onClick={()=>supabase.auth.signOut()} style={{width:'100%',padding:'6px',borderRadius:'9px',background:'#FCE4EC',color:'#C2185B',border:'none',cursor:'pointer',fontSize:'11px'}}>Sign out</button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{flex:1,padding:'1.75rem',overflowY:'auto',minWidth:0}}>

        {/* OVERVIEW */}
        {page==='overview' && (
          <div>
            <div style={{marginBottom:'1.25rem'}}>
              <div style={{fontFamily:'Playfair Display,serif',fontSize:'24px',color:'#2C1810'}}>The Rishta Radar ✨</div>
              <div style={{fontSize:'12px',color:'#7B5E6B',marginTop:'3px'}}>Organised, fun, and surprisingly scientific groom shortlisting</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'10px',marginBottom:'1.25rem'}}>
              {[
                {n:stats.total,l:'Total',c:'#C2185B'},{n:stats.shortlisted,l:'Shortlisted',c:'#C2185B'},
                {n:stats.met,l:'Met once',c:'#2E7D32'},{n:stats.pending,l:'Pending',c:'#F57F17'},
                {n:stats.eliminated,l:'Eliminated',c:'#C62828'},
              ].map((s,i)=>(
                <div key={i} style={{background:'#fff',border:'1px solid rgba(194,24,91,0.13)',borderRadius:'10px',padding:'.75rem',textAlign:'center'}}>
                  <div style={{fontSize:'22px',fontWeight:'600',color:s.c,fontFamily:'Playfair Display,serif'}}>{s.n}</div>
                  <div style={{fontSize:'10px',color:'#7B5E6B',marginTop:'1px'}}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:'5px',marginBottom:'1.25rem'}}>
              {['kanban','detail'].map(t=>(
                <button key={t} onClick={()=>setOvTab(t)}
                  style={{padding:'6px 14px',borderRadius:'18px',fontSize:'12px',border:'1px solid rgba(194,24,91,0.13)',cursor:'pointer',background:ovTab===t?'#C2185B':'#fff',color:ovTab===t?'#fff':'#7B5E6B',fontFamily:'DM Sans,sans-serif'}}>
                  {t==='kanban'?'Card view':'Profile & Scores'}
                </button>
              ))}
            </div>
            {ovTab==='kanban' && <KanbanView prospects={prospects} sections={sections} onMove={updateStatus} onSelect={selAndView} dragId={dragId} setDragId={setDragId} />}
            {ovTab==='detail' && <DetailView p={selP} sections={sections} onParamChange={updateParam} onStatusChange={updateStatus} onEdit={openEdit} onDelete={(id)=>setShowDelConfirm(id)} onEditQ={editQLabel} onDeleteQ={deleteQ} onAddQ={addQ} />}
          </div>
        )}

        {/* ALL PROSPECTS */}
        {page==='prospects' && (
          <div>
            <div style={{marginBottom:'1.25rem'}}>
              <div style={{fontFamily:'Playfair Display,serif',fontSize:'24px',color:'#2C1810'}}>All Prospects</div>
              <div style={{fontSize:'12px',color:'#7B5E6B',marginTop:'3px'}}>Rate, edit, or delete each candidate</div>
            </div>
            {prospects.map(p=>(
              <div key={p.id} style={{background:'#fff',border:'1px solid rgba(194,24,91,0.13)',borderRadius:'16px',padding:'1.1rem',marginBottom:'14px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'.85rem'}}>
                  <div style={{fontSize:'28px',background:p.color,borderRadius:'50%',width:'48px',height:'48px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{p.emoji}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:'15px',fontWeight:'500'}}>{p.name}</div>
                    <div style={{fontSize:'11px',color:'#7B5E6B'}}>{p.job} · {p.city} · {p.age}y</div>
                    {spill(p.status)}
                  </div>
                  <div style={{textAlign:'center'}}>
                    <div style={{fontSize:'24px',fontWeight:'600',fontFamily:'Playfair Display,serif',color:gsty(gsc(p,sections)).col}}>{isUnrated(p,sections)?'—':gsc(p,sections)}</div>
                    <div style={{fontSize:'9px',color:'#B39DAE'}}>score</div>
                  </div>
                </div>
                <SectionSliders p={p} sections={sections} prefix={`ap${p.id}`} onParamChange={updateParam} twoCol={true} onEditQ={editQLabel} onDeleteQ={deleteQ} onAddQ={addQ} />
                <div style={{display:'flex',gap:'7px',marginTop:'12px',flexWrap:'wrap'}}>
                  <button onClick={()=>openEdit(p)} style={{padding:'7px 14px',borderRadius:'18px',fontSize:'12px',cursor:'pointer',border:'none',background:'#C2185B',color:'#fff',fontFamily:'DM Sans,sans-serif'}}>✏️ Edit</button>
                  <button onClick={()=>setShowDelConfirm(p.id)} style={{padding:'7px 14px',borderRadius:'18px',fontSize:'12px',cursor:'pointer',border:'1px solid #ffcc02',background:'#fff3e0',color:'#e65100',fontFamily:'DM Sans,sans-serif'}}>🗑️ Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LEADERBOARD */}
        {page==='leaderboard' && (
          <div>
            <div style={{marginBottom:'1.25rem'}}>
              <div style={{fontFamily:'Playfair Display,serif',fontSize:'24px',color:'#2C1810'}}>🏆 Leaderboard</div>
            </div>
            <div style={{background:'#fff',border:'1px solid rgba(194,24,91,0.13)',borderRadius:'16px',padding:'1.1rem'}}>
              {[...prospects].sort((a,b)=>gsc(b,sections)-gsc(a,sections)).map((p,i)=>{
                const s=gsc(p,sections),st=gsty(s),unr=isUnrated(p,sections)
                const rc=i===0?'#F57F17':i===1?'#78909C':i===2?'#8D6E63':'#B39DAE'
                return (
                  <div key={p.id} style={{display:'flex',alignItems:'center',gap:'10px',padding:'11px 1rem',borderBottom:'1px solid rgba(194,24,91,0.1)'}}>
                    <div style={{fontFamily:'Playfair Display,serif',fontSize:'18px',width:'24px',textAlign:'center',color:rc}}>{i+1}</div>
                    <div style={{fontSize:'24px',background:p.color,borderRadius:'50%',width:'38px',height:'38px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{p.emoji}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:'13px',fontWeight:'500'}}>{p.name}</div>
                      <div style={{fontSize:'11px',color:'#7B5E6B'}}>{p.job} · {p.city}</div>
                      {spill(p.status)}
                    </div>
                    <div style={{textAlign:'center'}}>
                      <div style={{fontSize:'22px',fontWeight:'600',fontFamily:'Playfair Display,serif',color:unr?'#B39DAE':st.col}}>{unr?'—':s}</div>
                      <div style={{fontSize:'9px',color:'#B39DAE'}}>/100</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* COMPARE */}
        {page==='compare' && (
          <CompareView prospects={prospects} sections={sections} cmpSelected={cmpSelected} setCmpSelected={setCmpSelected} cmpQualOpen={cmpQualOpen} setCmpQualOpen={setCmpQualOpen} cmpQuantOpen={cmpQuantOpen} setCmpQuantOpen={setCmpQuantOpen} />
        )}

        {/* FUN ZONE */}
        {page==='funzone' && <FunZone prospects={prospects} sections={sections} />}

        {/* NOTES */}
        {page==='notes' && (
          <div>
            <div style={{marginBottom:'1.25rem'}}>
              <div style={{fontFamily:'Playfair Display,serif',fontSize:'24px',color:'#2C1810'}}>Notes & Gut Feelings 📝</div>
            </div>
            {prospects.map(p=>(
              <div key={p.id} style={{background:'#fff',border:'1px solid rgba(194,24,91,0.13)',borderRadius:'16px',padding:'1.1rem',marginBottom:'11px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'.75rem'}}>
                  <div style={{fontSize:'22px',background:p.color,borderRadius:'50%',width:'38px',height:'38px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{p.emoji}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:'14px',fontWeight:'500'}}>{p.name}</div>
                    <div style={{fontSize:'11px',color:'#7B5E6B'}}>{p.job} · {p.city}</div>
                  </div>
                  {spill(p.status)}
                </div>
                <textarea defaultValue={p.notes||''} placeholder="Gut feeling, what mammi said, vibes from meeting..."
                  onBlur={e=>updateNote(p.id,e.target.value)}
                  style={{width:'100%',padding:'9px',border:'1px solid rgba(194,24,91,0.13)',borderRadius:'10px',fontFamily:'DM Sans,sans-serif',fontSize:'12px',color:'#2C1810',resize:'vertical',background:'#FFF0F5',minHeight:'65px',lineHeight:1.6}} />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(44,24,16,.4)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',borderRadius:'16px',padding:'1.75rem',width:'560px',maxWidth:'95vw',maxHeight:'90vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(194,24,91,.15)'}}>
            <div style={{fontFamily:'Playfair Display,serif',fontSize:'19px',color:'#2C1810',marginBottom:'1.25rem'}}>{editProspect?'Edit Prospect ✏️':'Add New Prospect 💌'}</div>

            <div style={{marginBottom:'12px'}}>
              <div style={{fontSize:'11px',fontWeight:'500',color:'#7B5E6B',marginBottom:'6px'}}>Avatar — tap to change</div>
              <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                <div onClick={()=>setEmojiTrayOpen(!emojiTrayOpen)}
                  style={{fontSize:'32px',width:'56px',height:'56px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',border:'2px solid rgba(194,24,91,0.2)',background:'#FFF0F5'}}>
                  {form.emoji||'👤'}
                </div>
                <div style={{fontSize:'11px',color:'#7B5E6B'}}>Tap the circle to pick</div>
              </div>
              {emojiTrayOpen && (
                <div style={{display:'flex',flexWrap:'wrap',gap:'5px',marginTop:'8px',padding:'10px',background:'#FFF0F5',borderRadius:'10px',border:'1px solid rgba(194,24,91,0.13)',maxHeight:'150px',overflowY:'auto'}}>
                  {EMOJIS.map(e=>(
                    <span key={e} onClick={()=>{setForm(f=>({...f,emoji:e}));setEmojiTrayOpen(false)}}
                      style={{fontSize:'22px',cursor:'pointer',padding:'3px',borderRadius:'7px',background:form.emoji===e?'#FCE4EC':'transparent'}}>
                      {e}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
              {[
                {id:'name',label:'Name *',placeholder:'e.g. Rahul S.'},
                {id:'age',label:'Age',placeholder:'28',type:'number'},
                {id:'city',label:'City',placeholder:'Mumbai'},
                {id:'hometown',label:'Hometown',placeholder:'Jaipur'},
                {id:'job',label:'Job title',placeholder:'Software Engineer'},
                {id:'company',label:'Company',placeholder:'Google, Self, etc.'},
                {id:'edu',label:'Education',placeholder:'IIT, MBA, MBBS...'},
              ].map(f=>(
                <div key={f.id} style={{display:'flex',flexDirection:'column',gap:'4px'}}>
                  <label style={{fontSize:'11px',fontWeight:'500',color:'#7B5E6B'}}>{f.label}</label>
                  <input value={form[f.id]||''} onChange={fi(f.id)} placeholder={f.placeholder} type={f.type||'text'}
                    style={{padding:'7px 10px',border:'1px solid rgba(194,24,91,0.13)',borderRadius:'10px',fontFamily:'DM Sans,sans-serif',fontSize:'12px',color:'#2C1810',background:'#FFF0F5'}} />
                </div>
              ))}

              <div style={{display:'flex',flexDirection:'column',gap:'4px'}}>
                <label style={{fontSize:'11px',fontWeight:'500',color:'#7B5E6B'}}>Height</label>
                <select value={form.height||''} onChange={fi('height')} style={{padding:'7px 10px',border:'1px solid rgba(194,24,91,0.13)',borderRadius:'10px',fontFamily:'DM Sans,sans-serif',fontSize:'12px',color:'#2C1810',background:'#FFF0F5',cursor:'pointer'}}>
                  <option value="">Not specified</option>
                  {["4'11\" (150 cm)","5'0\" (152 cm)","5'1\" (155 cm)","5'2\" (157 cm)","5'3\" (160 cm)","5'4\" (163 cm)","5'5\" (165 cm)","5'6\" (168 cm)","5'7\" (170 cm)","5'8\" (173 cm)","5'9\" (175 cm)","5'10\" (178 cm)","5'11\" (180 cm)","6'0\" (183 cm)","6'1\" (185 cm)","6'2\" (188 cm)","6'3\" (191 cm)","6'4\" (193 cm)","6'5\" (196 cm)"].map(h=><option key={h}>{h}</option>)}
                </select>
              </div>

              <div style={{display:'flex',flexDirection:'column',gap:'4px'}}>
                <label style={{fontSize:'11px',fontWeight:'500',color:'#7B5E6B'}}>Zodiac</label>
                <select value={form.zodiac||'Aries'} onChange={fi('zodiac')} style={{padding:'7px 10px',border:'1px solid rgba(194,24,91,0.13)',borderRadius:'10px',fontFamily:'DM Sans,sans-serif',fontSize:'12px',color:'#2C1810',background:'#FFF0F5',cursor:'pointer'}}>
                  {['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'].map(z=><option key={z}>{z}</option>)}
                </select>
              </div>

              <div style={{display:'flex',flexDirection:'column',gap:'4px'}}>
                <label style={{fontSize:'11px',fontWeight:'500',color:'#7B5E6B'}}>Status</label>
                <select value={form.status||'shortlisted'} onChange={fi('status')} style={{padding:'7px 10px',border:'1px solid rgba(194,24,91,0.13)',borderRadius:'10px',fontFamily:'DM Sans,sans-serif',fontSize:'12px',color:'#2C1810',background:'#FFF0F5',cursor:'pointer'}}>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="meeting_pending">Meeting pending</option>
                  <option value="meeting_done">Met once</option>
                  <option value="discussion">Discussion going on</option>
                  <option value="favourite">⭐ Favourite</option>
                  <option value="eliminated">Eliminated</option>
                </select>
              </div>
            </div>

            <div style={{fontSize:'10px',fontWeight:'500',color:'#B39DAE',letterSpacing:'.8px',textTransform:'uppercase',margin:'14px 0 8px',paddingTop:'4px',borderTop:'1px solid rgba(194,24,91,0.1)'}}>Family & Background</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
              {[
                {id:'famtype',label:'Family type',opts:['','Joint family','Nuclear family','Lives alone','Joint now, plans to go nuclear','Stays with parents only']},
                {id:'famsize',label:'Family members',opts:['','Just him (1)','2–3 members','4–5 members','6–7 members','8+ members']},
                {id:'parents',label:'Parents situation',opts:['','Both parents with him','Parents in hometown','Single parent','Parents retired independently','Parents abroad']},
                {id:'siblings',label:'Siblings',opts:['','Only child','1 sibling','2 siblings','3+ siblings']},
                {id:'sibst',label:'Sibling status',opts:['','All married','Some married','All unmarried','No siblings']},
                {id:'income',label:'Annual income',opts:['Not disclosed','Below ₹5L','₹5L – ₹10L','₹10L – ₹20L','₹20L – ₹40L','₹40L – ₹75L','₹75L – ₹1Cr','₹1Cr+']},
                {id:'living',label:'Living situation',opts:['','Own property','Family home','Rented apartment','Company accommodation','Paying guest']},
                {id:'cityplan',label:'Post-marriage city plan',opts:['','Stay in current city','Open to moving','Expects partner to relocate','Planning to move abroad','Undecided']},
              ].map(f=>(
                <div key={f.id} style={{display:'flex',flexDirection:'column',gap:'4px'}}>
                  <label style={{fontSize:'11px',fontWeight:'500',color:'#7B5E6B'}}>{f.label}</label>
                  <select value={form[f.id]||''} onChange={fi(f.id)} style={{padding:'7px 10px',border:'1px solid rgba(194,24,91,0.13)',borderRadius:'10px',fontFamily:'DM Sans,sans-serif',fontSize:'12px',color:'#2C1810',background:'#FFF0F5',cursor:'pointer'}}>
                    {f.opts.map(o=><option key={o} value={o}>{o||'Not known'}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <div style={{marginTop:'12px'}}>
              <div style={{fontSize:'11px',fontWeight:'500',color:'#7B5E6B',marginBottom:'6px'}}>Card colour</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:'7px'}}>
                {SWATCHES.map(c=>(
                  <div key={c} onClick={()=>setForm(f=>({...f,color:c}))}
                    style={{width:'28px',height:'28px',borderRadius:'50%',background:c,cursor:'pointer',border:form.color===c?'3px solid #C2185B':'2px solid transparent',transform:form.color===c?'scale(1.18)':'scale(1)',transition:'all .15s'}} />
                ))}
              </div>
            </div>

            {[
              {id:'greens',label:'Green flags (comma-separated)',placeholder:'Honest, Family-oriented, Funny'},
              {id:'flags',label:'Yellow flags (comma-separated)',placeholder:'Workaholic, Travels rarely'},
              {id:'vibes',label:'Vibe tags (comma-separated)',placeholder:'Gym bro, Dog dad, Chai addict'},
            ].map(f=>(
              <div key={f.id} style={{marginTop:'10px',display:'flex',flexDirection:'column',gap:'4px'}}>
                <label style={{fontSize:'11px',fontWeight:'500',color:'#7B5E6B'}}>{f.label}</label>
                <input value={form[f.id]||''} onChange={fi(f.id)} placeholder={f.placeholder}
                  style={{padding:'7px 10px',border:'1px solid rgba(194,24,91,0.13)',borderRadius:'10px',fontFamily:'DM Sans,sans-serif',fontSize:'12px',color:'#2C1810',background:'#FFF0F5'}} />
              </div>
            ))}

            <div style={{marginTop:'1.25rem',display:'flex',gap:'8px'}}>
              <button onClick={saveProspect} style={{padding:'8px 20px',borderRadius:'18px',background:'#C2185B',color:'#fff',border:'none',cursor:'pointer',fontFamily:'DM Sans,sans-serif',fontWeight:'500',fontSize:'13px'}}>Save</button>
              <button onClick={()=>{setShowModal(false);setEditProspect(null);setForm({})}} style={{padding:'8px 16px',borderRadius:'18px',background:'#fff',border:'1px solid rgba(194,24,91,0.13)',color:'#7B5E6B',cursor:'pointer',fontFamily:'DM Sans,sans-serif',fontSize:'13px'}}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {showDelConfirm && (
        <div style={{position:'fixed',inset:0,background:'rgba(44,24,16,.4)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',borderRadius:'16px',padding:'2rem',width:'340px',textAlign:'center',boxShadow:'0 20px 60px rgba(194,24,91,.15)'}}>
            <div style={{fontSize:'36px',marginBottom:'.75rem'}}>🗑️</div>
            <div style={{fontFamily:'Playfair Display,serif',fontSize:'19px',color:'#2C1810',marginBottom:'.5rem'}}>Delete this prospect?</div>
            <div style={{fontSize:'13px',color:'#7B5E6B',marginBottom:'1.25rem'}}>This cannot be undone.</div>
            <div style={{display:'flex',gap:'8px',justifyContent:'center'}}>
              <button onClick={()=>deleteProspect(showDelConfirm)} style={{padding:'8px 16px',borderRadius:'18px',background:'#FFEBEE',color:'#C62828',border:'1px solid #ef9a9a',cursor:'pointer',fontFamily:'DM Sans,sans-serif',fontSize:'13px'}}>Yes, delete</button>
              <button onClick={()=>setShowDelConfirm(null)} style={{padding:'8px 16px',borderRadius:'18px',background:'#fff',border:'1px solid rgba(194,24,91,0.13)',color:'#7B5E6B',cursor:'pointer',fontFamily:'DM Sans,sans-serif',fontSize:'13px'}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── SECTION SLIDERS ───────────────────────────────────────────────────────────
function SectionSliders({ p, sections, prefix, onParamChange, twoCol, openFirst, onEditQ, onDeleteQ, onAddQ }) {
  const [openSecs, setOpenSecs] = useState(openFirst ? [0] : [])
  const toggle = (i) => setOpenSecs(prev => prev.includes(i) ? prev.filter(x=>x!==i) : [...prev,i])

  const cards = sections.map((sec,si)=>{
    const ss = secScore(p,sec), st = gsty(ss), isOpen = openSecs.includes(si)
    return (
      <div key={sec.key} style={{border:'1px solid rgba(194,24,91,0.13)',borderRadius:'10px',overflow:'hidden'}}>
        <div onClick={()=>toggle(si)} style={{display:'flex',alignItems:'center',gap:'10px',padding:'12px 14px',cursor:'pointer',background:'#fff',userSelect:'none'}}>
          <span style={{fontSize:'20px'}}>{sec.icon}</span>
          <div style={{flex:1}}>
            <div style={{fontSize:'13px',fontWeight:'500',color:'#2C1810'}}>{sec.label}</div>
            <div style={{fontSize:'10px',color:'#7B5E6B',marginTop:'1px'}}>{sec.desc}</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'8px',flexShrink:0}}>
            <div style={{width:'60px',height:'5px',background:'#f5e6ec',borderRadius:'3px',overflow:'hidden'}}>
              <div style={{width:ss+'%',height:'5px',borderRadius:'3px',background:sec.color}} />
            </div>
            <span style={{fontSize:'11px',fontWeight:'600',padding:'2px 8px',borderRadius:'10px',background:st.bg,color:st.col,minWidth:'30px',textAlign:'center'}}>{ss}</span>
            <span style={{fontSize:'11px',color:'#B39DAE',display:'inline-block',transform:isOpen?'rotate(0deg)':'rotate(-90deg)',transition:'transform .2s'}}>▼</span>
          </div>
        </div>
        {isOpen && (
          <div style={{padding:'14px',background:'#fffcfd',borderTop:'1px solid rgba(194,24,91,0.1)'}}>
            <div style={{display:'flex',flexDirection:'column',gap:'18px'}}>
              {sec.questions.map((q,qi)=>{
                const val=(p.params||{})[q.k]||0
                return (
                  <div key={q.k} className="q-row">
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'6px'}}>
                      <span style={{fontSize:'13px',color:'#7B5E6B'}}>
                        {q.label}
                        <span className="q-edit-btn" onClick={()=>onEditQ&&onEditQ(si,qi)} title="Edit question">✏️</span>
                        {sec.questions.length>2 && <span className="q-edit-btn" onClick={()=>onDeleteQ&&onDeleteQ(si,qi)} title="Delete question" style={{color:'#C62828'}}>×</span>}
                      </span>
                      <span style={{fontSize:'13px',fontWeight:'600',color:val===0?'#B39DAE':'#C2185B',fontStyle:val===0?'italic':'normal',minWidth:'60px',textAlign:'right'}}>
                        {val===0?'Not rated':val}
                      </span>
                    </div>
                    <HeartSlider value={val} color={sec.color} onChange={e=>onParamChange(p.id,q.k,e.target.value)} />
                    <div style={{fontSize:'10px',color:'#B39DAE',marginTop:'2px'}}>{q.hint}</div>
                  </div>
                )
              })}
            </div>
            <button onClick={()=>onAddQ&&onAddQ(si)}
              style={{marginTop:'12px',fontSize:'11px',padding:'5px 12px',borderRadius:'10px',border:`1px dashed ${sec.color}`,background:'transparent',color:sec.color,cursor:'pointer',width:'100%',fontFamily:'DM Sans,sans-serif'}}>
              + Add question to this section
            </button>
          </div>
        )}
      </div>
    )
  })

  if (twoCol) {
    const pairs = []
    for (let i=0; i<cards.length; i+=2) {
      pairs.push(
        <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}}>
          {cards[i]}{cards[i+1]||<div/>}
        </div>
      )
    }
    return <div>{pairs}</div>
  }
  return <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>{cards}</div>
}

// ── DETAIL VIEW ───────────────────────────────────────────────────────────────
function DetailView({ p, sections, onParamChange, onStatusChange, onEdit, onDelete, onEditQ, onDeleteQ, onAddQ }) {
  if (!p) return <div style={{color:'#7B5E6B',fontSize:'13px',padding:'2rem',textAlign:'center'}}>Select a prospect from the card view</div>
  const s=gsc(p,sections),st=gsty(s),unr=isUnrated(p,sections)
  const compat=s>=85?{stars:'★★★★★',lbl:'Strong match!',c:'#2E7D32'}:s>=78?{stars:'★★★★☆',lbl:'Good potential',c:'#F57F17'}:s>=68?{stars:'★★★☆☆',lbl:'Worth exploring',c:'#F57F17'}:{stars:'★★☆☆☆',lbl:'Think carefully',c:'#C62828'}
  const verdict=s>=85?{bg:'#E8F5E9',c:'#2E7D32',t:`${p.name} scores really well across the board. Strong emotional maturity + family alignment + stability = a very solid foundation.`}:s>=75?{bg:'#FFF8E1',c:'#F57F17',t:`${p.name} has a lot going for him but a few areas need an honest conversation. Don't dismiss, don't commit — just keep talking.`}:{bg:'#FCE4EC',c:'#C2185B',t:`Mixed picture overall. Some genuinely good qualities but meaningful gaps. Meet once more casually before deciding.`}

  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
      <div style={{background:'#fff',border:'1px solid rgba(194,24,91,0.13)',borderRadius:'16px',padding:'1.25rem',gridColumn:'1/-1',display:'flex',alignItems:'flex-start',gap:'1.25rem',flexWrap:'wrap'}}>
        <div style={{fontSize:'48px',background:p.color,borderRadius:'50%',width:'70px',height:'70px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{p.emoji}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:'Playfair Display,serif',fontSize:'22px',color:'#2C1810'}}>{p.name}</div>
          <div style={{fontSize:'12px',color:'#7B5E6B',marginTop:'3px',lineHeight:1.6}}>
            {p.age}y · {p.city}{p.hometown?' (from '+p.hometown+')':''} · {p.edu||'—'}<br/>
            {p.job}{p.company?' @ '+p.company:''} · {p.height||'—'} · {p.zodiac||'—'}
          </div>
          {spill(p.status)}
          <div style={{display:'flex',gap:'7px',flexWrap:'wrap',marginTop:'.85rem'}}>
            {[
              {l:'✓ Met',st:'meeting_done',bg:'#E8F5E9',c:'#2E7D32',bc:'#a5d6a7'},
              {l:'⭐ Fav',st:'favourite',bg:'#FFF8E1',c:'#F57F17',bc:'#ffe082'},
              {l:'💬 Discussion',st:'discussion',bg:'#EDE7F6',c:'#6A1B9A',bc:'#ce93d8'},
              {l:'✗ Eliminate',st:'eliminated',bg:'#FFEBEE',c:'#C62828',bc:'#ef9a9a'},
            ].map(b=>(
              <button key={b.st} onClick={()=>onStatusChange(p.id,b.st)}
                style={{padding:'7px 14px',borderRadius:'18px',fontSize:'12px',cursor:'pointer',border:`1px solid ${b.bc}`,background:b.bg,color:b.c,fontFamily:'DM Sans,sans-serif',fontWeight:'500'}}>{b.l}</button>
            ))}
            <button onClick={()=>onEdit(p)} style={{padding:'7px 14px',borderRadius:'18px',fontSize:'12px',cursor:'pointer',border:'none',background:'#C2185B',color:'#fff',fontFamily:'DM Sans,sans-serif',fontWeight:'500'}}>✏️ Edit</button>
            <button onClick={()=>onDelete(p.id)} style={{padding:'7px 14px',borderRadius:'18px',fontSize:'12px',cursor:'pointer',border:'1px solid #ffcc02',background:'#fff3e0',color:'#e65100',fontFamily:'DM Sans,sans-serif',fontWeight:'500'}}>🗑️ Delete</button>
          </div>
        </div>
        <div style={{textAlign:'center',flexShrink:0}}>
          <div style={{fontFamily:'Playfair Display,serif',fontSize:'44px',fontWeight:'600',color:unr?'#B39DAE':'#C2185B',lineHeight:1}}>{unr?'—':s}</div>
          <div style={{fontSize:'10px',color:'#B39DAE'}}>groom score</div>
          <div style={{fontSize:'20px',color:compat.c,marginTop:'4px'}}>{compat.stars}</div>
          <div style={{fontSize:'10px',color:compat.c,marginTop:'1px'}}>{compat.lbl}</div>
        </div>
      </div>

      <div style={{background:'#fff',border:'1px solid rgba(194,24,91,0.13)',borderRadius:'16px',padding:'1.1rem'}}>
        <div style={{fontSize:'10px',fontWeight:'500',textTransform:'uppercase',letterSpacing:'.9px',color:'#B39DAE',marginBottom:'.85rem'}}>Section scores at a glance</div>
        {sections.map(sec=>{
          const ss=secScore(p,sec)
          return (
            <div key={sec.key} style={{marginBottom:'9px'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'3px'}}>
                <span style={{fontSize:'11px',color:'#7B5E6B'}}>{sec.icon} {sec.label}</span>
                <span style={{fontSize:'11px',fontWeight:'500',color:sec.color}}>{ss}</span>
              </div>
              <div style={{height:'5px',background:'#f5e6ec',borderRadius:'3px'}}>
                <div style={{height:'5px',borderRadius:'3px',width:ss+'%',background:sec.color,transition:'width .5s'}} />
              </div>
            </div>
          )
        })}
        <div style={{padding:'.85rem 1rem',borderRadius:'10px',fontSize:'12px',lineHeight:1.7,marginTop:'.5rem',background:verdict.bg,color:verdict.c}}>{verdict.t}</div>
      </div>

      <div style={{background:'#fff',border:'1px solid rgba(194,24,91,0.13)',borderRadius:'16px',padding:'1.1rem'}}>
        <div style={{fontSize:'10px',fontWeight:'500',textTransform:'uppercase',letterSpacing:'.9px',color:'#B39DAE',marginBottom:'.85rem'}}>Family & Background</div>
        {[
          {label:'Family type',val:p.famtype},{label:'Family members',val:p.famsize},
          {label:'Parents',val:p.parents},{label:'Siblings',val:p.siblings},
          {label:'Annual income',val:p.income},{label:'Living situation',val:p.living},
          {label:'Post-marriage plan',val:p.cityplan},
        ].filter(r=>r.val).length ? [
          {label:'Family type',val:p.famtype},{label:'Family members',val:p.famsize},
          {label:'Parents',val:p.parents},{label:'Siblings',val:p.siblings},
          {label:'Annual income',val:p.income},{label:'Living situation',val:p.living},
          {label:'Post-marriage plan',val:p.cityplan},
        ].filter(r=>r.val).map(r=>(
          <div key={r.label} style={{display:'flex',gap:'8px',marginBottom:'7px'}}>
            <span style={{fontSize:'11px',color:'#B39DAE',minWidth:'130px',flexShrink:0}}>{r.label}</span>
            <span style={{fontSize:'12px',fontWeight:'500',color:'#2C1810'}}>{r.val}</span>
          </div>
        )) : <div style={{fontSize:'11px',color:'#B39DAE',fontStyle:'italic'}}>No family details added yet — click Edit</div>}
      </div>

      <div style={{background:'#fff',border:'1px solid rgba(194,24,91,0.13)',borderRadius:'16px',padding:'1.1rem'}}>
        <div style={{fontSize:'10px',fontWeight:'500',textTransform:'uppercase',letterSpacing:'.9px',color:'#B39DAE',marginBottom:'.85rem'}}>Vibe check</div>
        {[{items:p.greens,label:'GREEN FLAGS',bg:'#E8F5E9',c:'#2E7D32'},{items:p.vibes,label:'VIBES',bg:'#FCE4EC',c:'#C2185B'},{items:p.flags,label:'YELLOW FLAGS',bg:'#FFF8E1',c:'#F57F17'}].map(sec=>(
          <div key={sec.label} style={{marginBottom:'8px'}}>
            <div style={{fontSize:'10px',color:'#B39DAE',marginBottom:'5px'}}>{sec.label}</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:'5px'}}>
              {(sec.items||[]).length ? sec.items.map(t=>(
                <span key={t} style={{fontSize:'11px',padding:'3px 9px',borderRadius:'9px',background:sec.bg,color:sec.c}}>{t}</span>
              )) : <span style={{fontSize:'11px',color:'#B39DAE'}}>None added</span>}
            </div>
          </div>
        ))}
      </div>

      <div style={{gridColumn:'1/-1',background:'#fff',border:'1px solid rgba(194,24,91,0.13)',borderRadius:'16px',padding:'1.1rem'}}>
        <div style={{fontSize:'10px',fontWeight:'500',textTransform:'uppercase',letterSpacing:'.9px',color:'#B39DAE',marginBottom:'.85rem'}}>Rate him — drag the 💗</div>
        <SectionSliders p={p} sections={sections} prefix={`dv${p.id}`} onParamChange={onParamChange} twoCol={true} openFirst={true} onEditQ={onEditQ} onDeleteQ={onDeleteQ} onAddQ={onAddQ} />
      </div>
    </div>
  )
}

// ── KANBAN VIEW ───────────────────────────────────────────────────────────────
function KanbanView({ prospects, sections, onMove, onSelect, dragId, setDragId }) {
  return (
    <div style={{display:'flex',gap:'14px',overflowX:'auto',paddingBottom:'1rem',alignItems:'flex-start'}}>
      {KCOLS.map(col=>{
        const cards=prospects.filter(p=>p.status===col.key)
        return (
          <div key={col.key} style={{flex:'0 0 210px',minWidth:'210px',background:col.colBg,border:'1px solid rgba(194,24,91,0.13)',borderRadius:'16px',overflow:'hidden'}}
            onDragOver={e=>{e.preventDefault();e.currentTarget.style.outline='2px dashed #F48FB1'}}
            onDragLeave={e=>{e.currentTarget.style.outline=''}}
            onDrop={e=>{e.preventDefault();e.currentTarget.style.outline='';if(dragId)onMove(dragId,col.key);setDragId(null)}}>
            <div style={{padding:'10px 12px',display:'flex',alignItems:'center',gap:'8px',borderBottom:'1px solid rgba(194,24,91,0.13)',background:col.bg}}>
              <span style={{fontSize:'14px'}}>{col.icon}</span>
              <span style={{fontSize:'12px',fontWeight:'500',flex:1,color:col.pill}}>{col.label}</span>
              <span style={{fontSize:'10px',fontWeight:'600',padding:'2px 7px',borderRadius:'10px',background:col.pill+'22',color:col.pill}}>{cards.length}</span>
            </div>
            <div style={{padding:'10px 10px 14px',display:'flex',flexDirection:'column',gap:'9px',minHeight:'80px'}}>
              {cards.length ? cards.map(p=>{
                const s=gsc(p,sections),st=gsty(s),unr=isUnrated(p,sections)
                return (
                  <div key={p.id} draggable onDragStart={()=>setDragId(p.id)} onDragEnd={()=>setDragId(null)}
                    onClick={()=>onSelect(p.id)}
                    style={{background:'#fff',border:'1px solid rgba(194,24,91,0.13)',borderRadius:'10px',padding:'10px 11px',cursor:'pointer',opacity:dragId===p.id?.5:1}}>
                    <div style={{display:'flex',alignItems:'flex-start',gap:'8px',marginBottom:'7px'}}>
                      <div style={{fontSize:'20px',background:p.color,borderRadius:'50%',width:'36px',height:'36px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{p.emoji}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:'12px',fontWeight:'500',color:'#2C1810'}}>{p.name}</div>
                        <div style={{fontSize:'10px',color:'#7B5E6B',marginTop:'1px'}}>{p.age}y · {p.city}</div>
                        <div style={{fontSize:'10px',color:'#7B5E6B'}}>{p.job}{p.company?' · '+p.company:''}</div>
                      </div>
                      <div style={{textAlign:'center',flexShrink:0}}>
                        {unr
                          ? <div style={{fontSize:'9px',color:'#B39DAE',fontStyle:'italic',marginTop:'4px'}}>Not rated</div>
                          : <><div style={{fontSize:'17px',fontWeight:'700',fontFamily:'Playfair Display,serif',color:st.col,lineHeight:1}}>{s}</div><div style={{fontSize:'8px',color:'#B39DAE'}}>score</div></>
                        }
                      </div>
                    </div>
                    {(p.vibes||[]).slice(0,3).map(v=>(
                      <span key={v} style={{fontSize:'9px',padding:'2px 7px',borderRadius:'7px',background:col.bg,color:col.pill,display:'inline-block',margin:'1px'}}>{v}</span>
                    ))}
                  </div>
                )
              }) : <div style={{textAlign:'center',padding:'1.5rem .5rem',color:'#B39DAE',fontSize:'11px',fontStyle:'italic'}}>Drop a card here</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── COMPARE VIEW ──────────────────────────────────────────────────────────────
function CompareView({ prospects, sections, cmpSelected, setCmpSelected, cmpQualOpen, setCmpQualOpen, cmpQuantOpen, setCmpQuantOpen }) {
  const nonElim = prospects.filter(p=>p.status!=='eliminated')
  const active = prospects.filter(p=>cmpSelected.includes(p.id))

  function toggle(id) {
    if (cmpSelected.includes(id)) setCmpSelected(cmpSelected.filter(x=>x!==id))
    else if (cmpSelected.length < 5) setCmpSelected([...cmpSelected,id])
    else alert('Max 5 prospects at a time')
    setCmpQualOpen(false); setCmpQuantOpen(false)
  }

  return (
    <div>
      <div style={{marginBottom:'1.25rem'}}>
        <div style={{fontFamily:'Playfair Display,serif',fontSize:'24px',color:'#2C1810'}}>Head-to-Head</div>
        <div style={{fontSize:'12px',color:'#7B5E6B',marginTop:'3px'}}>Pick up to 5 prospects to compare</div>
      </div>
      <div style={{background:'#fff',border:'1px solid rgba(194,24,91,0.13)',borderRadius:'16px',padding:'1.1rem',marginBottom:'1rem'}}>
        <div style={{fontSize:'10px',fontWeight:'500',textTransform:'uppercase',letterSpacing:'.9px',color:'#B39DAE',marginBottom:'10px'}}>Select prospects</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:'10px'}}>
          {nonElim.map(p=>{
            const checked=cmpSelected.includes(p.id),s=gsc(p,sections),st=gsty(s),unr=isUnrated(p,sections)
            return (
              <div key={p.id} onClick={()=>toggle(p.id)}
                style={{display:'flex',alignItems:'center',gap:'7px',padding:'6px 12px',borderRadius:'20px',cursor:'pointer',border:`2px solid ${checked?'#C2185B':'rgba(194,24,91,0.13)'}`,background:checked?p.color:'#fff',transition:'all .15s'}}>
                <span style={{fontSize:'16px'}}>{p.emoji}</span>
                <span style={{fontSize:'12px',fontWeight:checked?'600':'400',color:'#2C1810'}}>{p.name}</span>
                <span style={{fontSize:'10px',padding:'1px 6px',borderRadius:'8px',background:unr?'#F5F5F5':st.bg,color:unr?'#B39DAE':st.col}}>{unr?'—':s}</span>
              </div>
            )
          })}
        </div>
        <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
          <button onClick={()=>{setCmpQualOpen(true);setCmpQuantOpen(true)}} disabled={cmpSelected.length<2}
            style={{padding:'7px 14px',borderRadius:'18px',background:cmpSelected.length<2?'#f5e6ec':'#C2185B',color:cmpSelected.length<2?'#B39DAE':'#fff',border:'none',cursor:cmpSelected.length<2?'not-allowed':'pointer',fontFamily:'DM Sans,sans-serif',fontSize:'12px',fontWeight:'500'}}>
            Compare {cmpSelected.length} prospects
          </button>
          <button onClick={()=>setCmpSelected([])} style={{padding:'7px 14px',borderRadius:'18px',background:'#fff',border:'1px solid rgba(194,24,91,0.13)',color:'#7B5E6B',cursor:'pointer',fontFamily:'DM Sans,sans-serif',fontSize:'12px'}}>Clear</button>
          {cmpSelected.length<2 && <span style={{fontSize:'11px',color:'#B39DAE'}}>Pick at least 2</span>}
        </div>
      </div>

      {active.length >= 2 && (
        <>
          <div style={{border:'1px solid rgba(194,24,91,0.13)',borderRadius:'16px',overflow:'hidden',marginBottom:'12px'}}>
            <div onClick={()=>setCmpQualOpen(!cmpQualOpen)} style={{display:'flex',alignItems:'center',gap:'10px',padding:'12px 14px',cursor:'pointer',background:'#FFF0F5',borderBottom:cmpQualOpen?'1px solid rgba(194,24,91,0.13)':'none'}}>
              <span style={{fontSize:'16px'}}>📋</span>
              <div style={{flex:1}}>
                <div style={{fontSize:'13px',fontWeight:'600',color:'#2C1810'}}>Background & Family Info</div>
                <div style={{fontSize:'11px',color:'#7B5E6B',marginTop:'1px'}}>Job, income, family type, city plans — factual, not scored</div>
              </div>
              <span style={{fontSize:'13px',color:'#B39DAE',display:'inline-block',transform:cmpQualOpen?'rotate(0)':'rotate(-90deg)',transition:'transform .2s'}}>▼</span>
            </div>
            {cmpQualOpen && (
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px'}}>
                  <thead><tr style={{background:'#FFF0F5'}}>
                    <th style={{textAlign:'left',padding:'9px 10px',fontSize:'10px',fontWeight:'500',color:'#B39DAE',textTransform:'uppercase',letterSpacing:'.4px',borderBottom:'1px solid rgba(194,24,91,0.13)',width:'20%'}}>Field</th>
                    {active.map(p=><th key={p.id} style={{textAlign:'center',padding:'9px 10px',fontSize:'11px',borderBottom:'1px solid rgba(194,24,91,0.13)'}}>{p.emoji} {p.name}</th>)}
                  </tr></thead>
                  <tbody>
                    {[
                      {l:'Job',fn:p=>p.job||'—'},{l:'Company',fn:p=>p.company||'—'},
                      {l:'Education',fn:p=>p.edu||'—'},{l:'City',fn:p=>p.city||'—'},
                      {l:'Height',fn:p=>p.height||'—'},{l:'Annual income',fn:p=>p.income||'Not disclosed'},
                      {l:'Family type',fn:p=>p.famtype||'—'},{l:'Family members',fn:p=>p.famsize||'—'},
                      {l:'Parents',fn:p=>p.parents||'—'},{l:'Living situation',fn:p=>p.living||'—'},
                      {l:'Post-marriage plan',fn:p=>p.cityplan||'—'},
                    ].map(f=>(
                      <tr key={f.l}>
                        <td style={{padding:'8px 10px',borderBottom:'1px solid rgba(194,24,91,0.1)',color:'#7B5E6B',fontWeight:'500'}}>{f.l}</td>
                        {active.map(p=><td key={p.id} style={{textAlign:'center',padding:'8px 6px',borderBottom:'1px solid rgba(194,24,91,0.1)',color:'#2C1810'}}>{f.fn(p)}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div style={{border:'1px solid rgba(194,24,91,0.13)',borderRadius:'16px',overflow:'hidden'}}>
            <div onClick={()=>setCmpQuantOpen(!cmpQuantOpen)} style={{display:'flex',alignItems:'center',gap:'10px',padding:'12px 14px',cursor:'pointer',background:'#FCE4EC',borderBottom:cmpQuantOpen?'1px solid rgba(194,24,91,0.13)':'none'}}>
              <span style={{fontSize:'16px'}}>📊</span>
              <div style={{flex:1}}>
                <div style={{fontSize:'13px',fontWeight:'600',color:'#880E4F'}}>Scores & Ratings</div>
                <div style={{fontSize:'11px',color:'#7B5E6B',marginTop:'1px'}}>Section scores and individual question ratings</div>
              </div>
              <span style={{fontSize:'13px',color:'#B39DAE',display:'inline-block',transform:cmpQuantOpen?'rotate(0)':'rotate(-90deg)',transition:'transform .2s'}}>▼</span>
            </div>
            {cmpQuantOpen && (
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px'}}>
                  <thead><tr style={{background:'#FCE4EC'}}>
                    <th style={{textAlign:'left',padding:'9px 10px',fontSize:'10px',fontWeight:'500',color:'#B39DAE',textTransform:'uppercase',letterSpacing:'.4px',borderBottom:'1px solid rgba(194,24,91,0.13)',width:'30%'}}>Section / Question</th>
                    {active.map(p=><th key={p.id} style={{textAlign:'center',padding:'9px 10px',fontSize:'11px',borderBottom:'1px solid rgba(194,24,91,0.13)'}}>{p.emoji} {p.name}</th>)}
                  </tr></thead>
                  <tbody>
                    {sections.flatMap(sec=>{
                      const secVals=active.map(p=>secScore(p,sec)),secMax=Math.max(...secVals)
                      return [
                        <tr key={sec.key} style={{background:'#fdf5f8'}}>
                          <td style={{padding:'9px 10px',borderBottom:'1px solid rgba(194,24,91,0.1)',fontSize:'12px',fontWeight:'600',color:'#2C1810'}}>{sec.icon} {sec.label}</td>
                          {active.map((p,i)=><td key={p.id} style={{textAlign:'center',padding:'9px 6px',borderBottom:'1px solid rgba(194,24,91,0.1)',fontWeight:'600',fontSize:'13px',color:secVals[i]===secMax?sec.color:'#7B5E6B',background:secVals[i]===secMax?sec.color+'11':''}}>{secVals[i]}{secVals[i]===secMax?' ▲':''}</td>)}
                        </tr>,
                        ...sec.questions.map(q=>{
                          const vals=active.map(p=>(p.params||{})[q.k]||0),mx=Math.max(...vals)
                          return (
                            <tr key={q.k}>
                              <td style={{padding:'6px 10px 6px 22px',borderBottom:'1px solid rgba(194,24,91,0.1)',fontSize:'11px',color:'#7B5E6B',fontStyle:'italic'}}>{q.label}</td>
                              {active.map((p,i)=><td key={p.id} style={{textAlign:'center',padding:'6px',borderBottom:'1px solid rgba(194,24,91,0.1)',fontSize:'12px',color:vals[i]===mx&&vals[i]>0?'#C2185B':'#7B5E6B',fontWeight:vals[i]===mx&&vals[i]>0?'500':'400'}}>{vals[i]===0?'—':vals[i]+(vals[i]===mx?' ▲':'')}</td>)}
                            </tr>
                          )
                        })
                      ]
                    })}
                    <tr style={{borderTop:'2px solid rgba(194,24,91,0.2)',background:'#FCE4EC'}}>
                      <td style={{fontSize:'12px',fontWeight:'700',padding:'10px',color:'#2C1810'}}>Overall Score</td>
                      {active.map(p=>{const s=gsc(p,sections),st=gsty(s),unr=isUnrated(p,sections);return <td key={p.id} style={{textAlign:'center',padding:'10px 6px',fontSize:'18px',fontWeight:'700',fontFamily:'Playfair Display,serif',color:unr?'#B39DAE':st.col,background:unr?'#F5F5F5':st.bg}}>{unr?'—':s+'/100'}</td>})}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ── FUN ZONE ──────────────────────────────────────────────────────────────────
function FunZone({ prospects, sections }) {
  if (!prospects.length) return <div style={{color:'#7B5E6B',fontSize:'13px',padding:'2rem',textAlign:'center'}}>Add some prospects first!</div>
  const active = prospects.filter(p=>p.status!=='eliminated')
  if (!active.length) return <div style={{color:'#7B5E6B',fontSize:'13px',padding:'2rem',textAlign:'center'}}>All eliminated! Add more.</div>

  const fns=(arr,sec)=>[...arr].sort((a,b)=>secScore(b,sec)-secScore(a,sec))[0]
  const secEQ=sections[0],secFam=sections[1],secFin=sections[2],secLS=sections[3],secFut=sections[4],secFun=sections[5]

  function milScore(p){return Math.round((secScore(p,secFun)+secScore(p,secFam))/2)}
  const milSorted=[...active].sort((a,b)=>milScore(b)-milScore(a))
  const milChamp=milSorted[0], milWorst=milSorted[milSorted.length-1]

  const top=[...active].sort((a,b)=>gsc(b,sections)-gsc(a,sections))[0]
  const igWinner=[...prospects].sort((a,b)=>secScore(b,secLS)-secScore(a,secLS))[0]
  const heaWinner=[...prospects].sort((a,b)=>(secScore(b,secEQ)+secScore(b,secFam))-(secScore(a,secEQ)+secScore(a,secFam)))[0]
  const trophyWinner=[...prospects].sort((a,b)=>(secScore(b,secFin)+secScore(b,secFut))-(secScore(a,secFin)+secScore(a,secFut)))[0]
  const funWinner=fns(prospects,secFun)

  const zodiacs={Aries:'♈',Taurus:'♉',Gemini:'♊',Cancer:'♋',Leo:'♌',Virgo:'♍',Libra:'♎',Scorpio:'♏',Sagittarius:'♐',Capricorn:'♑',Aquarius:'♒',Pisces:'♓'}

  const funCards=[
    {ic:'👑',t:'Top pick right now',p:top,sub:`Score: ${gsc(top,sections)}/100`},
    {ic:'😅',t:"MIL's favourite",p:milChamp,sub:`MIL score: ${milScore(milChamp)}/100`},
    {ic:'💛',t:'Most emotionally mature',p:fns(prospects,secEQ),sub:'Emotional Quotient section'},
    {ic:'🏠',t:'Best family values',p:fns(prospects,secFam),sub:'Family & Values section'},
    {ic:'💸',t:'Most financially sorted',p:fns(prospects,secFin),sub:'Financial & Career section'},
    {ic:'📸',t:'Best Instagram husband',p:igWinner,sub:`Lifestyle score: ${secScore(igWinner,secLS)}/100`},
    {ic:'🌹',t:'Happily ever after',p:heaWinner,sub:'EQ + Family sections'},
    {ic:'🏆',t:'Trophy husband potential',p:trophyWinner,sub:'Finance + Future sections'},
    {ic:'🎉',t:'Most fun to be around',p:funWinner,sub:`Fun score: ${secScore(funWinner,secFun)}/100`},
  ]

  return (
    <div>
      <div style={{marginBottom:'1.25rem'}}>
        <div style={{fontFamily:'Playfair Display,serif',fontSize:'24px',color:'#2C1810'}}>✨ Fun Zone</div>
        <div style={{fontSize:'12px',color:'#7B5E6B',marginTop:'3px'}}>Because picking a husband should have some drama</div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))',gap:'12px',marginBottom:'1.25rem'}}>
        {funCards.map((x,i)=>(
          <div key={i} style={{background:'#fff',border:'1px solid rgba(194,24,91,0.13)',borderRadius:'16px',padding:'1.1rem'}}>
            <div style={{fontSize:'12px',fontWeight:'500',color:'#2C1810',marginBottom:'.6rem',display:'flex',alignItems:'center',gap:'6px'}}><span>{x.ic}</span>{x.t}</div>
            <div style={{fontSize:'26px',marginBottom:'3px'}}>{x.p.emoji}</div>
            <div style={{fontSize:'14px',fontWeight:'500'}}>{x.p.name}</div>
            <div style={{fontSize:'11px',color:'#7B5E6B',marginTop:'2px'}}>{x.sub}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',marginBottom:'1.25rem'}}>
        <div style={{background:'#fff',border:'1px solid rgba(194,24,91,0.13)',borderRadius:'16px',padding:'1.1rem'}}>
          <div style={{fontSize:'10px',fontWeight:'500',textTransform:'uppercase',letterSpacing:'.9px',color:'#B39DAE',marginBottom:'.85rem'}}>😅 MIL Compatibility Meter</div>
          {milSorted.map(p=>{
            const v=milScore(p),c=v>=80?'#4CAF50':v>=65?'#FF9800':'#F44336',em=v>=80?'😍':v>=65?'🙂':'😬'
            return (
              <div key={p.id} style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'7px'}}>
                <div style={{fontSize:'11px',color:'#7B5E6B',width:'110px',flexShrink:0}}>{p.emoji} {p.name}</div>
                <div style={{flex:1,height:'7px',background:'#f5e6ec',borderRadius:'3px',overflow:'hidden'}}>
                  <div style={{width:v+'%',height:'7px',borderRadius:'3px',background:c}} />
                </div>
                <div style={{fontSize:'11px',fontWeight:'600',color:c,width:'28px',textAlign:'right'}}>{v}</div>
                <div style={{fontSize:'14px'}}>{em}</div>
              </div>
            )
          })}
          <div style={{marginTop:'10px',display:'flex',gap:'8px',flexWrap:'wrap'}}>
            <span style={{fontSize:'11px',background:'#E8F5E9',color:'#2E7D32',padding:'3px 10px',borderRadius:'8px'}}>😍 Mammi's pick: {milChamp.name}</span>
            {milSorted.length>1 && <span style={{fontSize:'11px',background:'#FFEBEE',color:'#C62828',padding:'3px 10px',borderRadius:'8px'}}>😬 Toughest sell: {milWorst.name}</span>}
          </div>
        </div>

        <div style={{background:'#fff',border:'1px solid rgba(194,24,91,0.13)',borderRadius:'16px',padding:'1.1rem'}}>
          <div style={{fontSize:'10px',fontWeight:'500',textTransform:'uppercase',letterSpacing:'.9px',color:'#B39DAE',marginBottom:'.85rem'}}>🏆 Section Champions</div>
          {sections.map(sec=>{
            const winner=fns(prospects,sec),score=secScore(winner,sec)
            return (
              <div key={sec.key} style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'9px'}}>
                <span style={{fontSize:'18px'}}>{sec.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:'11px',color:'#7B5E6B'}}>{sec.label}</div>
                  <div style={{fontSize:'12px',fontWeight:'500'}}>{winner.emoji} {winner.name}</div>
                </div>
                <span style={{fontSize:'11px',fontWeight:'600',padding:'2px 8px',borderRadius:'8px',background:sec.color+'22',color:sec.color}}>{score}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
        <div style={{background:'#fff',border:'1px solid rgba(194,24,91,0.13)',borderRadius:'16px',padding:'1.1rem'}}>
          <div style={{fontSize:'10px',fontWeight:'500',textTransform:'uppercase',letterSpacing:'.9px',color:'#B39DAE',marginBottom:'.85rem'}}>♾️ Zodiac Vibes</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'7px'}}>
            {prospects.map(p=>(
              <div key={p.id} style={{background:'#FCE4EC',borderRadius:'9px',padding:'8px',textAlign:'center'}}>
                <div style={{fontSize:'18px'}}>{zodiacs[p.zodiac]||'🌟'}</div>
                <div style={{fontSize:'10px',color:'#880E4F'}}>{p.zodiac||'?'}</div>
                <div style={{fontSize:'9px',color:'#7B5E6B'}}>{p.name}</div>
              </div>
            ))}
          </div>
          <div style={{fontSize:'10px',color:'#B39DAE',marginTop:'8px',fontStyle:'italic'}}>Just for fun 🙏</div>
        </div>

        <div style={{background:'#fff',border:'1px solid rgba(194,24,91,0.13)',borderRadius:'16px',padding:'1.1rem'}}>
          <div style={{fontSize:'10px',fontWeight:'500',textTransform:'uppercase',letterSpacing:'.9px',color:'#B39DAE',marginBottom:'.85rem'}}>💬 Quick Verdicts</div>
          {active.map(p=>{
            const s=gsc(p,sections),st=gsty(s),unr=isUnrated(p,sections)
            const cp=s>=85?{stars:'★★★★★',lbl:'Strong match!',c:'#2E7D32'}:s>=78?{stars:'★★★★☆',lbl:'Good potential',c:'#F57F17'}:s>=68?{stars:'★★★☆☆',lbl:'Worth exploring',c:'#F57F17'}:{stars:'★★☆☆☆',lbl:'Think carefully',c:'#C62828'}
            return (
              <div key={p.id} style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px',paddingBottom:'8px',borderBottom:'1px solid rgba(194,24,91,0.1)'}}>
                <div style={{fontSize:'20px',background:p.color,borderRadius:'50%',width:'34px',height:'34px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{p.emoji}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'12px',fontWeight:'500'}}>{p.name}</div>
                  <div style={{fontSize:'11px'}}>{cp.stars} <span style={{color:cp.c}}>{cp.lbl}</span></div>
                </div>
                <span style={{fontSize:'14px',fontWeight:'600',color:unr?'#B39DAE':st.col}}>{unr?'—':s}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

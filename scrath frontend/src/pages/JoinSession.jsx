import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { joinSession } from '../api'

export default function JoinSession() {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleJoin = async () => {
    if (!code.trim() || !name.trim()) {
      alert('Enter room code and name')
      return
    }
    try {
      setLoading(true)
      const data = await joinSession(code, name)
      navigate(`/lobby/${data.session_id}?name=${encodeURIComponent(name)}&host=false&userId=${encodeURIComponent(data.user_id)}`)
    } catch (e) {
      alert('Failed to join session')
    } finally {
      setLoading(false)
    }
  }

  const input = { width:'100%', padding:'12px 14px', borderRadius:10, border:'1px solid #333', background:'#111', color:'#fff', marginBottom:12 }
  const btn = { width:'100%', padding:'12px 16px', borderRadius:10, background:'#7c3aed', border:'none', color:'#fff', fontWeight:600 }

  return (
    <div style={{ minHeight:'100vh', background:'#000', color:'#fff', display:'flex', alignItems:'center' }}>
      <div style={{ maxWidth:480, margin:'0 auto', width:'100%', padding:24 }}>
        <h2 style={{ fontSize:28, marginBottom:16 }}>Join Session</h2>
        <input placeholder="Room code" value={code} onChange={e=>setCode(e.target.value)} style={input} />
        <input placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} style={input} />
        <button onClick={handleJoin} disabled={loading} style={btn}>{loading ? 'Joining...' : 'Join'}</button>
        <button onClick={() => navigate('/')} style={{ width:'100%', padding:'10px 16px', borderRadius:10, background:'transparent', border:'1px solid #333', color:'#a1a1aa', fontWeight:600, marginTop:12 }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

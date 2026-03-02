import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSession } from '../api'

export default function CreateSession() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleCreate = async () => {
    if (!name.trim()) return
    try {
      setLoading(true)
      const data = await createSession(name)
      navigate(`/lobby/${data.session_id}?name=${encodeURIComponent(name)}&host=true&userId=${encodeURIComponent(data.host_id)}`)
    } catch (e) {
      alert('Could not create session')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#000', color:'#fff', display:'flex', alignItems:'center' }}>
      <div style={{ maxWidth:480, margin:'0 auto', width:'100%', padding:24 }}>
        <h2 style={{ fontSize:28, marginBottom:16 }}>Host a Session</h2>
        <input
          placeholder="Your name"
          value={name}
          onChange={(e)=>setName(e.target.value)}
          style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:'1px solid #333', background:'#111', color:'#fff', marginBottom:12 }}
        />
        <button onClick={handleCreate} disabled={loading} style={{ width:'100%', padding:'12px 16px', borderRadius:10, background:'#7c3aed', border:'none', color:'#fff', fontWeight:600 }}>
          {loading ? 'Creating...' : 'Create & Invite'}
        </button>
        <button onClick={() => navigate('/')} style={{ width:'100%', padding:'10px 16px', borderRadius:10, background:'transparent', border:'1px solid #333', color:'#a1a1aa', fontWeight:600, marginTop:12 }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

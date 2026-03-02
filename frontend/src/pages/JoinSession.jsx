import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { joinSession } from '../api'
import { saveSession } from '../session'

export default function JoinSession() {
  const [urlParams] = useSearchParams()
  const [code, setCode] = useState(urlParams.get('code') || '')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Auto-focus name field if code is pre-filled from URL
  useEffect(() => {
    if (urlParams.get('code')) {
      document.getElementById('name-input')?.focus()
    }
  }, [])

  const handleJoin = async () => {
    if (!code.trim() || !name.trim()) {
      alert('Enter room code and name')
      return
    }
    try {
      setLoading(true)
      const data = await joinSession(code.trim(), name.trim())
      saveSession({
        sessionId: data.session_id,
        userId: data.user_id,
        name,
        isHost: false,
      })
      navigate(`/lobby/${data.session_id}?name=${encodeURIComponent(name)}&host=false&userId=${encodeURIComponent(data.user_id)}`)
    } catch (e) {
      alert('Failed to join session. Check the room code and try again.')
    } finally {
      setLoading(false)
    }
  }

  const input = { width:'100%', padding:'12px 14px', borderRadius:10, border:'1px solid #333', background:'#111', color:'#fff', marginBottom:12, fontSize:15, boxSizing:'border-box' }

  return (
    <div style={{ minHeight:'100vh', background:'#000', color:'#fff', display:'flex', alignItems:'center' }}>
      <div style={{ maxWidth:480, margin:'0 auto', width:'100%', padding:24 }}>
        <h2 style={{ fontSize:28, marginBottom:4 }}>Join Session</h2>
        {urlParams.get('code') && (
          <p style={{ color:'#22c55e', fontSize:13, marginBottom:16 }}>
            ✓ Room code pre-filled from invite link
          </p>
        )}
        <input
          placeholder="Room code"
          value={code}
          onChange={e => setCode(e.target.value)}
          style={input}
        />
        <input
          id="name-input"
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleJoin()}
          style={input}
        />
        <button onClick={handleJoin} disabled={loading}
          style={{ width:'100%', padding:'12px 16px', borderRadius:10, background:'#7c3aed', border:'none', color:'#fff', fontWeight:600, cursor:'pointer', fontSize:15 }}>
          {loading ? 'Joining...' : 'Join'}
        </button>
        <button onClick={() => navigate('/')}
          style={{ width:'100%', padding:'10px 16px', borderRadius:10, background:'transparent', border:'1px solid #333', color:'#a1a1aa', fontWeight:600, marginTop:12, cursor:'pointer' }}>
          Cancel
        </button>
      </div>
    </div>
  )
}
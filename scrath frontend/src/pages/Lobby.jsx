import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { startSession, listUsers, endSession } from '../api'

export default function Lobby() {
  const { sessionId } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const myName = params.get('name')
  const myUserId = params.get('userId')
  const isHostFlagFromUrl = params.get('host') === 'true'

  const [users, setUsers] = useState([])
  const pathSid = (() => {
    try { return (window.location.pathname.split('/')[2]) || '' } catch { return '' }
  })()
  const displayCode = sessionId || params.get('sessionId') || pathSid

  useEffect(() => {
    let timer
    const fetchUsers = async () => {
      try {
        const data = await listUsers(sessionId)
        const hostId = data.host_id
        const mapped = (data.users || []).map(u => ({
          id: u.id,
          name: u.name,
          isHost: u.id === hostId,
          isMe: u.id === myUserId,
        }))
        setUsers(mapped)
      } catch (e) {
        // ignore transient errors
      } finally {
        timer = setTimeout(fetchUsers, 2000)
      }
    }
    fetchUsers()
    return () => clearTimeout(timer)
  }, [sessionId, myUserId])

  const [copied, setCopied] = useState(false)

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(displayCode)
      setCopied(true)
      setTimeout(()=>setCopied(false), 1500)
    } catch(e) {
      // ignore
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#000', color:'#fff', padding:'48px 24px' }}>
      <div style={{ maxWidth:800, margin:'0 auto', textAlign:'center' }}>
        <p style={{ color:'#a1a1aa', letterSpacing:2, fontSize:12, marginBottom:8 }}>ROOM CODE</p>
        <div style={{ display:'flex', gap:12, alignItems:'center', justifyContent:'center', marginBottom:12, flexWrap:'wrap' }}>
          <span style={{ fontSize:40, fontWeight:800, letterSpacing:2, margin:0, padding:'6px 10px', borderRadius:8, border:'1px dashed #334155', background:'#0b1220', fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>
            {displayCode || '—'}
          </span>
          <button onClick={copyCode} title="Copy code"
            style={{ padding:'10px 12px', borderRadius:8, background:'#1f2937', border:'1px solid #334155', color:'#e5e7eb', cursor:'pointer' }}>
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <p style={{ color:'#a1a1aa', marginBottom:24 }}>Share this code with your friends to join.</p>

        <div style={{ background:'#111', border:'1px solid #27272a', borderRadius:16, padding:16, marginBottom:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <h3 style={{ margin:0 }}>Waiting for others...</h3>
            <span style={{ fontSize:12, padding:'4px 8px', borderRadius:999, background:'#3b0764', color:'#c4b5fd' }}>{users.length} Joined</span>
          </div>
          {users.map(u => (
            <div key={u.id} style={{ display:'flex', alignItems:'center', gap:12, background:'#0a0a0a', border:'1px solid #27272a', borderRadius:12, padding:12 }}>
              <div style={{ width:40, height:40, borderRadius:999, background:'#7c3aed', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>
                {u?.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div style={{ textAlign:'left', flex:1 }}>
                <div style={{ fontWeight:600 }}>{u.name} {u.isMe && '(You)'}</div>
                <div style={{ fontSize:12, color:'#a1a1aa' }}>{u.isHost ? 'Host' : 'Participant'}</div>
              </div>
              <span style={{ color:'#22c55e' }}>●</span>
            </div>
          ))}
        </div>

        {users.some(u => u.id === myUserId && u.isHost) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              onClick={async () => {
                try {
                  await startSession(sessionId, myUserId)
                  navigate(`/swipe/${sessionId}/${myUserId}`)
                } catch (e) {
                  alert('Failed to start session')
                }
              }}
              style={{ padding:'14px 24px', borderRadius:999, background:'linear-gradient(90deg,#7c3aed,#ec4899)', border:'none', color:'#fff', fontWeight:800, fontSize:18 }}
            >
              ▶ Start Swiping
            </button>
            <button
              onClick={async () => {
                if (!confirm('End this session? No one will be able to swipe or view results.')) return
                try {
                  await endSession(sessionId, myUserId)
                  alert('Session ended')
                  navigate('/')
                } catch (e) {
                  alert('Failed to end session')
                }
              }}
              style={{ padding:'12px 20px', borderRadius:999, background:'#374151', border:'none', color:'#d1d5db', fontWeight:600, fontSize:14 }}
            >
              ⏹ End Session
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

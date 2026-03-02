import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { startSession, listUsers, endSession, getSwipeProgress } from '../api'
import { loadSession } from '../session'

export default function Lobby() {
  const { sessionId } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const saved = loadSession()
  const myUserId = params.get('userId') || saved?.userId

  const [users, setUsers] = useState([])
  const [sessionStatus, setSessionStatus] = useState('waiting')
  const [copied, setCopied] = useState(false)
  const [swipeProgress, setSwipeProgress] = useState([])
  const [allDone, setAllDone] = useState(false)

  useEffect(() => {
    let timer
    let cancelled = false

    const fetchState = async () => {
      try {
        const data = await listUsers(sessionId)
        if (cancelled) return

        const hostId = data.host_id
        const mapped = (data.users || []).map(u => ({
          id: u.id,
          name: u.name,
          isHost: u.id === hostId,
          isMe: u.id === myUserId,
        }))
        setUsers(mapped)
        setSessionStatus(data.status)

        const iAmHost = mapped.some(u => u.id === myUserId && u.isHost)

        if (!iAmHost && data.status === 'active') {
          navigate(`/swipe/${sessionId}/${myUserId}`)
          return
        }

        if (data.status === 'ended') {
          alert('This session has ended.')
          navigate('/')
          return
        }

        // Fetch swipe progress if session is active
        if (data.status === 'active') {
          try {
            const prog = await getSwipeProgress(sessionId)
            if (!cancelled) {
              setSwipeProgress(prog.progress || [])
              setAllDone(prog.all_done || false)
            }
          } catch (e) {}
        }
      } catch (e) {}

      if (!cancelled) {
        timer = setTimeout(fetchState, 2000)
      }
    }

    fetchState()
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [sessionId, myUserId, navigate])

  const copyCode = async () => {
    try {
      const inviteLink = `${window.location.origin}/join?code=${sessionId}`
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (e) {}
  }

  const isHost = users.some(u => u.id === myUserId && u.isHost)

  return (
    <div style={{ minHeight:'100vh', background:'#000', color:'#fff', padding:'48px 24px' }}>
      <div style={{ maxWidth:800, margin:'0 auto', textAlign:'center' }}>

        <p style={{ color:'#a1a1aa', letterSpacing:2, fontSize:12, marginBottom:8 }}>ROOM CODE</p>
        <div style={{ display:'flex', gap:12, alignItems:'center', justifyContent:'center', marginBottom:12, flexWrap:'wrap' }}>
          <span style={{
            fontSize:40, fontWeight:800, letterSpacing:2, padding:'6px 10px',
            borderRadius:8, border:'1px dashed #334155', background:'#0b1220', fontFamily:'monospace'
          }}>
            {sessionId}
          </span>
          <button onClick={copyCode} style={{ padding:'10px 12px', borderRadius:8, background:'#1f2937', border:'1px solid #334155', color:'#e5e7eb', cursor:'pointer' }}>
            {copied ? '✓ Copied link!' : '🔗 Copy invite link'}
          </button>
        </div>
        <p style={{ color:'#a1a1aa', marginBottom:24 }}>Share this link with your friends to join.</p>

        {/* Users list */}
        <div style={{ background:'#111', border:'1px solid #27272a', borderRadius:16, padding:16, marginBottom:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <h3 style={{ margin:0 }}>
              {sessionStatus === 'active' ? 'Swiping in progress...' : isHost ? 'Waiting for others...' : 'Waiting for host to start...'}
            </h3>
            <span style={{ fontSize:12, padding:'4px 8px', borderRadius:999, background:'#3b0764', color:'#c4b5fd' }}>
              {users.length} Joined
            </span>
          </div>

          {users.map(u => {
            const prog = swipeProgress.find(p => p.user_id === u.id)
            return (
              <div key={u.id} style={{
                display:'flex', alignItems:'center', gap:12,
                background:'#0a0a0a', border:'1px solid #27272a',
                borderRadius:12, padding:12, marginBottom:8
              }}>
                <div style={{
                  width:40, height:40, borderRadius:999, background:'#7c3aed',
                  display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, flexShrink:0
                }}>
                  {u?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ textAlign:'left', flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600 }}>{u.name} {u.isMe && '(You)'}</div>
                  <div style={{ fontSize:12, color:'#a1a1aa' }}>{u.isHost ? 'Host' : 'Participant'}</div>
                  {/* Progress bar when swiping */}
                  {prog && sessionStatus === 'active' && (
                    <div style={{ marginTop:6 }}>
                      <div style={{ height:3, background:'#1f2937', borderRadius:999, overflow:'hidden', marginBottom:3 }}>
                        <div style={{
                          width:`${Math.round((prog.swiped / prog.total) * 100)}%`,
                          height:'100%', borderRadius:999,
                          background: prog.done ? '#22c55e' : '#7c3aed',
                          transition:'width 0.4s ease'
                        }} />
                      </div>
                      <span style={{ fontSize:11, color: prog.done ? '#22c55e' : '#6b7280' }}>
                        {prog.done ? '✓ Done' : `${prog.swiped} / ${prog.total} swiped`}
                      </span>
                    </div>
                  )}
                </div>
                <span style={{ color: prog?.done ? '#22c55e' : '#22c55e' }}>●</span>
              </div>
            )
          })}
        </div>

        {/* All done banner */}
        {allDone && sessionStatus === 'active' && (
          <div style={{ background:'rgba(34,197,94,0.1)', border:'1px solid #22c55e', borderRadius:12, padding:'12px 20px', marginBottom:20, color:'#22c55e', fontWeight:600 }}>
            🎉 Everyone has finished swiping!
          </div>
        )}

        {!isHost && sessionStatus === 'waiting' && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, color:'#6b7280', fontSize:14, marginBottom:24 }}>
            <span>⏳</span>
            <span>You'll be redirected automatically when the host starts</span>
          </div>
        )}

        {/* Host controls */}
        {isHost && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {sessionStatus === 'waiting' && (
              <button
                onClick={async () => {
                  try {
                    await startSession(sessionId, myUserId)
                    navigate(`/swipe/${sessionId}/${myUserId}`)
                  } catch (e) {
                    alert('Failed to start session')
                  }
                }}
                style={{
                  padding:'14px 24px', borderRadius:999,
                  background:'linear-gradient(90deg,#7c3aed,#ec4899)',
                  border:'none', color:'#fff', fontWeight:800, fontSize:18, cursor:'pointer'
                }}
              >
                ▶ Start Swiping
              </button>
            )}
            {sessionStatus === 'active' && allDone && (
              <button
                onClick={() => navigate(`/result/${sessionId}`)}
                style={{
                  padding:'14px 24px', borderRadius:999,
                  background:'linear-gradient(90deg,#16a34a,#22c55e)',
                  border:'none', color:'#fff', fontWeight:800, fontSize:18, cursor:'pointer'
                }}
              >
                🎬 See Results
              </button>
            )}
            <button
              onClick={async () => {
                if (!confirm('End this session?')) return
                try {
                  await endSession(sessionId, myUserId)
                  navigate('/')
                } catch (e) {
                  alert('Failed to end session')
                }
              }}
              style={{
                padding:'12px 20px', borderRadius:999, background:'#374151',
                border:'none', color:'#d1d5db', fontWeight:600, fontSize:14, cursor:'pointer'
              }}
            >
              ⏹ End Session
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMatchResult } from '../api'

export default function Result() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const res = await getMatchResult(sessionId)
        setData(res)
      } catch (e) {
        setError('No result yet or session not active')
      }
    })()
  }, [sessionId])

  if (error) return (
    <div style={{ minHeight:'100vh', background:'#000', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ textAlign:'center' }}>
        <p style={{ marginBottom:16, color:'#f87171' }}>{error}</p>
        <button onClick={() => navigate(-1)} style={{ color:'#c4b5fd', background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}>
          Go Back
        </button>
      </div>
    </div>
  )

  if (!data) return (
    <div style={{ minHeight:'100vh', background:'#000', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <p>Loading results...</p>
    </div>
  )

  const winners = data.winners || []
  const ranked = data.ranked || []
  const visibleRanked = showAll ? ranked : ranked.slice(0, 5)

  return (
    <div style={{ minHeight:'100vh', background:'#000', color:'#fff', padding:'48px 24px' }}>
      <div style={{ maxWidth:700, margin:'0 auto' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ fontSize:48, marginBottom:8 }}>🎬</div>
          <h1 style={{ fontSize:32, fontWeight:800, margin:'0 0 8px' }}>
            {data.has_winner ? "Tonight's Pick!" : 'No Match Found'}
          </h1>
          <p style={{ color:'#6b7280', fontSize:15 }}>
            {winners.length > 1
              ? `${winners.length} movies tied — flip a coin!`
              : winners.length === 1
              ? 'Everyone agreed on this one'
              : 'No clear consensus this time'}
          </p>
        </div>

        {/* Winner cards */}
        {winners.length > 0 && (
          <div style={{ display:'flex', flexDirection:'column', gap:16, marginBottom:40 }}>
            {winners.map((m, i) => (
              <div key={m.id} style={{
                display:'flex', gap:16, background:'#111',
                border:'1px solid #7c3aed',
                borderRadius:16, overflow:'hidden',
                boxShadow:'0 0 24px rgba(124,58,237,0.25)'
              }}>
                {m.poster_url && (
                  <img src={m.poster_url} alt={m.title}
                    style={{ width:110, objectFit:'cover', flexShrink:0 }} />
                )}
                <div style={{ padding:'16px 16px 16px 0', display:'flex', flexDirection:'column', justifyContent:'center', flex:1 }}>
                  <span style={{ fontSize:11, fontWeight:700, color:'#a78bfa', letterSpacing:2, marginBottom:6 }}>
                    🏆 {winners.length > 1 ? `TIE #${i + 1}` : 'WINNER'}
                  </span>
                  <h2 style={{ fontSize:22, fontWeight:700, margin:'0 0 6px' }}>{m.title}</h2>
                  <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:8, flexWrap:'wrap' }}>
                    <span style={{ fontSize:13, color:'#fbbf24' }}>★ {m.rating ?? 'N/A'}</span>
                    <span style={{ fontSize:13, color:'#a1a1aa' }}>{(m.language || '').toUpperCase()}</span>
                    {m.genre && (
                      <span style={{ fontSize:11, padding:'3px 8px', background:'#1f2937', color:'#9ca3af', borderRadius:12 }}>
                        {m.genre}
                      </span>
                    )}
                  </div>
                  {m.description && (
                    <p style={{
                      fontSize:13, color:'#9ca3af', margin:'0 0 10px', lineHeight:1.5,
                      display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'
                    }}>
                      {m.description}
                    </p>
                  )}
                  <div style={{ display:'flex', gap:12 }}>
                    <span style={{ fontSize:12, color:'#22c55e', fontWeight:600 }}>👍 {m.likes}</span>
                    <span style={{ fontSize:12, color:'#ef4444', fontWeight:600 }}>👎 {m.dislikes}</span>
                    <span style={{ fontSize:12, color:'#a78bfa', fontWeight:600 }}>Net: {m.score > 0 ? '+' : ''}{m.score}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Scoreboard */}
        {ranked.length > 0 && (
          <div style={{ background:'#111', border:'1px solid #27272a', borderRadius:16, overflow:'hidden', marginBottom:32 }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid #27272a' }}>
              <h3 style={{ margin:0, fontSize:18 }}>📊 Full Scoreboard</h3>
            </div>
            {visibleRanked.map((m, i) => {
              const totalVotes = m.likes + m.dislikes
              const likePercent = totalVotes > 0 ? Math.round((m.likes / totalVotes) * 100) : 0

              return (
                <div key={m.id} style={{
                  display:'flex', alignItems:'center', gap:14, padding:'12px 20px',
                  borderBottom: i < visibleRanked.length - 1 ? '1px solid #1f2937' : 'none',
                  background: m.is_winner ? 'rgba(124,58,237,0.08)' : 'transparent'
                }}>
                  {/* Rank */}
                  <div style={{
                    width:28, height:28, borderRadius:999, flexShrink:0,
                    background: i === 0 ? '#7c3aed' : '#1f2937',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:13, fontWeight:700, color: i === 0 ? '#fff' : '#6b7280'
                  }}>
                    {i + 1}
                  </div>

                  {/* Poster */}
                  {m.poster_url && (
                    <img src={m.poster_url} alt={m.title}
                      style={{ width:36, height:52, objectFit:'cover', borderRadius:6, flexShrink:0 }} />
                  )}

                  {/* Title + bar */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                      <span style={{ fontWeight:600, fontSize:14, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                        {m.title}
                      </span>
                      {m.is_winner && <span style={{ fontSize:12 }}>🏆</span>}
                    </div>
                    {/* Like bar */}
                    <div style={{ height:4, background:'#1f2937', borderRadius:999, overflow:'hidden' }}>
                      <div style={{
                        width:`${likePercent}%`, height:'100%', borderRadius:999,
                        background: likePercent >= 50 ? '#16a34a' : '#ef4444',
                        transition:'width 0.4s ease'
                      }} />
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:2, flexShrink:0 }}>
                    <span style={{ fontSize:13, fontWeight:700, color: m.score > 0 ? '#22c55e' : m.score < 0 ? '#ef4444' : '#6b7280' }}>
                      {m.score > 0 ? '+' : ''}{m.score}
                    </span>
                    <span style={{ fontSize:11, color:'#4b5563' }}>{m.likes}👍 {m.dislikes}👎</span>
                  </div>
                </div>
              )
            })}

            {ranked.length > 5 && (
              <button
                onClick={() => setShowAll(!showAll)}
                style={{
                  width:'100%', padding:'12px', background:'transparent',
                  border:'none', borderTop:'1px solid #1f2937',
                  color:'#6b7280', cursor:'pointer', fontSize:13, fontWeight:600
                }}
              >
                {showAll ? 'Show less ↑' : `Show all ${ranked.length} movies ↓`}
              </button>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
          <button onClick={() => navigate('/')}
            style={{ padding:'12px 24px', borderRadius:999, background:'#7c3aed', border:'none', color:'#fff', fontWeight:700, cursor:'pointer' }}>
            New Session
          </button>
          <button onClick={() => navigate(`/lobby/${sessionId}`)}
            style={{ padding:'12px 24px', borderRadius:999, background:'transparent', border:'1px solid #374151', color:'#9ca3af', fontWeight:600, cursor:'pointer' }}>
            Back to Lobby
          </button>
        </div>

      </div>
    </div>
  )
}
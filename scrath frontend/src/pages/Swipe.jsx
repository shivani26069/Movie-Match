import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { listMovies, swipeMovie } from '../api'

export default function Swipe() {
  const { sessionId, userId } = useParams()
  const navigate = useNavigate()
  const [movies, setMovies] = useState([])
  const [idx, setIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showFullDesc, setShowFullDesc] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const data = await listMovies(sessionId)
        setMovies(data.movies || [])
      } catch (e) {
        alert('Failed to load movies. Is the session active?')
      } finally {
        setLoading(false)
      }
    })()
  }, [sessionId])

  const onSwipe = async (action) => {
    const current = movies[idx]
    if (!current) return
    try {
      if (submitting) return
      setSubmitting(true)
      await swipeMovie(sessionId, userId, current.id, action)
      const next = idx + 1
      if (next >= movies.length) {
        navigate(`/result/${sessionId}`)
      } else {
        setIdx(next)
        setShowFullDesc(false)
      }
    } catch (e) {
      console.error('Swipe error:', e)
      alert(`Failed to record swipe: ${e?.message || 'Unknown error'}`)
    } finally {
      setSubmitting(false)
    }
  }

  // Keyboard shortcuts for swiping: Left = dislike, Right = like
  useEffect(() => {
    const handler = (e) => {
      if (submitting) return
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        onSwipe('dislike')
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        onSwipe('like')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [idx, movies, submitting])

  if (loading) return <div style={{ color:'#fff', padding:32 }}>Loading...</div>
  if (!movies.length) return <div style={{ color:'#fff', padding:32 }}>No movies available.</div>

  const m = movies[idx]
  const genres = m.genre ? m.genre.split(',').map(g => g.trim()).filter(Boolean) : []

  return (
    <div style={{ minHeight:'100vh', background:'#000', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:600 }}>
        <div style={{ background:'#111', border:'1px solid #27272a', borderRadius:20, overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,0.6)' }}>
          {m.poster_url && (
            <img src={m.poster_url} alt={m.title} style={{ width:'100%', height:640, objectFit:'cover', display:'block' }} />
          )}
          <div style={{ padding:20 }}>
            <h2 style={{ fontSize:28, margin:'0 0 8px', fontWeight:700 }}>{m.title}</h2>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12, flexWrap:'wrap' }}>
              <span style={{ fontSize:13, color:'#a1a1aa', fontWeight:500 }}>{(m.language||'').toUpperCase()}</span>
              <span style={{ fontSize:13, color:'#fbbf24' }}>★ {m.rating ?? 'NA'}</span>
            </div>
            {genres.length > 0 && (
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:16 }}>
                {genres.map((g, i) => (
                  <span key={i} style={{ fontSize:11, padding:'4px 10px', background:'#1f2937', color:'#9ca3af', borderRadius:12, fontWeight:600 }}>
                    {g}
                  </span>
                ))}
              </div>
            )}
            {m.description && (
              <div style={{ marginBottom:20 }}>
                <p style={{
                  fontSize:15,
                  lineHeight:1.6,
                  color:'#e5e7eb',
                  margin:0,
                  maxHeight: showFullDesc ? 'none' : 120,
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'max-height 0.3s ease'
                }}>
                  {m.description}
                </p>
                {m.description.length > 180 && (
                  <button
                    onClick={() => setShowFullDesc(!showFullDesc)}
                    style={{
                      fontSize:13,
                      color:'#3b82f6',
                      background:'none',
                      border:'none',
                      padding:0,
                      marginTop:8,
                      cursor:'pointer',
                      fontWeight:600
                    }}
                  >
                    {showFullDesc ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            )}

            <div style={{ display:'flex', gap:14 }}>
              <button disabled={submitting} onClick={() => onSwipe('dislike')} title="Don't want to watch"
                style={{ flex:1, padding:'16px 20px', borderRadius:14, border:'1px solid #ef4444', background:'transparent', color:'#fca5a5', fontWeight:700, fontSize:15 }}>
                ← Don't want to watch
              </button>
              <button disabled={submitting} onClick={() => onSwipe('like')} title="Want to watch"
                style={{ flex:1, padding:'16px 20px', borderRadius:14, background:'#16a34a', border:'none', color:'#fff', fontWeight:700, fontSize:15 }}>
                Want to watch →
              </button>
            </div>

            <p style={{ marginTop:16, textAlign:'center', color:'#6b7280', fontSize:13 }}>{idx + 1} / {movies.length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

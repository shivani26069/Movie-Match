import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { listMovies, swipeMovie } from '../api'
import { loadSession } from '../session'

export default function Swipe() {
  const { sessionId: paramSessionId, userId: paramUserId } = useParams()
  const saved = loadSession()
  const sessionId = paramSessionId || saved?.sessionId
  const userId = paramUserId || saved?.userId

  const navigate = useNavigate()
  const [movies, setMovies] = useState([])
  const [idx, setIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showFullDesc, setShowFullDesc] = useState(false)

  // Animation state
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [exitDir, setExitDir] = useState(null) // 'left' | 'right' | null
  const dragStartX = useRef(null)
  const cardRef = useRef(null)

  const idxRef = useRef(idx)
  const moviesRef = useRef(movies)
  const submittingRef = useRef(submitting)

  useEffect(() => { idxRef.current = idx }, [idx])
  useEffect(() => { moviesRef.current = movies }, [movies])
  useEffect(() => { submittingRef.current = submitting }, [submitting])

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

  const advanceCard = useCallback((action, dir) => {
    setExitDir(dir)
    setTimeout(() => {
      const next = idxRef.current + 1
      if (next >= moviesRef.current.length) {
        navigate(`/result/${sessionId}`)
      } else {
        setIdx(next)
        setShowFullDesc(false)
        setDragX(0)
        setExitDir(null)
      }
    }, 350)
  }, [sessionId, navigate])

  const onSwipe = useCallback(async (action) => {
    if (submittingRef.current) return
    const current = moviesRef.current[idxRef.current]
    if (!current) return

    try {
      setSubmitting(true)
      submittingRef.current = true
      await swipeMovie(sessionId, userId, current.id, action)
      advanceCard(action, action === 'like' ? 'right' : 'left')
    } catch (e) {
      const msg = e?.message || ''
      if (msg.includes('Already swiped')) {
        advanceCard(action, action === 'like' ? 'right' : 'left')
      } else {
        alert(`Failed to record swipe: ${msg || 'Unknown error'}`)
      }
    } finally {
      setSubmitting(false)
      submittingRef.current = false
    }
  }, [sessionId, userId, advanceCard])

  // Keyboard handler
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); onSwipe('dislike') }
      else if (e.key === 'ArrowRight') { e.preventDefault(); onSwipe('like') }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onSwipe])

  // Touch handlers
  const onTouchStart = (e) => {
    dragStartX.current = e.touches[0].clientX
    setIsDragging(true)
  }

  const onTouchMove = (e) => {
    if (dragStartX.current === null) return
    const diff = e.touches[0].clientX - dragStartX.current
    setDragX(diff)
  }

  const onTouchEnd = () => {
    setIsDragging(false)
    dragStartX.current = null
    if (Math.abs(dragX) > 100) {
      onSwipe(dragX > 0 ? 'like' : 'dislike')
    } else {
      // Snap back
      setDragX(0)
    }
  }

  // Mouse drag handlers (desktop)
  const onMouseDown = (e) => {
    dragStartX.current = e.clientX
    setIsDragging(true)
  }

  const onMouseMove = (e) => {
    if (!isDragging || dragStartX.current === null) return
    const diff = e.clientX - dragStartX.current
    setDragX(diff)
  }

  const onMouseUp = () => {
    if (!isDragging) return
    setIsDragging(false)
    dragStartX.current = null
    if (Math.abs(dragX) > 100) {
      onSwipe(dragX > 0 ? 'like' : 'dislike')
    } else {
      setDragX(0)
    }
  }

  // Derived animation values
  const rotation = dragX * 0.08
  const likeOpacity = Math.min(Math.max(dragX / 80, 0), 1)
  const nopeOpacity = Math.min(Math.max(-dragX / 80, 0), 1)

  const cardStyle = exitDir
    ? {
        transform: `translateX(${exitDir === 'right' ? '120%' : '-120%'}) rotate(${exitDir === 'right' ? 20 : -20}deg)`,
        transition: 'transform 0.35s ease',
        cursor: 'grab',
      }
    : {
        transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease',
        cursor: isDragging ? 'grabbing' : 'grab',
      }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#000', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:600 }}>
        <div style={{ marginBottom:12, display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ flex:1, height:4, background:'#1f2937', borderRadius:999 }} />
          <div style={{ width:40, height:12, background:'#1f2937', borderRadius:6 }} />
        </div>
        <div style={{ background:'#111', border:'1px solid #27272a', borderRadius:20, overflow:'hidden' }}>
          <div style={{ width:'100%', height:560, backgroundImage:'linear-gradient(90deg, #111 25%, #1f2937 50%, #111 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite' }} />
          <div style={{ padding:20 }}>
            <div style={{ height:28, width:'60%', background:'#1f2937', borderRadius:8, marginBottom:12 }} />
            <div style={{ display:'flex', gap:8, marginBottom:12 }}>
              <div style={{ height:16, width:40, background:'#1f2937', borderRadius:6 }} />
              <div style={{ height:16, width:30, background:'#1f2937', borderRadius:6 }} />
            </div>
            <div style={{ display:'flex', gap:14 }}>
              <div style={{ flex:1, height:54, background:'#1f2937', borderRadius:14 }} />
              <div style={{ flex:1, height:54, background:'#1f2937', borderRadius:14 }} />
            </div>
          </div>
        </div>
        <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
      </div>
    </div>
  )

  if (!movies.length) return (
    <div style={{ minHeight:'100vh', background:'#000', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <p>No movies available.</p>
    </div>
  )

  const m = movies[idx]
  const genres = m.genre ? m.genre.split(',').map(g => g.trim()).filter(Boolean) : []
  const progress = ((idx + 1) / movies.length) * 100

  return (
    <div
      style={{ minHeight:'100vh', background:'#000', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', padding:24, userSelect:'none' }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <div style={{ width:'100%', maxWidth:600 }}>
        {/* Progress bar */}
        <div style={{ marginBottom:12, display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ flex:1, height:4, background:'#1f2937', borderRadius:999, overflow:'hidden' }}>
            <div style={{ width:`${progress}%`, height:'100%', background:'linear-gradient(90deg,#7c3aed,#ec4899)', borderRadius:999, transition:'width 0.3s ease' }} />
          </div>
          <span style={{ fontSize:12, color:'#6b7280', whiteSpace:'nowrap' }}>{idx + 1} / {movies.length}</span>
        </div>

        {/* Card */}
        <div
          ref={cardRef}
          style={{ ...cardStyle, background:'#111', border:'1px solid #27272a', borderRadius:20, overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,0.6)', position:'relative' }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
        >
          {/* LIKE stamp */}
          <div style={{
            position:'absolute', top:32, left:24, zIndex:10,
            border:'4px solid #22c55e', borderRadius:8, padding:'6px 14px',
            color:'#22c55e', fontWeight:900, fontSize:28, letterSpacing:3,
            transform:'rotate(-20deg)', opacity: likeOpacity,
            pointerEvents:'none'
          }}>
            WATCH
          </div>

          {/* NOPE stamp */}
          <div style={{
            position:'absolute', top:32, right:24, zIndex:10,
            border:'4px solid #ef4444', borderRadius:8, padding:'6px 14px',
            color:'#ef4444', fontWeight:900, fontSize:28, letterSpacing:3,
            transform:'rotate(20deg)', opacity: nopeOpacity,
            pointerEvents:'none'
          }}>
            SKIP
          </div>

          {m.poster_url && (
            <img
              src={m.poster_url}
              alt={m.title}
              draggable={false}
              style={{ width:'100%', height:560, objectFit:'cover', display:'block', pointerEvents:'none' }}
            />
          )}

          <div style={{ padding:20 }}>
            <h2 style={{ fontSize:26, margin:'0 0 8px', fontWeight:700 }}>{m.title}</h2>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12, flexWrap:'wrap' }}>
              <span style={{ fontSize:13, color:'#a1a1aa' }}>{(m.language || '').toUpperCase()}</span>
              <span style={{ fontSize:13, color:'#fbbf24' }}>★ {m.rating ?? 'N/A'}</span>
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
                <p style={{ fontSize:15, lineHeight:1.6, color:'#e5e7eb', margin:0, maxHeight: showFullDesc ? 'none' : 80, overflow:'hidden' }}>
                  {m.description}
                </p>
                {m.description.length > 180 && (
                  <button onClick={() => setShowFullDesc(!showFullDesc)}
                    style={{ fontSize:13, color:'#3b82f6', background:'none', border:'none', padding:0, marginTop:6, cursor:'pointer', fontWeight:600 }}>
                    {showFullDesc ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            )}

            <div style={{ display:'flex', gap:14 }}>
              <button disabled={submitting} onClick={() => onSwipe('dislike')}
                style={{ flex:1, padding:'16px 20px', borderRadius:14, border:'1px solid #ef4444', background:'transparent', color:'#fca5a5', fontWeight:700, fontSize:15, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.5 : 1 }}>
                ✕ Skip
              </button>
              <button disabled={submitting} onClick={() => onSwipe('like')}
                style={{ flex:1, padding:'16px 20px', borderRadius:14, background:'#16a34a', border:'none', color:'#fff', fontWeight:700, fontSize:15, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.5 : 1 }}>
                ♥ Watch
              </button>
            </div>
            <p style={{ marginTop:12, textAlign:'center', color:'#4b5563', fontSize:12 }}>
              drag the card or use ← → arrow keys
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getMatchResult } from '../api'

export default function Result() {
  const { sessionId } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

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
        <Link to={`/lobby/${sessionId}`} style={{ color:'#c4b5fd', textDecoration:'underline' }}>Back to Lobby</Link>
      </div>
    </div>
  )

  if (!data) return <div style={{ color:'#fff', padding:32 }}>Loading...</div>

  const winners = data.winner_movie_ids || []

  return (
    <div style={{ minHeight:'100vh', background:'#000', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ maxWidth:640, width:'100%', background:'#111', border:'1px solid #27272a', borderRadius:16, padding:24 }}>
        <h1 style={{ fontSize:28, marginBottom:16 }}>Match Result</h1>
        {winners.length ? (
          <div>
            <p style={{ color:'#a1a1aa', marginBottom:8 }}>Winner Movie IDs:</p>
            <ul>
              {winners.map(id => (
                <li key={id}>Movie ID: {id}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p style={{ color:'#a1a1aa' }}>{data.message || 'No clear consensus'}</p>
        )}
        <div style={{ marginTop:16 }}>
          <Link to={`/lobby/${sessionId}`} style={{ color:'#c4b5fd', textDecoration:'underline' }}>Back to Lobby</Link>
        </div>
      </div>
    </div>
  )
}

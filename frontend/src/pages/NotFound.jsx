import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight:'100vh', background:'#000', color:'#fff',
      display:'flex', alignItems:'center', justifyContent:'center', padding:24
    }}>
      <div style={{ textAlign:'center', maxWidth:480 }}>
        <div style={{ fontSize:80, marginBottom:16 }}>🎬</div>
        <h1 style={{ fontSize:48, fontWeight:800, margin:'0 0 8px',
          background:'linear-gradient(90deg,#7c3aed,#ec4899)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'
        }}>
          404
        </h1>
        <p style={{ fontSize:20, fontWeight:600, marginBottom:8 }}>Scene not found</p>
        <p style={{ color:'#6b7280', fontSize:15, marginBottom:32 }}>
          Looks like this page got cut from the final edit.
        </p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              padding:'12px 24px', borderRadius:999,
              background:'linear-gradient(90deg,#7c3aed,#ec4899)',
              border:'none', color:'#fff', fontWeight:700, cursor:'pointer', fontSize:15
            }}
          >
            Back to Home
          </button>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding:'12px 24px', borderRadius:999, background:'transparent',
              border:'1px solid #374151', color:'#9ca3af', fontWeight:600, cursor:'pointer', fontSize:15
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}


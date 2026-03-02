import { Link } from 'react-router-dom'

export default function Home() {
  const box = { maxWidth: 480, margin: '0 auto', textAlign: 'center', padding: 24 }
  const btn = {
    display: 'block', width: '100%', padding: '12px 16px', borderRadius: 10,
    marginTop: 12, textDecoration: 'none', fontWeight: 600
  }
  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display:'flex', alignItems:'center' }}>
      <div style={box}>
        <h1 style={{ fontSize: 48, marginBottom: 8 }}>MovieMatch 🎬</h1>
        <p style={{ color: '#aaa' }}>Swipe movies with friends and decide what to watch together.</p>
        <Link to="/create" style={{ ...btn, background:'#7c3aed', color:'#fff' }}>🎉 Create Session</Link>
        <Link to="/join" style={{ ...btn, border:'1px solid #7c3aed', color:'#c4b5fd' }}>🤝 Join Session</Link>
      </div>
    </div>
  )
}

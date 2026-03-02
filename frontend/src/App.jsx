import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import CreateSession from './pages/CreateSession'
import JoinSession from './pages/JoinSession'
import Lobby from './pages/Lobby'
import Swipe from './pages/Swipe'
import Result from './pages/Result'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff' }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateSession />} />
        <Route path="/join" element={<JoinSession />} />
        <Route path="/lobby/:sessionId" element={<Lobby />} />
        <Route path="/swipe/:sessionId/:userId" element={<Swipe />} />
        <Route path="/result/:sessionId" element={<Result />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

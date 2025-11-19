import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import BookARide from './pages/BookARide'
import OfferARide from './pages/OfferARide'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/book-ride" element={<BookARide />} />
        <Route path="/offer-ride" element={<OfferARide />} />
      </Routes>
    </Router>
  )
}

export default App


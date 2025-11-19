import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-black border-t border-gray-800 pt-16 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold">R</span>
              </div>
              <span className="text-2xl font-bold text-white">RideFusion</span>
            </div>
            <p className="text-gray-500 mb-6">Connecting Rajpura with safe, reliable, and affordable transport.</p>
            <div className="flex gap-4">
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-yellow-500 hover:text-black transition">IG</a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-yellow-500 hover:text-black transition">FB</a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-yellow-500 hover:text-black transition">X</a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Platform</h4>
            <ul className="space-y-3 text-gray-500">
              <li><Link to="/" className="hover:text-yellow-400 transition">Home</Link></li>
              <li><Link to="/book-ride" className="hover:text-yellow-400 transition">Find a Ride</Link></li>
              <li><Link to="/offer-ride" className="hover:text-yellow-400 transition">Drive with Us</Link></li>
              <li><a href="#" className="hover:text-yellow-400 transition">Safety</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Contact</h4>
            <ul className="space-y-3 text-gray-500">
              <li className="flex items-center gap-3"><span>📍</span> Rajpura, Punjab</li>
              <li className="flex items-center gap-3"><span>📞</span> +91 98765 43210</li>
              <li className="flex items-center gap-3"><span>✉️</span> support@ridefusion.in</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-sm">© 2024 RideFusion. Made in Rajpura.</p>
          <div className="flex gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-white transition">Privacy</a>
            <a href="#" className="hover:text-white transition">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer


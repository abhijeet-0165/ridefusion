import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

// Image paths - using BASE_URL to ensure compatibility with Vercel
const getImagePath = (imageName) => {
  const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
  return `${baseUrl}/images/${imageName}`
}

const images = {
  1: getImagePath('1.png'),
  2: getImagePath('2.png'),
  3: getImagePath('3.png'),
  4: getImagePath('4.png'),
  5: getImagePath('5.png'),
  6: getImagePath('6.png'),
  7: getImagePath('7.png'),
}

const Home = () => {
  const [currentUser, setCurrentUser] = useState(null)
  const [allRides, setAllRides] = useState([])
  const [filteredRides, setFilteredRides] = useState([])
  const [stats, setStats] = useState({ totalRides: 0, activeDrivers: 0, avgPrice: 0 })
  const [quickFilters, setQuickFilters] = useState({
    vehicle: '',
    location: '',
    price: ''
  })

  useEffect(() => {
    const userString = localStorage.getItem('currentUser')
    if (userString) {
      setCurrentUser(JSON.parse(userString))
    }
    loadQuickRides()
    const interval = setInterval(loadQuickRides, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadQuickRides = async () => {
    try {
      const { data, error } = await supabase
        .from('rides')
        .select('*')
        .eq('status', 'active')
        .order('createdAt', { ascending: false })

      if (error) throw error

      const rides = data || []
      setAllRides(rides)
      setFilteredRides(rides)
      updateStatistics(rides)
    } catch (error) {
      console.error('Error loading rides:', error)
    }
  }

  const updateStatistics = (rides) => {
    const activeRides = rides.filter(ride => ride.bookedSeats < ride.seats)
    const uniqueDrivers = new Set(rides.map(ride => ride.driverId))
    
    let avgPrice = 0
    if (rides.length > 0) {
      const totalPrice = rides.reduce((sum, ride) => sum + ride.pricePerSeat, 0)
      avgPrice = Math.round(totalPrice / rides.length)
    }

    setStats({
      totalRides: rides.length,
      activeDrivers: uniqueDrivers.size,
      avgPrice
    })
  }

  useEffect(() => {
    const vehicleType = quickFilters.vehicle
    const location = quickFilters.location.toLowerCase().trim()
    const maxPrice = parseInt(quickFilters.price) || Infinity

    const filtered = allRides.filter(ride => {
      let matches = true
      if (vehicleType && ride.vehicleType !== vehicleType) matches = false
      if (location) {
        const fromMatch = ride.from.toLowerCase().includes(location)
        const toMatch = ride.to.toLowerCase().includes(location)
        if (!fromMatch && !toMatch) matches = false
      }
      if (ride.pricePerSeat > maxPrice) matches = false
      if (ride.bookedSeats >= ride.seats) matches = false
      return matches
    })

    setFilteredRides(filtered)
  }, [quickFilters, allRides])

  const clearFilters = () => {
    setQuickFilters({ vehicle: '', location: '', price: '' })
  }

  const refreshRides = () => {
    loadQuickRides()
  }

  const getVehicleEmoji = (type) => {
    switch(type) {
      case 'Car': return '🚗'
      case 'Auto': return '🛺'
      case 'Bike': return '🏍️'
      default: return '🚕'
    }
  }

  return (
    <div className="text-gray-100 font-sans antialiased">
      <Navbar />

      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="particle" style={{ left: `${10 + i * 20}%`, animationDelay: `${i * 2}s` }}></div>
        ))}
      </div>


      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-cover bg-center scale-105" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')" }}></div>
          <div className="absolute inset-0 gradient-overlay"></div>
        </div>

       
        <div className="absolute inset-0 pointer-events-none hidden lg:block z-10">
          <div className="absolute top-1/4 right-[10%] floating opacity-60">
            <div className="w-32 h-32 rounded-2xl border border-yellow-500/30 bg-black/40 backdrop-blur-sm shadow-2xl flex items-center justify-center">
              <span className="text-4xl">🚗</span>
            </div>
          </div>
          <div className="absolute bottom-1/4 left-[10%] floating opacity-60" style={{ animationDelay: '-2s' }}>
            <div className="w-24 h-24 rounded-full border border-yellow-500/30 bg-black/40 backdrop-blur-sm shadow-2xl flex items-center justify-center">
              <span className="text-3xl">⚡</span>
            </div>
          </div>
        </div>

        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto slide-up w-full">
          <div className="mb-6 h-16 flex items-center justify-center">
            {currentUser && (
              currentUser.isStudent ? (
                <div className="bg-green-900/30 border border-green-500/40 rounded-full px-6 py-2 flex items-center gap-3 animate-fade-in">
                  <span className="text-xl">🎓</span>
                  <p className="text-green-400 font-medium text-sm">
                    Student Discount Active: <span className="font-bold text-white">15% OFF applied</span>
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-900/30 border border-yellow-500/40 rounded-full px-6 py-2 flex items-center gap-3">
                  <span className="text-xl">👋</span>
                  <p className="text-yellow-400 font-medium text-sm">Welcome back, {currentUser.name}!</p>
                </div>
              )
            )}
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-8xl font-black mb-6 leading-tight tracking-tight break-words">
            <span className="gold-gradient">RideFusion</span><br />
            <span className="text-white text-xl md:text-3xl lg:text-4xl font-light tracking-wide mt-2 block">Rajpura's Trusted Transport</span>
          </h1>

          <p className="text-base md:text-xl lg:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto font-light leading-relaxed">
            Safe, affordable, and reliable rides for students and locals. <br className="hidden md:block" />Available when you need us, right here in Rajpura.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
            <Link to="/book-ride" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,215,0,0.3)]">
                🚗 Book Your Ride
              </button>
            </Link>
            <Link to="/offer-ride" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 border border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 font-bold rounded-xl transition-all transform hover:scale-105">
                🎯 Become a Driver
              </button>
            </Link>
          </div>
        </div>
      </section>

      <section className="relative -mt-16 z-30 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="royal-card p-6 rounded-xl flex flex-col items-center justify-center text-center hover:bg-black/40">
              <span className="text-3xl mb-2">🚗</span>
              <h3 className="text-3xl font-bold text-white">{stats.totalRides}</h3>
              <p className="text-gray-400 text-sm uppercase tracking-wider">Rides Today</p>
            </div>
            <div className="royal-card p-6 rounded-xl flex flex-col items-center justify-center text-center hover:bg-black/40">
              <span className="text-3xl mb-2">👥</span>
              <h3 className="text-3xl font-bold text-white">{stats.activeDrivers}</h3>
              <p className="text-gray-400 text-sm uppercase tracking-wider">Active Drivers</p>
            </div>
            <div className="royal-card p-6 rounded-xl flex flex-col items-center justify-center text-center hover:bg-black/40">
              <span className="text-3xl mb-2">⭐</span>
              <h3 className="text-3xl font-bold text-white">4.8</h3>
              <p className="text-gray-400 text-sm uppercase tracking-wider">Avg Rating</p>
            </div>
            <div className="royal-card p-6 rounded-xl flex flex-col items-center justify-center text-center hover:bg-black/40">
              <span className="text-3xl mb-2">💰</span>
              <h3 className="text-3xl font-bold text-white">₹{stats.avgPrice}</h3>
              <p className="text-gray-400 text-sm uppercase tracking-wider">Avg Fare</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-[#0f0f0f]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6 text-center md:text-left">
            <div className="w-full md:w-auto text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">🚀 Available Now</h2>
              <p className="text-gray-400">Real-time rides departing soon.</p>
            </div>
            <div className="flex items-center gap-3 justify-center md:justify-end w-full md:w-auto mt-4 md:mt-0">
              <div className="bg-green-900/30 border border-green-500/30 rounded-full px-4 py-1.5 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-green-400 font-mono font-bold text-sm">{filteredRides.length} Live</span>
              </div>
              <button onClick={refreshRides} className="bg-yellow-600/20 hover:bg-yellow-600 text-yellow-500 hover:text-black border border-yellow-600/50 px-4 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2">
                <span>🔄</span> Refresh
              </button>
            </div>
          </div>

          <div className="royal-card rounded-2xl p-4 mb-10 z-40">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative w-full max-w-md mx-auto">
                <span className="absolute left-3 top-3 text-gray-500">🚙</span>
                <select
                  value={quickFilters.vehicle}
                  onChange={(e) => setQuickFilters({...quickFilters, vehicle: e.target.value})}
                  className="w-full bg-black/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-gray-200 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none appearance-none"
                >
                  <option value="">All Vehicles</option>
                  <option value="Car">Car</option>
                  <option value="Auto">Auto</option>
                  <option value="Bike">Bike</option>
                </select>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">🔍</span>
                <input
                  type="text"
                  value={quickFilters.location}
                  onChange={(e) => setQuickFilters({...quickFilters, location: e.target.value})}
                  placeholder="Search destination..."
                  className="w-full bg-black/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-gray-200 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none"
                />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">₹</span>
                <input
                  type="number"
                  value={quickFilters.price}
                  onChange={(e) => setQuickFilters({...quickFilters, price: e.target.value})}
                  placeholder="Max price"
                  className="w-full bg-black/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-gray-200 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none"
                />
              </div>
              <button onClick={clearFilters} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/30 rounded-lg px-4 py-2.5 font-medium transition-all">
                Clear Filters
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[300px]">
            {filteredRides.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-gray-900/50 rounded-2xl border border-gray-800">
                <div className="text-5xl mb-4 opacity-50">🛣️</div>
                <p className="text-xl text-gray-400 font-medium">No rides found</p>
                <p className="text-gray-600 text-sm mt-1">Try changing filters or check back later</p>
              </div>
            ) : (
              filteredRides.map((ride, index) => {
                const availableSeats = ride.seats - ride.bookedSeats
                if (availableSeats <= 0) return null

                let displayPrice = ride.pricePerSeat
                let discountTag = ''
                
                if (currentUser && currentUser.isStudent) {
                  const discount = ride.pricePerSeat * 0.15
                  displayPrice = Math.round(ride.pricePerSeat - discount)
                  discountTag = <span className="bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ml-2">Student</span>
                }

                return (
                  <div key={ride.id} className="royal-card rounded-2xl p-5 card-hover ride-card-animate flex flex-col h-full" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xl border border-gray-700">
                          {getVehicleEmoji(ride.vehicleType)}
                        </div>
                        <div>
                          <h3 className="font-bold text-white leading-tight">{ride.driverName}</h3>
                          <p className="text-gray-500 text-xs uppercase tracking-wide">{ride.vehicleType}</p>
                        </div>
                      </div>
                      <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-md">
                        {availableSeats} LEFT
                      </span>
                    </div>
                    
                    <div className="space-y-3 mb-6 flex-grow">
                      <div className="flex flex-col gap-1 relative pl-4 border-l-2 border-gray-700">
                        <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-yellow-500"></div>
                        <div className="absolute -left-[5px] bottom-0 w-2 h-2 rounded-full bg-gray-500"></div>
                        
                        <div className="mb-2">
                          <p className="text-gray-500 text-xs">From</p>
                          <p className="text-gray-200 text-sm font-medium truncate" title={ride.from}>{ride.from}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">To</p>
                          <p className="text-gray-200 text-sm font-medium truncate" title={ride.to}>{ride.to}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center bg-black/30 p-3 rounded-lg">
                        <div>
                          <p className="text-gray-500 text-xs">Date & Time</p>
                          <p className="text-gray-300 text-sm font-bold">{ride.date}, {ride.time}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-500 text-xs">Price</p>
                          <div className="flex items-center justify-end">
                            <span className="text-yellow-400 font-bold text-lg">₹{displayPrice}</span>
                            {discountTag}
                          </div>
                        </div>
                      </div>
                      {ride.notes && <p className="text-gray-500 text-xs italic mt-2">"{ride.notes}"</p>}
                    </div>
                    
                    <Link to="/book-ride" className="mt-auto">
                      <button className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-xl transition-colors shadow-lg shadow-yellow-500/10 flex items-center justify-center gap-2">
                        <span>Book Seat</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </Link>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-[#121212]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">RideFusion Experience</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Join thousands of students and residents moving freely across Rajpura.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${images[num]})` }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90"></div>
                <div className="absolute bottom-0 left-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform">
                  <h4 className="text-xl font-bold text-yellow-400">
                    {num === 1 ? 'Safe Travels' : num === 2 ? 'City Access' : num === 3 ? 'Quick Bikes' : 'Premium'}
                  </h4>
                  <p className="text-gray-300 text-sm mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {num === 1 ? 'Verified Drivers' : num === 2 ? 'Every Corner' : num === 3 ? 'Beat Traffic' : 'AC Comfort'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-20 gold-gradient">Choose Your Ride</h2>
          
          {[
            { type: 'Car', emoji: '🚗', title: 'Comfort Cars', desc: 'Ideal for groups and longer distances. Enjoy AC, music, and a dust-free ride across Rajpura.', features: ['Air Conditioned', '4 Seater Capacity', 'From ₹20/km'], img: images[5], reverse: false },
            { type: 'Auto', emoji: '🛺', title: 'Smart Auto', desc: 'The classic choice. Navigate narrow lanes easily and save money on daily commutes.', features: ['Budget Friendly', '3 Seater Capacity', 'From ₹10 Base Fare'], img: images[6], reverse: true },
            { type: 'Bike', emoji: '🏍️', title: 'Rapid Bike', desc: 'Solo traveler? Reach your class or meeting in record time. Helmet included.', features: ['Fastest Option', '1 Seater', 'From ₹8 Base Fare'], img: images[7], reverse: false }
          ].map((vehicle, idx) => (
            <div key={idx} className={`flex flex-col lg:flex-row${vehicle.reverse ? '-reverse' : ''} items-center gap-12 ${idx < 2 ? 'mb-24' : ''}`}>
              <div className="w-full lg:w-1/2 relative group">
                <div className={`absolute -inset-2 bg-gradient-to-${vehicle.reverse ? 'l' : 'r'} from-yellow-600 to-transparent opacity-20 blur-lg group-hover:opacity-40 transition`}></div>
                <div className="relative h-80 bg-gray-800 rounded-2xl overflow-hidden border border-gray-700">
                  <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${vehicle.img})` }}></div>
                </div>
              </div>
              <div className="w-full lg:w-1/2 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-2xl">{vehicle.emoji}</div>
                  <h3 className="text-3xl font-bold text-white">{vehicle.title}</h3>
                </div>
                <p className="text-gray-400 text-lg leading-relaxed">{vehicle.desc}</p>
                <ul className="space-y-3">
                  {vehicle.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-gray-300">
                      <span className="text-yellow-500 mr-3">✓</span> {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 px-4 bg-[#0f0f0f]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 text-white">Why RideFusion?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🎓', title: 'Student Discounts', desc: 'Verify your college ID and get flat 15% OFF on all rides.' },
              { icon: '🕒', title: 'Pre-Booking', desc: 'Schedule your rides up to 2 days in advance for exams.' },
              { icon: '🛡️', title: 'Verified Drivers', desc: 'Locals you can trust. All documents verified manually.' }
            ].map((item, idx) => (
              <div key={idx} className="royal-card p-8 rounded-2xl text-center hover:border-yellow-500/50 transition-colors group">
                <div className="w-16 h-16 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 group-hover:bg-yellow-500 group-hover:text-black transition-colors">{item.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Home


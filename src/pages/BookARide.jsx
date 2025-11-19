import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

const PASS_OPTIONS = [
  { 
    id: '1', 
    title: 'Rajpura → Chandigarh', 
    price: 2200, 
    subtitle: 'College Daily',
    route: { from: 'Rajpura', to: 'Chandigarh' },
    validDays: 30
  },
  { 
    id: '2', 
    title: 'Campus Loop', 
    price: 1200, 
    subtitle: 'Hostel Shuttle',
    route: { from: 'Campus', to: 'Hostel' },
    validDays: 30
  }
]

const currency = (val) => `₹${Number(val).toLocaleString('en-IN')}`
const uid = () => Date.now().toString(36)

const Toast = ({ msg, type }) => (
  <div className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border flex items-center gap-4 animate-bounce-in ${type === 'error' ? 'bg-red-900/90 border-red-500' : 'bg-green-900/90 border-green-500'}`}>
    <span>{type === 'error' ? '⚠️' : '🎉'}</span>
    <p className="text-sm font-bold text-white">{msg}</p>
  </div>
)

const BookARide = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [rides, setRides] = useState([])
  const [bookings, setBookings] = useState([])
  const [wallet, setWallet] = useState(0)
  const [walletHistory, setWalletHistory] = useState([])
  const [processingId, setProcessingId] = useState(null)
  const [toast, setToast] = useState(null)
  const [topUpAmount, setTopUpAmount] = useState('')
  const [monthlyPasses, setMonthlyPasses] = useState([])
  const [purchasingPassId, setPurchasingPassId] = useState(null)

  const [filters, setFilters] = useState({ 
    from: '', 
    to: '', 
    date: '',
    womenOnly: false,
    examSpecial: false
  })

  useEffect(() => {
    const init = async () => {
      const storedUser = localStorage.getItem('currentUser')
      if (!storedUser) {
        navigate('/login')
        return
      }
      const userData = JSON.parse(storedUser)
      setUser(userData)

      loadWallet(userData.id)
      loadMonthlyPasses(userData.id)
      await fetchRides()
      await fetchBookings(userData.id)
    }
    init()
  }, [navigate])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadWallet = (id) => {
    const data = JSON.parse(localStorage.getItem(`wallet_v2_${id}`) || '{"balance":0,"history":[]}')
    setWallet(data.balance)
    setWalletHistory(data.history)
  }

  const updateWallet = (newBal, historyItem) => {
    const newHistory = [historyItem, ...walletHistory].slice(0, 10)
    setWallet(newBal)
    setWalletHistory(newHistory)
    localStorage.setItem(`wallet_v2_${user.id}`, JSON.stringify({ balance: newBal, history: newHistory }))
  }

  const loadMonthlyPasses = (id) => {
    const stored = localStorage.getItem(`monthlyPasses_${id}`)
    if (stored) {
      const passes = JSON.parse(stored)
      // Filter out expired passes
      const activePasses = passes.filter(pass => {
        const expiryDate = new Date(pass.purchasedDate)
        expiryDate.setDate(expiryDate.getDate() + pass.validDays)
        return expiryDate > new Date()
      })
      setMonthlyPasses(activePasses)
      if (activePasses.length !== passes.length) {
        localStorage.setItem(`monthlyPasses_${id}`, JSON.stringify(activePasses))
      }
    }
  }

  const handlePurchasePass = async (pass) => {
    if (purchasingPassId) return
    if (wallet < pass.price) {
      showToast("Insufficient Balance", "error")
      return
    }

    setPurchasingPassId(pass.id)
    try {
      const newPass = {
        id: uid(),
        passId: pass.id,
        title: pass.title,
        route: pass.route,
        purchasedDate: new Date().toISOString(),
        validDays: pass.validDays,
        price: pass.price
      }

      const updatedPasses = [...monthlyPasses, newPass]
      setMonthlyPasses(updatedPasses)
      localStorage.setItem(`monthlyPasses_${user.id}`, JSON.stringify(updatedPasses))

      updateWallet(wallet - pass.price, {
        id: uid(),
        desc: `Monthly Pass: ${pass.title}`,
        amount: pass.price,
        type: 'debit',
        date: new Date().toLocaleDateString()
      })

      showToast(`Monthly Pass Purchased! Valid for ${pass.validDays} days`)
    } catch (err) {
      showToast("Purchase Failed", "error")
    } finally {
      setPurchasingPassId(null)
    }
  }

  const getActivePassForRide = (ride) => {
    return monthlyPasses.find(pass => {
      const rideFrom = ride.from.toLowerCase()
      const rideTo = ride.to.toLowerCase()
      const passFrom = pass.route.from.toLowerCase()
      const passTo = pass.route.to.toLowerCase()
      
      // Check if ride matches pass route (either direction)
      return (rideFrom.includes(passFrom) || passFrom.includes(rideFrom)) &&
             (rideTo.includes(passTo) || passTo.includes(rideTo))
    })
  }

  const isPassExpired = (pass) => {
    const expiryDate = new Date(pass.purchasedDate)
    expiryDate.setDate(expiryDate.getDate() + pass.validDays)
    return expiryDate <= new Date()
  }

  const handleAddFunds = () => {
    const amt = parseInt(topUpAmount)
    if (!amt) return
    updateWallet(wallet + amt, {
      id: uid(),
      desc: 'Top Up',
      amount: amt,
      type: 'credit',
      date: new Date().toLocaleDateString()
    })
    setTopUpAmount('')
    showToast("Wallet Updated")
  }

  const fetchRides = async () => {
    if (!supabase) return
    const { data } = await supabase.from('rides').select('*').eq('status', 'active').order('createdAt', { ascending: false })
    setRides(data || [])
  }

  const fetchBookings = async (uid) => {
    if (!supabase) return
    const { data } = await supabase.from('bookings').select('*, rides(*)').eq('userId', uid).neq('status', 'cancelled').order('bookingDate', { ascending: false })
    setBookings(data || [])
  }

  const handleBook = async (ride) => {
    if (processingId) return
    
    // Check if user has an active monthly pass for this route
    const activePass = getActivePassForRide(ride)
    const finalPrice = activePass ? 0 : ride.pricePerSeat
    
    if (wallet < finalPrice) return showToast("Insufficient Balance", "error")
    
    setProcessingId(ride.id)
    try {
      const bookingData = {
        userId: user.id,
        rideId: ride.id,
        amount: finalPrice,
        status: 'confirmed',
        route: `${ride.from} → ${ride.to}`
      }
      
      // Add usedPass if monthly pass was used (optional column - see SUPABASE_MIGRATION.sql)
      // This will work even if the column doesn't exist (Supabase will ignore unknown columns in some cases)
      // If you get an error about unknown column, either add the column or remove this line
      if (activePass) {
        bookingData.usedPass = activePass.id
      }
      
      const { error: bError } = await supabase.from('bookings').insert([bookingData])
      if (bError) {
        // If error is about unknown column, retry without usedPass field
        if (bError.message && bError.message.includes('usedPass')) {
          delete bookingData.usedPass
          const { error: retryError } = await supabase.from('bookings').insert([bookingData])
          if (retryError) throw retryError
        } else {
          throw bError
        }
      }

      await supabase.from('rides').update({ bookedSeats: ride.bookedSeats + 1 }).eq('id', ride.id)

      if (finalPrice > 0) {
        updateWallet(wallet - finalPrice, {
          id: uid(),
          desc: `Ride: ${ride.from} → ${ride.to}`,
          amount: finalPrice,
          type: 'debit',
          date: new Date().toLocaleDateString()
        })
      } else {
        updateWallet(wallet, {
          id: uid(),
          desc: `Ride: ${ride.from} → ${ride.to} (Monthly Pass)`,
          amount: 0,
          type: 'debit',
          date: new Date().toLocaleDateString()
        })
      }

      showToast(activePass ? "Ride Booked with Monthly Pass! 🎫" : "Ride Booked!")
      await fetchRides()
      await fetchBookings(user.id)
    } catch (err) {
      showToast("Booking Failed", "error")
    } finally {
      setProcessingId(null)
    }
  }

  const handleCancel = async (booking) => {
    if (!window.confirm("Cancel booking? Refund will be processed.")) return
    try {
      await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', booking.id)
      if (booking.rides) {
        await supabase.from('rides').update({ bookedSeats: Math.max(0, booking.rides.bookedSeats - 1) }).eq('id', booking.rideId)
      }
      updateWallet(wallet + booking.amount, {
        id: uid(),
        desc: `Refund: ${booking.route}`,
        amount: booking.amount,
        type: 'credit',
        date: new Date().toLocaleDateString()
      })
      showToast("Refund Processed")
      await fetchRides()
      await fetchBookings(user.id)
    } catch (err) {
      showToast("Cancel Failed", "error")
    }
  }

  const filteredRides = rides.filter(r => {
    const search = filters.to.toLowerCase()
    const matchesLoc = (r.to.toLowerCase().includes(search) || r.from.toLowerCase().includes(search))
    const matchesWomen = filters.womenOnly ? r.womenOnly : true
    const matchesExam = filters.examSpecial ? r.examSpecial : true
    const matchesDate = filters.date ? r.date === filters.date : true

    return matchesLoc && matchesWomen && matchesExam && matchesDate && (r.seats > r.bookedSeats)
  })

  if (!user) return null

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#050505]">
      <Navbar />

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-yellow-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-yellow-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
    
          <div className="lg:col-span-8 space-y-6">
            
       
            <div className="glass-panel p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Find a Ride</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilters({...filters, womenOnly: !filters.womenOnly})}
                    className={`filter-chip px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 ${filters.womenOnly ? 'active-pink' : 'text-gray-400'}`}
                  >
                    <span>👩</span> Women Only
                  </button>
                  <button
                    onClick={() => setFilters({...filters, examSpecial: !filters.examSpecial})}
                    className={`filter-chip px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 ${filters.examSpecial ? 'active-blue' : 'text-gray-400'}`}
                  >
                    <span>🎓</span> Exam Special
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-500">📍</span>
                  <input
                    type="text"
                    placeholder="From"
                    value={filters.from}
                    onChange={e => setFilters({...filters, from: e.target.value})}
                    className="w-full bg-black/40 border border-gray-700 rounded-xl pl-11 py-3 text-white focus:border-yellow-500 outline-none"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-500">🏁</span>
                  <input
                    type="text"
                    placeholder="To (e.g. Rajpura)"
                    value={filters.to}
                    onChange={e => setFilters({...filters, to: e.target.value})}
                    className="w-full bg-black/40 border border-gray-700 rounded-xl pl-11 py-3 text-white focus:border-yellow-500 outline-none"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-500">📅</span>
                  <input
                    type="date"
                    value={filters.date}
                    onChange={e => setFilters({...filters, date: e.target.value})}
                    className="w-full bg-black/40 border border-gray-700 rounded-xl pl-11 py-3 text-white focus:border-yellow-500 outline-none text-gray-400"
                  />
                </div>
              </div>
            </div>

       
            <div className="space-y-4">
              <h3 className="text-gray-400 text-sm font-semibold ml-1">
                {filteredRides.length} Rides Available
                {filters.womenOnly && <span className="text-pink-400 ml-2">• Women Only</span>}
                {filters.examSpecial && <span className="text-blue-400 ml-2">• Exam Special</span>}
              </h3>
              
              {filteredRides.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-gray-800 rounded-2xl">
                  <div className="text-4xl mb-3">🤷‍♂️</div>
                  <p className="text-gray-500">No rides found matching your filters.</p>
                  <button
                    onClick={() => setFilters({from:'', to:'', date:'', womenOnly:false, examSpecial:false})}
                    className="text-yellow-500 text-sm mt-2 hover:underline"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                filteredRides.map(ride => (
                  <div key={ride.id} className="glass-panel p-5 rounded-2xl hover:border-yellow-500/30 transition duration-300 flex flex-col md:flex-row justify-between items-center gap-6 group relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500 opacity-0 group-hover:opacity-100 transition"></div>

                    <div className="flex-1">
                      <div className="flex gap-2 mb-2">
                        <span className="bg-gray-800 text-gray-300 text-[10px] uppercase px-2 py-0.5 rounded border border-gray-700">{ride.vehicleType}</span>
                        {ride.womenOnly && <span className="bg-pink-500/10 text-pink-400 border border-pink-500/30 text-[10px] px-2 py-0.5 rounded flex items-center gap-1">👩 Women Only</span>}
                        {ride.examSpecial && <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] px-2 py-0.5 rounded flex items-center gap-1">🎓 Exam Special</span>}
                      </div>

                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-white">{ride.driverName}</h3>
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span className="text-white">{ride.from}</span>
                        <span className="text-yellow-500">➜</span>
                        <span className="text-white">{ride.to}</span>
                      </div>
                      <div className="mt-2 text-xs text-gray-500 flex gap-4">
                        <span>📅 {ride.date}</span>
                        <span>⏰ {ride.time}</span>
                      </div>
                      {ride.notes && <div className="mt-2 text-xs text-gray-600 italic">"{ride.notes}"</div>}
                    </div>

                    <div className="flex flex-col items-end min-w-[100px] gap-2">
                      <div className="text-right">
                        {getActivePassForRide(ride) ? (
                          <>
                            <div className="text-lg font-bold text-green-400 line-through opacity-60">{currency(ride.pricePerSeat)}</div>
                            <div className="text-xl font-bold text-green-400">FREE</div>
                            <div className="text-[10px] text-green-400">🎫 Monthly Pass</div>
                          </>
                        ) : (
                          <>
                            <div className="text-2xl font-bold text-yellow-400">{currency(ride.pricePerSeat)}</div>
                            <div className="text-[10px] text-green-400">{ride.seats - ride.bookedSeats} seats left</div>
                          </>
                        )}
                      </div>
                      <button
                        onClick={() => handleBook(ride)}
                        disabled={processingId === ride.id}
                        className="btn-gold px-6 py-2 rounded-lg text-sm w-full disabled:opacity-50"
                      >
                        {processingId === ride.id ? '...' : 'Book'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

         
          <div className="lg:col-span-4 space-y-6">
            
         
            <div className="glass-panel p-5 rounded-2xl">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                <span>🎫</span> Your Trips
              </h3>
              {bookings.length === 0 ? (
                <p className="text-xs text-gray-500 italic py-2">No upcoming trips.</p>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {bookings.map(booking => (
                    <div key={booking.id} className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-bold text-gray-200">{booking.route}</span>
                        <span className="text-xs text-yellow-500">{currency(booking.amount)}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded">Confirmed</span>
                        <button onClick={() => handleCancel(booking)} className="text-[10px] text-red-400 hover:underline">Cancel</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase">Wallet</p>
                  <h2 className="text-3xl font-bold text-yellow-400">{currency(wallet)}</h2>
                </div>
                <span className="text-2xl">👛</span>
              </div>
              <div className="flex gap-2 mb-4">
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="Amount"
                  className="w-full bg-black/40 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:border-yellow-500 outline-none"
                />
                <button onClick={handleAddFunds} className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm border border-gray-600 hover:bg-gray-700">Add</button>
              </div>
              <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                {walletHistory.map(item => (
                  <div key={item.id} className="flex justify-between text-[10px] border-b border-white/5 pb-1">
                    <span className="text-gray-400">{item.desc}</span>
                    <span className={item.type === 'credit' ? 'text-green-400' : 'text-red-400'}>
                      {item.type === 'credit' ? '+' : '-'}{currency(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

           
            <div className="glass-panel p-5 rounded-2xl">
              <h3 className="font-bold text-white mb-3 text-sm flex items-center gap-2">
                <span>🎫</span> Monthly Passes
              </h3>
              
              {monthlyPasses.length > 0 && (
                <div className="mb-4 pb-4 border-b border-white/10">
                  <div className="text-[10px] text-gray-400 mb-2 uppercase">Active Passes</div>
                  <div className="space-y-2">
                    {monthlyPasses.map(pass => {
                      const expiryDate = new Date(pass.purchasedDate)
                      expiryDate.setDate(expiryDate.getDate() + pass.validDays)
                      const daysLeft = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24))
                      
                      return (
                        <div key={pass.id} className="bg-green-500/10 border border-green-500/30 p-2 rounded-lg">
                          <div className="text-xs font-bold text-green-400">{pass.title}</div>
                          <div className="text-[10px] text-gray-400 mt-1">
                            {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {PASS_OPTIONS.map(pass => {
                  const hasPass = monthlyPasses.some(p => p.passId === pass.id && !isPassExpired(p))
                  
                  return (
                    <div 
                      key={pass.id} 
                      className={`bg-black/40 border p-3 rounded-xl flex justify-between items-center group transition ${
                        hasPass 
                          ? 'border-green-500/50 bg-green-500/5' 
                          : 'border-gray-700 hover:border-yellow-500/50'
                      }`}
                    >
                      <div className="flex-1">
                        <div className={`text-xs font-bold ${hasPass ? 'text-green-400' : 'text-gray-300 group-hover:text-white'}`}>
                          {pass.title}
                          {hasPass && <span className="ml-2 text-[10px]">✓ Active</span>}
                        </div>
                        <div className="text-[10px] text-gray-500">{pass.subtitle}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="text-xs font-bold text-yellow-500">{currency(pass.price)}</div>
                        {!hasPass && (
                          <button
                            onClick={() => handlePurchasePass(pass)}
                            disabled={purchasingPassId === pass.id || wallet < pass.price}
                            className="text-[10px] bg-yellow-500 hover:bg-yellow-400 text-black px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {purchasingPassId === pass.id ? '...' : 'Buy'}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
          
          {toast && <Toast msg={toast.msg} type={toast.type} />}
        </div>
      </div>
    </div>
  )
}

export default BookARide


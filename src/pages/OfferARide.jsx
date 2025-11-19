import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

const getNextHour = () => {
  const d = new Date()
  d.setHours(d.getHours() + 1)
  d.setMinutes(0)
  return d.toTimeString().slice(0, 5)
}

const getToday = () => new Date().toISOString().split('T')[0]
const getLimitDate = () => {
  const d = new Date()
  d.setDate(d.getDate() + 2)
  return d.toISOString().split('T')[0]
}

const Toast = ({ msg, type, onClose }) => (
  <div className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border flex items-center gap-4 animate-bounce-in ${type === 'error' ? 'bg-red-900/90 border-red-500 text-white' : 'bg-green-900/90 border-green-500 text-white'}`}>
    <span className="text-xl">{type === 'error' ? '⚠️' : '🎉'}</span>
    <div>
      <p className="font-bold">{type === 'error' ? 'Error' : 'Success'}</p>
      <p className="text-sm opacity-90">{msg}</p>
    </div>
  </div>
)

const OfferARide = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [myRides, setMyRides] = useState([])
  const [processing, setProcessing] = useState(false)
  const [toast, setToast] = useState(null)
  
  const [form, setForm] = useState({
    vehicle: 'Car',
    from: '',
    to: '',
    date: getToday(),
    time: getNextHour(),
    seats: 3,
    price: 50,
    notes: '',
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
      await fetchMyRides(userData.id)
    }
    init()
  }, [navigate])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchMyRides = async (userId) => {
    if (!supabase) return
    const { data } = await supabase
      .from('rides')
      .select('*')
      .eq('driverId', userId)
      .order('createdAt', { ascending: false })
    setMyRides(data || [])
  }

  const handleDelete = async (rideId) => {
    if (!window.confirm("Delete this offer?")) return
    const { error } = await supabase.from('rides').delete().eq('id', rideId)
    if (!error) {
      showToast("Ride deleted")
      fetchMyRides(user.id)
    }
  }

  const handleSubmit = async () => {
    if (!form.from || !form.to) return showToast("Please select locations", "error")
    if (form.from === form.to) return showToast("Locations cannot be same", "error")
    
    setProcessing(true)
    
    const rideData = {
      driverId: user.id,
      driverName: user.name,
      driverPhone: user.phone,
      vehicleType: form.vehicle,
      from: form.from,
      to: form.to,
      date: form.date,
      time: form.time,
      seats: parseInt(form.seats),
      pricePerSeat: parseInt(form.price),
      bookedSeats: 0,
      status: 'active',
      notes: form.notes,
      womenOnly: form.womenOnly,
      examSpecial: form.examSpecial,
      createdAt: new Date().toISOString()
    }

    const { error } = await supabase.from('rides').insert([rideData])
    
    setProcessing(false)
    if (error) {
      console.error(error)
      showToast("Failed to publish ride", "error")
    } else {
      showToast("Ride Published Successfully!")
      fetchMyRides(user.id)
      setForm(prev => ({ ...prev, from: '', to: '', notes: '', womenOnly: false, examSpecial: false }))
    }
  }

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
          
          {/* LEFT: FORM (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-yellow-500/20">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Publish a Ride</h2>
                  <p className="text-gray-400 text-sm">Pre-booking open for next 2 days.</p>
                </div>
                <div className="text-2xl">🚕</div>
              </div>

              <div className="space-y-6">
                
                {/* 1. Ride Type Toggles */}
                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() => setForm({...form, womenOnly: !form.womenOnly})}
                    className={`toggle-card p-3 rounded-xl flex items-center gap-3 cursor-pointer ${form.womenOnly ? 'women-active' : 'text-gray-400'}`}
                  >
                    <span className="text-xl">👩</span>
                    <div>
                      <div className="text-sm font-bold">Women Only</div>
                      <div className="text-[10px] opacity-70">Safe travel for ladies</div>
                    </div>
                    {form.womenOnly && <span className="ml-auto text-pink-500">✔</span>}
                  </div>

                  <div
                    onClick={() => setForm({...form, examSpecial: !form.examSpecial})}
                    className={`toggle-card p-3 rounded-xl flex items-center gap-3 cursor-pointer ${form.examSpecial ? 'exam-active' : 'text-gray-400'}`}
                  >
                    <span className="text-xl">🎓</span>
                    <div>
                      <div className="text-sm font-bold">Exam Special</div>
                      <div className="text-[10px] opacity-70">Priority for students</div>
                    </div>
                    {form.examSpecial && <span className="ml-auto text-blue-400">✔</span>}
                  </div>
                </div>

                <hr className="border-white/10" />

                {/* 2. Vehicle & Route */}
                <div className="grid grid-cols-3 gap-3">
                  {['Car', 'Auto', 'Bike'].map(v => (
                    <div
                      key={v}
                      onClick={() => setForm({...form, vehicle: v})}
                      className={`select-card p-2 rounded-xl text-center ${form.vehicle === v ? 'selected' : ''}`}
                    >
                      <div className="text-xl">{v === 'Car' ? '🚗' : v === 'Auto' ? '🛺' : '🏍️'}</div>
                      <div className="text-xs font-medium mt-1">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={form.from}
                    onChange={e => setForm({...form, from: e.target.value})}
                    className="w-full bg-black/40 border border-gray-700 rounded-xl px-3 py-3 text-white focus:border-yellow-500 outline-none"
                  >
                    <option value="">From Location</option>
                    <option value="Chitkara University">Chitkara University</option>
                    <option value="Rajpura Railway Station">Rajpura Railway Station</option>
                    <option value="Rajpura Bus Stand">Rajpura Bus Stand</option>
                  </select>
                  <select
                    value={form.to}
                    onChange={e => setForm({...form, to: e.target.value})}
                    className="w-full bg-black/40 border border-gray-700 rounded-xl px-3 py-3 text-white focus:border-yellow-500 outline-none"
                  >
                    <option value="">To Location</option>
                    <option value="Chitkara University">Chitkara University</option>
                    <option value="Rajpura Railway Station">Rajpura Railway Station</option>
                    <option value="Rajpura Bus Stand">Rajpura Bus Stand</option>
                  </select>
                </div>

                {/* 3. Smart Date/Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Date (Max 2 Days)</label>
                    <input
                      type="date"
                      value={form.date}
                      min={getToday()}
                      max={getLimitDate()}
                      onChange={e => setForm({...form, date: e.target.value})}
                      className="w-full bg-black/40 border border-gray-700 rounded-xl px-3 py-2 text-white focus:border-yellow-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Time</label>
                    <input
                      type="time"
                      value={form.time}
                      onChange={e => setForm({...form, time: e.target.value})}
                      className="w-full bg-black/40 border border-gray-700 rounded-xl px-3 py-2 text-white focus:border-yellow-500 outline-none"
                    />
                  </div>
                </div>

                {/* 4. Seats/Price */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Seats</label>
                    <div className="flex items-center bg-black/40 border border-gray-700 rounded-xl p-1">
                      <button
                        onClick={() => setForm(p => ({...p, seats: Math.max(1, p.seats-1)}))}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white font-bold"
                      >
                        -
                      </button>
                      <span className="flex-1 text-center font-bold text-white">{form.seats}</span>
                      <button
                        onClick={() => setForm(p => ({...p, seats: Math.min(6, p.seats+1)}))}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Price (₹)</label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={e => setForm({...form, price: e.target.value})}
                      className="w-full bg-black/40 border border-gray-700 rounded-xl px-3 py-2 text-white focus:border-yellow-500 outline-none h-[42px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Notes (Optional)</label>
                  <textarea
                    value={form.notes}
                    onChange={e => setForm({...form, notes: e.target.value})}
                    placeholder="Any additional information..."
                    className="w-full bg-black/40 border border-gray-700 rounded-xl px-3 py-2 text-white focus:border-yellow-500 outline-none"
                    rows="2"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={processing}
                  className="w-full btn-gold py-4 rounded-xl text-lg font-bold shadow-lg shadow-yellow-500/20 disabled:opacity-50"
                >
                  {processing ? 'Publishing...' : 'Publish Ride'}
                </button>

              </div>
            </div>
          </div>

          {/* RIGHT: DASHBOARD (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel p-6 rounded-2xl min-h-[500px]">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span>📋</span> Active Offers
              </h3>

              {myRides.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-800 rounded-xl">
                  <p className="text-4xl mb-2">📭</p>
                  <p className="text-gray-500 text-sm">No active rides.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {myRides.map(ride => (
                    <div key={ride.id} className="bg-white/5 p-4 rounded-xl border border-white/10 relative group">
                      
                      {/* Badge Section */}
                      <div className="flex gap-2 mb-2">
                        {ride.womenOnly && <span className="text-[9px] bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded border border-pink-500/30">👩 Women Only</span>}
                        {ride.examSpecial && <span className="text-[9px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">🎓 Exam Special</span>}
                      </div>

                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-yellow-400 font-bold text-sm">{ride.from} ➝ {ride.to}</div>
                          <div className="text-gray-400 text-xs mt-1">{ride.date} @ {ride.time}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-white">₹{ride.pricePerSeat}</div>
                          <div className="text-[10px] text-green-400">{ride.seats - ride.bookedSeats} seats left</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 pt-3 border-t border-white/5 mt-3">
                        <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded border border-gray-700">{ride.vehicleType}</span>
                        <div className="flex-1"></div>
                        <button
                          onClick={() => handleDelete(ride.id)}
                          className="text-xs text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        </div>
      </div>
    </div>
  )
}

export default OfferARide


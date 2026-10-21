import React from 'react';
import { Search, MapPin, Calendar, Star, ChevronRight, CheckCircle2, User, ChevronLeft, Calendar as CalendarIcon, Clock, CheckCircle } from 'lucide-react';

export default function BookingFlow() {
  return (
    <section className="py-24 bg-gray-50/50 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <span className="text-accent font-bold tracking-wider text-sm uppercase mb-3 block">Patient Booking Flow</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-poppins">How Patients Book Appointments</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Find a healthcare professional and book your appointment in just a few simple steps.</p>
        </div>

        {/* Scrollable Container for Steps */}
        <div className="flex flex-col xl:flex-row items-center xl:items-start gap-8 xl:gap-4 overflow-x-auto pb-12 snap-x snap-mandatory hide-scrollbar">
          
          {/* STEP 1 */}
          <div className="flex-shrink-0 w-full md:w-[380px] snap-center">
            <h3 className="font-bold text-gray-800 mb-4 text-center">1. Search for a Professional</h3>
            <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <div className="flex justify-center mb-6">
                <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center">
                  <Search className="w-6 h-6 text-teal-600" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                  <input disabled type="text" placeholder="Search doctor, specialist..." className="w-full bg-gray-50 rounded-xl py-3 pl-10 pr-4 text-sm border-transparent" />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                  <input disabled type="text" placeholder="Select City / Area" className="w-full bg-gray-50 rounded-xl py-3 pl-10 pr-4 text-sm border-transparent" />
                </div>
                <input disabled type="text" placeholder="Select Specialization" className="w-full bg-gray-50 rounded-xl py-3 px-4 text-sm border-transparent" />
                <button className="w-full bg-teal-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-md mt-2">Search Professionals</button>
              </div>
            </div>
          </div>

          <div className="hidden xl:flex h-[300px] items-center justify-center text-teal-300">
            <ChevronRight className="w-8 h-8" />
          </div>

          {/* STEP 2 */}
          <div className="flex-shrink-0 w-full md:w-[380px] snap-center">
            <h3 className="font-bold text-gray-800 mb-4 text-center">2. View Search Results</h3>
            <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <div className="flex items-start gap-4 mb-4">
                <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Doctor" className="w-14 h-14 rounded-full object-cover" />
                <div>
                  <h4 className="font-bold text-gray-900">Dr. Priya Sharma</h4>
                  <p className="text-sm text-teal-600 font-medium">Homeopathy Doctor</p>
                  <div className="flex items-center gap-1 mt-1 text-xs font-bold text-gray-700">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> 4.8 <span className="font-normal text-gray-500">(126 reviews)</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs text-gray-600"><User className="w-3.5 h-3.5" /> 8+ years experience</div>
                <div className="flex items-center gap-2 text-xs text-gray-600"><MapPin className="w-3.5 h-3.5" /> Chennai, Tamil Nadu</div>
                <div className="flex items-center justify-between text-xs font-bold text-gray-800 pt-2 border-t border-gray-50">
                  <span>Consultation Fee</span>
                  <span className="text-teal-600 text-sm">₹600</span>
                </div>
              </div>
              <button className="w-full bg-white border-2 border-teal-600 text-teal-600 py-3 rounded-xl font-bold text-sm hover:bg-teal-50">View Profile</button>
            </div>
          </div>

          <div className="hidden xl:flex h-[300px] items-center justify-center text-teal-300">
            <ChevronRight className="w-8 h-8" />
          </div>

          {/* STEP 3 */}
          <div className="flex-shrink-0 w-full md:w-[480px] snap-center">
            <h3 className="font-bold text-gray-800 mb-4 text-center">3. Check Availability</h3>
            <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col sm:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <ChevronLeft className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-bold text-gray-800">April 2025</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-gray-400 font-bold mb-2">
                  <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-700">
                  <span className="text-gray-300">30</span><span className="text-gray-300">31</span>
                  <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                  <span>6</span><span>7</span><span>8</span><span>9</span><span>10</span><span>11</span><span>12</span>
                  <span>13</span><span>14</span><span className="bg-teal-600 text-white rounded flex items-center justify-center w-6 h-6 mx-auto">15</span><span>16</span><span>17</span><span>18</span><span>19</span>
                  <span>20</span><span>21</span><span>22</span><span>23</span><span>24</span><span>25</span><span>26</span>
                </div>
              </div>
              <div className="flex-1 border-l border-gray-100 pl-6">
                <h4 className="text-xs font-bold text-gray-800 mb-3">Available Time Slots</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="border border-gray-200 rounded py-1.5 text-center text-[10px] text-gray-500">09:00 AM</div>
                  <div className="bg-teal-600 text-white rounded py-1.5 text-center text-[10px] font-bold shadow-sm">10:00 AM</div>
                  <div className="border border-gray-200 rounded py-1.5 text-center text-[10px] text-gray-500">11:00 AM</div>
                  <div className="border border-gray-200 rounded py-1.5 text-center text-[10px] text-gray-500">02:00 PM</div>
                  <div className="border border-gray-200 rounded py-1.5 text-center text-[10px] text-gray-500">04:00 PM</div>
                </div>
                <button className="w-full bg-primary text-white py-2.5 rounded-lg font-bold text-[11px] mt-6 shadow-md">Book Slot</button>
              </div>
            </div>
          </div>

          <div className="hidden xl:flex h-[300px] items-center justify-center text-teal-300">
            <ChevronRight className="w-8 h-8" />
          </div>

          {/* STEP 4 & 5 Wrapped for grid visual */}
          <div className="flex-shrink-0 w-full md:w-[380px] snap-center space-y-8">
            <div>
              <h3 className="font-bold text-gray-800 mb-4 text-center">4. Confirm Booking</h3>
              <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-50">
                  <img src="https://randomuser.me/api/portraits/women/44.jpg" className="w-10 h-10 rounded-full" />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Dr. Priya Sharma</h4>
                    <p className="text-[10px] text-teal-600 font-medium">Homeopathy Doctor</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs"><span className="text-gray-500 flex items-center gap-1"><CalendarIcon className="w-3 h-3"/> Date</span><span className="font-bold">Tue, 15 April 2025</span></div>
                  <div className="flex justify-between text-xs"><span className="text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3"/> Time</span><span className="font-bold">10:00 AM</span></div>
                  <div className="flex justify-between text-xs pt-2"><span className="text-gray-500">Fee</span><span className="font-bold text-teal-600">₹600</span></div>
                </div>
                <button className="w-full bg-teal-600 text-white py-2.5 rounded-lg font-bold text-[11px] shadow-sm mb-2">Confirm & Book</button>
                <button className="w-full bg-gray-50 text-gray-500 py-2.5 rounded-lg font-bold text-[11px]">Edit Details</button>
              </div>
            </div>

            <div className="hidden xl:flex items-center justify-center text-teal-300">
              <ChevronRight className="w-8 h-8 rotate-90 xl:rotate-0" />
            </div>

            <div>
              <h3 className="font-bold text-gray-800 mb-4 text-center">5. Appointment Confirmed</h3>
              <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-teal-100 text-center">
                <CheckCircle className="w-12 h-12 text-teal-500 mx-auto mb-3" />
                <h4 className="font-bold text-gray-900 text-sm mb-1">Booking Confirmed!</h4>
                <p className="text-[10px] text-gray-500 mb-4">Details sent to your registered contact.</p>
                <div className="bg-gray-50 rounded-xl p-3 text-left mb-4">
                  <p className="text-xs font-bold text-gray-800 border-b border-gray-200 pb-2 mb-2">ID: #CV-8924</p>
                  <p className="text-[10px] text-gray-600">Dr. Priya Sharma • 15 Apr, 10:00 AM</p>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 bg-white border border-gray-200 text-gray-600 py-2 rounded text-[10px] font-bold hover:bg-gray-50">Reschedule</button>
                  <button className="flex-1 bg-teal-600 text-white py-2 rounded text-[10px] font-bold shadow-sm">View Details</button>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

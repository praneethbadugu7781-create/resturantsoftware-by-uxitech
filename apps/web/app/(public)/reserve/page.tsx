"use client";

import { useState } from "react";
import { PublicShell } from "@/components/shared/public-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, Users, CheckCircle2, ChevronRight, User, Phone, Mail, FileText } from "lucide-react";

export default function ReservePage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    date: "",
    timeSlot: "",
    guestCount: 2,
    area: "AC Dining",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const areas = [
    { name: "AC Dining", desc: "Elegant, cool indoor family seating", capacity: "2-8 Guests" },
    { name: "Family Zone", desc: "Spacious seating ideal for larger groups", capacity: "4-12 Guests" },
    { name: "Outdoor", desc: "Al fresco rooftop dining experience", capacity: "2-6 Guests" }
  ];

  const timeSlots = ["12:30 PM", "01:30 PM", "02:30 PM", "07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM"];

  const handleIncrement = () => {
    if (formData.guestCount < 12) {
      setFormData((prev) => ({ ...prev, guestCount: prev.guestCount + 1 }));
    }
  };

  const handleDecrement = () => {
    if (formData.guestCount > 1) {
      setFormData((prev) => ({ ...prev, guestCount: prev.guestCount - 1 }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.date || !formData.timeSlot) {
      alert("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    // Simulate booking API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <PublicShell>
      <section className="mx-auto max-w-4xl px-4 py-12 animate-fade-in">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-clay">Dine-In Booking</p>
          <h1 className="text-4xl font-extrabold text-ink mt-2">Reserve Your Table</h1>
          <p className="text-sm text-ink/60 mt-2">Experience premium hospitality at UXITECH Restaurant Software</p>
        </div>

        {isSuccess ? (
          <div className="mx-auto max-w-md rounded-2xl border border-black/5 bg-white p-8 shadow-soft text-center animate-scale-up">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-leaf/10 text-leaf">
              <CheckCircle2 className="h-10 w-10 animate-bounce" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-ink">Booking Confirmed!</h2>
            <p className="mt-3 text-sm text-ink/60 leading-relaxed">
              Thank you, <span className="font-semibold text-ink">{formData.name}</span>. Your table in the <span className="font-semibold text-leaf">{formData.area}</span> has been reserved for <span className="font-semibold text-ink">{formData.date}</span> at <span className="font-semibold text-ink">{formData.timeSlot}</span>.
            </p>
            <div className="mt-6 rounded-lg bg-mist/30 p-4 text-left border border-black/5 space-y-2 text-xs">
              <p className="text-ink/50 uppercase font-semibold">Booking Summary</p>
              <p className="text-ink"><strong>Guests:</strong> {formData.guestCount} People</p>
              <p className="text-ink"><strong>Phone:</strong> {formData.phone}</p>
              {formData.notes && <p className="text-ink"><strong>Notes:</strong> {formData.notes}</p>}
            </div>
            <button
              onClick={() => {
                setStep(1);
                setIsSuccess(false);
                setFormData({
                  name: "",
                  phone: "",
                  email: "",
                  date: "",
                  timeSlot: "",
                  guestCount: 2,
                  area: "AC Dining",
                  notes: ""
                });
              }}
              className="mt-8 w-full rounded-xl bg-leaf hover:bg-leaf/90 py-3.5 font-bold text-white shadow-sm transition-all duration-200"
            >
              Book Another Table
            </button>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            {/* Step indicators */}
            <div className="md:col-span-1 space-y-4">
              {[
                { step: 1, title: "Area & Date", desc: "Choose seating and timing" },
                { step: 2, title: "Guest Count", desc: "Select number of people" },
                { step: 3, title: "Contact Details", desc: "Finalize reservation details" }
              ].map((s) => (
                <div
                  key={s.step}
                  onClick={() => s.step < step && setStep(s.step)}
                  className={`flex items-start gap-3 rounded-xl p-4 border transition-all duration-200 cursor-pointer ${
                    step === s.step
                      ? "border-leaf bg-white shadow-soft scale-102"
                      : s.step < step
                      ? "border-black/5 bg-mist/20 opacity-80"
                      : "border-black/5 bg-white/50 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    step === s.step ? "bg-leaf text-white" : "bg-ink/10 text-ink"
                  }`}>
                    {s.step}
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-ink">{s.title}</h3>
                    <p className="text-xs text-ink/50 mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Form Steps */}
            <Card className="md:col-span-2 p-6 md:p-8 hover-premium flex flex-col justify-between min-h-[420px]">
              <form onSubmit={handleSubmit} className="h-full flex flex-col justify-between">
                {step === 1 && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h2 className="text-xl font-bold text-ink flex items-center gap-2">Select Dining Area</h2>
                      <div className="grid gap-3 mt-3 sm:grid-cols-3">
                        {areas.map((a) => (
                          <div
                            key={a.name}
                            onClick={() => setFormData((prev) => ({ ...prev, area: a.name }))}
                            className={`rounded-xl border p-4 text-center cursor-pointer transition-all ${
                              formData.area === a.name
                                ? "border-leaf bg-leaf/5 ring-1 ring-leaf"
                                : "border-black/10 bg-white hover:border-black/25"
                            }`}
                          >
                            <h3 className="font-bold text-sm text-ink">{a.name}</h3>
                            <p className="text-[10px] text-ink/55 mt-1">{a.desc}</p>
                            <span className="inline-block mt-3 text-[10px] bg-mist px-2 py-0.5 rounded text-ink/70 font-semibold">{a.capacity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-bold text-ink/65 uppercase tracking-wider">Select Date</label>
                        <div className="relative mt-2 flex items-center">
                          <Calendar className="absolute left-3 h-4 w-4 text-ink/40" />
                          <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                            className="w-full rounded-xl border border-black/10 py-3.5 pl-10 pr-4 text-sm outline-none focus:border-leaf focus:ring-1 focus:ring-leaf bg-white"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-ink/65 uppercase tracking-wider">Select Time Slot</label>
                        <div className="relative mt-2 flex items-center">
                          <Clock className="absolute left-3 h-4 w-4 text-ink/40" />
                          <select
                            value={formData.timeSlot}
                            onChange={(e) => setFormData((prev) => ({ ...prev, timeSlot: e.target.value }))}
                            className="w-full rounded-xl border border-black/10 py-3.5 pl-10 pr-4 text-sm outline-none focus:border-leaf focus:ring-1 focus:ring-leaf bg-white appearance-none"
                            required
                          >
                            <option value="">Choose a slot</option>
                            {timeSlots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button
                        type="button"
                        onClick={() => formData.date && formData.timeSlot && setStep(2)}
                        disabled={!formData.date || !formData.timeSlot}
                        className="inline-flex items-center gap-1.5"
                      >
                        Next Step <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h2 className="text-xl font-bold text-ink flex items-center gap-2"><Users className="h-5 w-5 text-leaf" /> Guest Count</h2>
                      <p className="text-xs text-ink/50 mt-1">Please select the number of guests attending.</p>
                      
                      <div className="flex items-center justify-center gap-6 mt-8 py-4 bg-mist/20 rounded-2xl border border-black/5">
                        <button
                          type="button"
                          onClick={handleDecrement}
                          className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white text-xl font-bold hover:bg-mist transition-colors active:scale-95"
                        >
                          -
                        </button>
                        <span className="text-4xl font-extrabold text-ink w-16 text-center">{formData.guestCount}</span>
                        <button
                          type="button"
                          onClick={handleIncrement}
                          className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white text-xl font-bold hover:bg-mist transition-colors active:scale-95"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button type="button" className="bg-transparent border border-black/10 text-ink hover:bg-mist" onClick={() => setStep(1)}>Back</Button>
                      <Button type="button" onClick={() => setStep(3)} className="inline-flex items-center gap-1.5">
                        Next Step <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <h2 className="text-xl font-bold text-ink">Contact Information</h2>
                      <p className="text-xs text-ink/50 mt-1">We will send a reservation confirmation to these details.</p>
                    </div>

                    <div className="space-y-3 mt-4">
                      <div className="relative flex items-center">
                        <User className="absolute left-3 h-4 w-4 text-ink/40" />
                        <input
                          type="text"
                          placeholder="Your Name *"
                          value={formData.name}
                          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                          className="w-full rounded-xl border border-black/10 py-3.5 pl-10 pr-4 text-sm outline-none focus:border-leaf focus:ring-1 focus:ring-leaf bg-white"
                          required
                        />
                      </div>

                      <div className="relative flex items-center">
                        <Phone className="absolute left-3 h-4 w-4 text-ink/40" />
                        <input
                          type="tel"
                          placeholder="Phone Number *"
                          value={formData.phone}
                          onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                          className="w-full rounded-xl border border-black/10 py-3.5 pl-10 pr-4 text-sm outline-none focus:border-leaf focus:ring-1 focus:ring-leaf bg-white"
                          required
                        />
                      </div>

                      <div className="relative flex items-center">
                        <Mail className="absolute left-3 h-4 w-4 text-ink/40" />
                        <input
                          type="email"
                          placeholder="Email Address"
                          value={formData.email}
                          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                          className="w-full rounded-xl border border-black/10 py-3.5 pl-10 pr-4 text-sm outline-none focus:border-leaf focus:ring-1 focus:ring-leaf bg-white"
                        />
                      </div>

                      <div className="relative flex items-start">
                        <FileText className="absolute left-3 top-3.5 h-4 w-4 text-ink/40" />
                        <textarea
                          placeholder="Special Requests (e.g. high chair, anniversary, food allergies)"
                          value={formData.notes}
                          onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                          className="w-full h-24 rounded-xl border border-black/10 py-3 pl-10 pr-4 text-sm outline-none focus:border-leaf focus:ring-1 focus:ring-leaf bg-white resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between pt-6">
                      <Button type="button" className="bg-transparent border border-black/10 text-ink hover:bg-mist" onClick={() => setStep(2)}>Back</Button>
                      <Button type="submit" disabled={isSubmitting} className="min-w-32">
                        {isSubmitting ? "Processing..." : "Confirm Booking"}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </Card>
          </div>
        )}
      </section>
    </PublicShell>
  );
}

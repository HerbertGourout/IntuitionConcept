import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Video, Phone, MapPin, Check, ArrowRight, ArrowLeft } from 'lucide-react';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface BookingCalendarProps {
  onBooking?: (date: Date, time: string, type: string) => void;
}

/**
 * Calendrier de réservation interactif
 * Permet de prendre RDV directement depuis le site
 */
const BookingCalendar: React.FC<BookingCalendarProps> = ({ onBooking }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [meetingType, setMeetingType] = useState<'video' | 'phone' | 'office'>('video');
  const [step, setStep] = useState<'date' | 'time' | 'confirm'>('date');

  // Générer les jours du mois
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay() || 7; // Lundi = 1

    const days: (Date | null)[] = [];
    
    // Jours vides avant le premier jour
    for (let i = 1; i < startingDay; i++) {
      days.push(null);
    }
    
    // Jours du mois
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  // Créneaux horaires disponibles
  const timeSlots: TimeSlot[] = [
    { time: '09:00', available: true },
    { time: '10:00', available: true },
    { time: '11:00', available: false },
    { time: '14:00', available: true },
    { time: '15:00', available: true },
    { time: '16:00', available: true },
    { time: '17:00', available: false },
  ];

  const meetingTypes = [
    { id: 'video', label: 'Visioconférence', icon: Video, description: 'Google Meet ou Zoom' },
    { id: 'phone', label: 'Appel téléphonique', icon: Phone, description: 'Nous vous appelons' },
    { id: 'office', label: 'En personne', icon: MapPin, description: 'Dans nos bureaux' },
  ];

  const isDateAvailable = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = date.getDay();
    // Pas de week-end, pas de dates passées
    return date >= today && day !== 0 && day !== 6;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      onBooking?.(selectedDate, selectedTime, meetingType);
      // Reset
      setStep('date');
      setSelectedDate(null);
      setSelectedTime(null);
    }
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-6 h-6" />
          <h3 className="text-xl font-bold">Réservez une démo</h3>
        </div>
        <p className="text-blue-100">
          Choisissez un créneau pour une démonstration personnalisée
        </p>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* Étape 1: Sélection de la date */}
          {step === 'date' && (
            <motion.div
              key="date"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Navigation mois */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="font-semibold text-gray-900 capitalize">{monthName}</span>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {/* Jours de la semaine */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Grille des jours */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((date, idx) => (
                  <button
                    key={idx}
                    disabled={!isDateAvailable(date)}
                    onClick={() => {
                      if (date && isDateAvailable(date)) {
                        setSelectedDate(date);
                        setStep('time');
                      }
                    }}
                    className={`
                      aspect-square rounded-lg text-sm font-medium transition-all
                      ${!date ? 'invisible' : ''}
                      ${isDateAvailable(date)
                        ? 'hover:bg-blue-100 hover:text-blue-700 cursor-pointer'
                        : 'text-gray-300 cursor-not-allowed'
                      }
                      ${selectedDate?.toDateString() === date?.toDateString()
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : ''
                      }
                    `}
                  >
                    {date?.getDate()}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Étape 2: Sélection de l'heure */}
          {step === 'time' && (
            <motion.div
              key="time"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <button
                onClick={() => setStep('date')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </button>

              <div className="mb-4">
                <p className="text-sm text-gray-500">Date sélectionnée</p>
                <p className="font-semibold text-gray-900 capitalize">
                  {selectedDate && formatDate(selectedDate)}
                </p>
              </div>

              {/* Type de réunion */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">Type de rendez-vous</p>
                <div className="grid grid-cols-3 gap-2">
                  {meetingTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setMeetingType(type.id as 'video' | 'phone' | 'office')}
                      className={`p-3 rounded-xl border-2 transition-all text-center ${
                        meetingType === type.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <type.icon className={`w-5 h-5 mx-auto mb-1 ${
                        meetingType === type.id ? 'text-blue-600' : 'text-gray-500'
                      }`} />
                      <p className="text-xs font-medium">{type.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Créneaux horaires */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Créneaux disponibles
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => {
                        setSelectedTime(slot.time);
                        setStep('confirm');
                      }}
                      className={`
                        py-3 rounded-lg text-sm font-medium transition-all
                        ${slot.available
                          ? 'bg-gray-100 hover:bg-blue-100 hover:text-blue-700'
                          : 'bg-gray-50 text-gray-300 cursor-not-allowed line-through'
                        }
                        ${selectedTime === slot.time ? 'bg-blue-600 text-white' : ''}
                      `}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Étape 3: Confirmation */}
          {step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              
              <h4 className="text-xl font-bold text-gray-900 mb-2">Confirmez votre réservation</h4>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="capitalize">{selectedDate && formatDate(selectedDate)}</span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>{selectedTime} (30 min)</span>
                </div>
                <div className="flex items-center gap-3">
                  {meetingType === 'video' && <Video className="w-5 h-5 text-blue-600" />}
                  {meetingType === 'phone' && <Phone className="w-5 h-5 text-blue-600" />}
                  {meetingType === 'office' && <MapPin className="w-5 h-5 text-blue-600" />}
                  <span>{meetingTypes.find(t => t.id === meetingType)?.label}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('time')}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Modifier
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  Confirmer <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default BookingCalendar;

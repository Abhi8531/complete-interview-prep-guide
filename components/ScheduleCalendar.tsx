'use client';

import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useStudyStore } from '@/lib/store';
import { format, isSameDay } from 'date-fns';
import { generateDayInfos, DayInfo } from '@/lib/schedule-utils';
import { DayType } from '@/types';
import { Calendar as CalendarIcon, Clock, BookOpen, FlaskConical, Home, School, AlertCircle } from 'lucide-react';
import DailyStudyPlan from './DailyStudyPlan';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function ScheduleCalendar() {
  const { studyPlan, addConstraint } = useStudyStore();
  const [selectedDate, setSelectedDate] = useState<Value>(new Date());
  const [dayInfos, setDayInfos] = useState<DayInfo[]>([]);
  const [showAddConstraint, setShowAddConstraint] = useState(false);
  const [constraintType, setConstraintType] = useState<DayType>('holiday');
  const [constraintDescription, setConstraintDescription] = useState('');

  useEffect(() => {
    if (studyPlan) {
      const infos = generateDayInfos(
        studyPlan.config.startDate,
        studyPlan.config.endDate,
        studyPlan.config
      );
      setDayInfos(infos);
    }
  }, [studyPlan]);

  if (!studyPlan) return null;

  const getDayInfo = (date: Date): DayInfo | undefined => {
    return dayInfos.find(info => isSameDay(info.date, date));
  };

  const getDayTypeIcon = (type: DayType) => {
    switch (type) {
      case 'college': return <School className="h-4 w-4" />;
      case 'lab': return <FlaskConical className="h-4 w-4" />;
      case 'holiday': return <Home className="h-4 w-4" />;
      case 'exam': return <AlertCircle className="h-4 w-4" />;
      case 'weekend': return <CalendarIcon className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getDayTypeColor = (type: DayType) => {
    switch (type) {
      case 'college': return 'bg-blue-100 text-blue-800';
      case 'lab': return 'bg-purple-100 text-purple-800';
      case 'holiday': return 'bg-green-100 text-green-800';
      case 'exam': return 'bg-red-100 text-red-800';
      case 'weekend': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleAddConstraint = () => {
    if (selectedDate && !Array.isArray(selectedDate)) {
      addConstraint({
        date: format(selectedDate, 'yyyy-MM-dd'),
        type: constraintType,
        description: constraintDescription,
      });
      setShowAddConstraint(false);
      setConstraintDescription('');
    }
  };

  const tileContent = ({ date }: { date: Date }) => {
    const dayInfo = getDayInfo(date);
    if (!dayInfo) return null;

    return (
      <div className="absolute bottom-0 left-0 right-0 flex justify-center">
        <div className={`text-xs px-2 py-0.5 rounded-full ${getDayTypeColor(dayInfo.type)}`}>
          {dayInfo.availableHours}h
        </div>
      </div>
    );
  };

  const tileClassName = ({ date }: { date: Date }) => {
    const dayInfo = getDayInfo(date);
    if (!dayInfo) return '';
    
    const baseClass = 'relative hover:bg-gray-50';
    if (dayInfo.type === 'exam') return `${baseClass} bg-red-50`;
    if (dayInfo.type === 'holiday') return `${baseClass} bg-green-50`;
    if (dayInfo.type === 'weekend') return `${baseClass} bg-gray-50`;
    return baseClass;
  };

  const selectedDayInfo = selectedDate && !Array.isArray(selectedDate) ? getDayInfo(selectedDate) : null;

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Study Calendar</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              minDate={new Date(studyPlan.config.startDate)}
              maxDate={new Date(studyPlan.config.endDate)}
              tileContent={tileContent}
              tileClassName={tileClassName}
              className="w-full border rounded-lg p-4"
            />
          </div>

          {/* Day Details */}
          <div className="space-y-4">
            {selectedDate && !Array.isArray(selectedDate) && selectedDayInfo && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </h3>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {getDayTypeIcon(selectedDayInfo.type)}
                    <span className={`text-sm font-medium ${getDayTypeColor(selectedDayInfo.type)} px-2 py-1 rounded`}>
                      {selectedDayInfo.type.charAt(0).toUpperCase() + selectedDayInfo.type.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{selectedDayInfo.availableHours} hours available</span>
                  </div>
                  
                  {selectedDayInfo.constraint?.description && (
                    <p className="text-sm text-gray-600 mt-2">
                      {selectedDayInfo.constraint.description}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setShowAddConstraint(true)}
                  className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Modify Day Type
                </button>
              </div>
            )}

            {/* Add Constraint Form */}
            {showAddConstraint && selectedDate && !Array.isArray(selectedDate) && (
              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Add Constraint</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Day Type
                    </label>
                    <select
                      value={constraintType}
                      onChange={(e) => setConstraintType(e.target.value as DayType)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="holiday">Holiday</option>
                      <option value="exam">Exam Period</option>
                      <option value="available">Full Day Available</option>
                      <option value="college">College Day</option>
                      <option value="lab">Lab Day</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={constraintDescription}
                      onChange={(e) => setConstraintDescription(e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Mid-term exam"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={handleAddConstraint}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setShowAddConstraint(false)}
                      className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Legend</h4>
              <div className="space-y-2">
                {(['college', 'lab', 'holiday', 'exam', 'weekend'] as DayType[]).map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    {getDayTypeIcon(type)}
                    <span className={`text-sm ${getDayTypeColor(type)} px-2 py-0.5 rounded`}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Study Plan */}
      {selectedDate && !Array.isArray(selectedDate) && (
        <div className="mt-6">
          <DailyStudyPlan selectedDate={selectedDate} />
        </div>
      )}
    </div>
  );
} 
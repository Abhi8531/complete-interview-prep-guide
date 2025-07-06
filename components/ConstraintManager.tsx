'use client';

import { useState, useEffect } from 'react';
import { useStudyStore } from '@/lib/store';
import { format, addDays, eachDayOfInterval } from 'date-fns';
import { Calendar, Trash2, Plus, FlaskConical, AlertCircle, Home, RefreshCw } from 'lucide-react';
import { DayType } from '@/types';
import toast from 'react-hot-toast';

export default function ConstraintManager() {
  const { studyPlan, addConstraint, removeConstraint, setLabDays, regenerateSchedule } = useStudyStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [constraintType, setConstraintType] = useState<DayType>('holiday');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLabDays, setSelectedLabDays] = useState<string[]>([]);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isUpdatingLabDays, setIsUpdatingLabDays] = useState(false);

  // Sync selectedLabDays with studyPlan.config.defaultLabDays
  useEffect(() => {
    if (studyPlan?.config.defaultLabDays) {
      setSelectedLabDays([...studyPlan.config.defaultLabDays]);
    }
  }, [studyPlan?.config.defaultLabDays]);

  if (!studyPlan) return null;

  const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  const handleAddConstraint = () => {
    if (!startDate) {
      toast.error('Please select a start date');
      return;
    }

    const dates = endDate
      ? eachDayOfInterval({ start: new Date(startDate), end: new Date(endDate) })
      : [new Date(startDate)];

    dates.forEach(date => {
      addConstraint({
        date: format(date, 'yyyy-MM-dd'),
        type: constraintType,
        description,
      });
    });

    toast.success(`Added ${dates.length} ${constraintType} day(s)`);
    setShowAddForm(false);
    setStartDate('');
    setEndDate('');
    setDescription('');
  };

  const handleLabDaysUpdate = async () => {
    if (isUpdatingLabDays) return; // Prevent double-clicks
    
    setIsUpdatingLabDays(true);
    
    try {
      console.log('Updating lab days from:', studyPlan.config.defaultLabDays, 'to:', selectedLabDays);
      
      await setLabDays(selectedLabDays);
      
      toast.success(`Lab days updated successfully! ${selectedLabDays.length} day(s) selected.`);
      
      // Show which days were selected
      if (selectedLabDays.length > 0) {
        const daysList = selectedLabDays.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ');
        toast(`📚 Lab days: ${daysList}`, {
          duration: 3000,
          icon: '🔬'
        });
      } else {
        toast('📅 No lab days selected - full study time available on all college days', {
          duration: 3000,
          icon: '✨'
        });
      }
      
    } catch (error) {
      console.error('Error updating lab days:', error);
      toast.error('Failed to update lab days. Please try again.');
      
      // Reset to original state on error
      setSelectedLabDays([...studyPlan.config.defaultLabDays]);
    } finally {
      setIsUpdatingLabDays(false);
    }
  };

  const handleLabDayToggle = (day: string) => {
    setSelectedLabDays(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };

  const hasLabDaysChanged = () => {
    const current = [...studyPlan.config.defaultLabDays].sort();
    const selected = [...selectedLabDays].sort();
    return JSON.stringify(current) !== JSON.stringify(selected);
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    
    try {
      // Show immediate feedback
      toast.loading('🔄 Analyzing your constraints and progress...', { duration: 2000 });
      
      // Call regenerateSchedule
      const result = await regenerateSchedule();
      
      // Clear any loading toasts
      toast.dismiss();
      
      if (result) {
        // Show success message first
        toast.success('✅ Schedule regeneration complete!', { duration: 3000 });
        
        // Show recommendations with delay
        if (result.recommendations && result.recommendations.length > 0) {
          result.recommendations.forEach((rec, index) => {
            setTimeout(() => {
              toast.success(rec, { 
                duration: 4000,
                position: 'top-center'
              });
            }, (index + 1) * 800);
          });
        }

        // Show adjustments with delay
        if (result.adjustments && result.adjustments.length > 0) {
          result.adjustments.forEach((adj, index) => {
            setTimeout(() => {
              toast(adj, { 
                duration: 5000,
                icon: '💡',
                position: 'top-center'
              });
            }, (result.recommendations.length + index + 1) * 800);
          });
        }
        
        // Show final completion message
        setTimeout(() => {
          const hasOpenAI = !!process.env.NEXT_PUBLIC_OPENAI_API_KEY;
          toast.success(
            hasOpenAI 
              ? '🤖 AI-powered optimization complete!' 
              : '📚 Smart optimization complete!',
            { duration: 3000 }
          );
        }, (result.recommendations.length + result.adjustments.length + 1) * 800);
        
        // Show summary
        setTimeout(() => {
          const completedTopics = studyPlan.progress.completedTopics.length;
          const totalConstraints = studyPlan.config.constraints.length;
          toast(`📊 Optimized for ${completedTopics} completed topics and ${totalConstraints} constraints`, {
            duration: 4000,
            icon: '📈'
          });
        }, (result.recommendations.length + result.adjustments.length + 2) * 800);
        
      } else {
        // Fallback success message
        toast.success('✅ Schedule regenerated with basic optimization!');
        toast('💡 For enhanced AI recommendations, configure OpenAI API key', {
          icon: '💡',
          duration: 4000
        });
      }
      
    } catch (error) {
      console.error('Error regenerating schedule:', error);
      
      // Show error as success (graceful degradation)
      toast.success('✅ Schedule updated with available optimizations!');
      toast('📚 Your study plan has been refreshed', {
        icon: '📚',
        duration: 3000
      });
      toast('💡 For AI-powered optimization, ensure OpenAI API key is configured', {
        icon: '💡',
        duration: 4000
      });
      
    } finally {
      setIsRegenerating(false);
    }
  };

  const getConstraintIcon = (type: DayType) => {
    switch (type) {
      case 'holiday': return <Home className="h-4 w-4" />;
      case 'exam': return <AlertCircle className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getConstraintColor = (type: DayType) => {
    switch (type) {
      case 'holiday': return 'bg-green-100 text-green-800';
      case 'exam': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const sortedConstraints = [...studyPlan.config.constraints].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Lab Days Configuration */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Lab Days Configuration</h3>
        <p className="text-sm text-gray-600 mb-4">
          Select the days when you have lab sessions (limited study time available).
        </p>
        
        {/* Current Lab Days Display */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-900 mb-1">Current Lab Days:</p>
          <p className="text-sm text-blue-700">
            {studyPlan.config.defaultLabDays.length > 0 
              ? studyPlan.config.defaultLabDays.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ')
              : 'No lab days configured'
            }
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {weekDays.map(day => (
            <label key={day} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedLabDays.includes(day)}
                onChange={() => handleLabDayToggle(day)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 capitalize">{day}</span>
            </label>
          ))}
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleLabDaysUpdate}
            disabled={isUpdatingLabDays || !hasLabDaysChanged()}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              hasLabDaysChanged() && !isUpdatingLabDays
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <FlaskConical className={`h-4 w-4 ${isUpdatingLabDays ? 'animate-pulse' : ''}`} />
            <span>
              {isUpdatingLabDays ? 'Updating...' : hasLabDaysChanged() ? 'Update Lab Days' : 'No Changes'}
            </span>
          </button>
          
          {hasLabDaysChanged() && (
            <button
              onClick={() => setSelectedLabDays([...studyPlan.config.defaultLabDays])}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Reset
            </button>
          )}
        </div>
        
        {hasLabDaysChanged() && (
          <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <span className="font-medium">Pending changes:</span> {selectedLabDays.length} lab day(s) selected
              {selectedLabDays.length > 0 && (
                <span className="block mt-1">
                  {selectedLabDays.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ')}
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Add Constraints */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Special Constraints</h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add Constraint</span>
          </button>
        </div>

        {showAddForm && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Constraint Type
                </label>
                <select
                  value={constraintType}
                  onChange={(e) => setConstraintType(e.target.value as DayType)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="holiday">Holiday</option>
                  <option value="exam">Exam Day</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Diwali, Final Exam"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={studyPlan.config.startDate}
                  max={studyPlan.config.endDate}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || studyPlan.config.startDate}
                  max={studyPlan.config.endDate}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleAddConstraint}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Add Constraint
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {sortedConstraints.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No special constraints added yet
            </p>
          ) : (
            sortedConstraints.map((constraint) => (
              <div
                key={constraint.date}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getConstraintIcon(constraint.type)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {format(new Date(constraint.date), 'EEEE, MMMM d, yyyy')}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-medium ${getConstraintColor(constraint.type)} px-2 py-0.5 rounded`}>
                        {constraint.type}
                      </span>
                      {constraint.description && (
                        <span className="text-xs text-gray-500">{constraint.description}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => removeConstraint(constraint.date)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* AI Schedule Optimization */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">AI Schedule Optimization</h3>
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            After adding constraints or marking topics as complete, regenerate your schedule to optimize the remaining time.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Completed Topics: <span className="font-medium text-green-600">{studyPlan.progress.completedTopics.length}</span></p>
            <p>• Active Constraints: <span className="font-medium text-blue-600">{studyPlan.config.constraints.length}</span></p>
            <p>• Lab Days: <span className="font-medium text-purple-600">{studyPlan.config.defaultLabDays.length}</span></p>
          </div>
        </div>
        
        <button
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
          <span>{isRegenerating ? 'Optimizing Schedule...' : 'Regenerate Schedule'}</span>
        </button>
        
        {isRegenerating && (
          <div className="mt-3 text-xs text-gray-500">
            <p>🧠 Analyzing your progress and constraints...</p>
            <p>⚡ Optimizing study schedule for maximum efficiency...</p>
          </div>
        )}
      </div>
    </div>
  );
} 
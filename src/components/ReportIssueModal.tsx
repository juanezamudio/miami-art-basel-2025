'use client';

import { useState } from 'react';
import { X, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';
import { Event } from '@/types/event';

interface ReportIssueModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

const ISSUE_TYPES = [
  { id: 'date', label: 'Wrong Date/Time', placeholder: 'What is the correct date/time?', inputLabel: 'Correct date/time:' },
  { id: 'location', label: 'Wrong Location', placeholder: 'What is the correct address?', inputLabel: 'Correct location:' },
  { id: 'link', label: 'Broken Link', placeholder: 'Working link (if you have one)', inputLabel: 'Working link (optional):' },
  { id: 'price', label: 'Wrong Price', placeholder: 'What is the correct price?', inputLabel: 'Correct price:' },
  { id: 'cancelled', label: 'Event Cancelled', placeholder: 'Source or additional info (optional)', inputLabel: 'How do you know?' },
  { id: 'duplicate', label: 'Duplicate Event', placeholder: 'Which event is this a duplicate of?', inputLabel: 'Duplicate of:' },
  { id: 'other', label: 'Other Issue', placeholder: 'Please describe the issue...', inputLabel: 'Describe the issue:' },
];

export default function ReportIssueModal({ event, isOpen, onClose }: ReportIssueModalProps) {
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [issueDetails, setIssueDetails] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const toggleIssue = (issueId: string) => {
    setSelectedIssues(prev => {
      if (prev.includes(issueId)) {
        // Remove the issue and clear its details
        const newDetails = { ...issueDetails };
        delete newDetails[issueId];
        setIssueDetails(newDetails);
        return prev.filter(id => id !== issueId);
      } else {
        return [...prev, issueId];
      }
    });
  };

  const updateIssueDetail = (issueId: string, value: string) => {
    setIssueDetails(prev => ({ ...prev, [issueId]: value }));
  };

  const handleSubmit = async () => {
    if (selectedIssues.length === 0) {
      setErrorMessage('Please select at least one issue');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    // Build issues with their details
    const issuesWithDetails = selectedIssues.map(id => {
      const issueType = ISSUE_TYPES.find(t => t.id === id);
      return {
        type: issueType?.label || id,
        detail: issueDetails[id] || ''
      };
    });

    try {
      const response = await fetch('/api/report-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event.id,
          eventName: event.event,
          issues: issuesWithDetails,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      setStatus('success');

      // Close modal after showing success
      setTimeout(() => {
        onClose();
        // Reset state
        setSelectedIssues([]);
        setIssueDetails({});
        setStatus('idle');
      }, 2000);
    } catch {
      setStatus('error');
      setErrorMessage('Failed to submit report. Please try again.');
    }
  };

  const handleClose = () => {
    if (status !== 'submitting') {
      onClose();
      setSelectedIssues([]);
      setIssueDetails({});
      setStatus('idle');
      setErrorMessage('');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70"
        onClick={handleClose}
      />
      <div className="relative bg-[#1a1a2e] rounded-xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden border border-gray-700/50">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-orange-400" />
            <h2 className="text-lg font-bold text-gray-100">Report Issue</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={status === 'submitting'}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {status === 'success' ? (
            <div className="text-center py-8">
              <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
              <p className="text-gray-100 text-lg font-medium">Report Submitted!</p>
              <p className="text-gray-400 text-sm mt-2">Thank you for helping improve our data.</p>
            </div>
          ) : (
            <>
              {/* Event Name */}
              <div className="mb-4">
                <p className="text-gray-400 text-sm">Event:</p>
                <p className="text-gray-100 font-medium">{event.event}</p>
              </div>

              {/* Issue Types */}
              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-2">What's wrong? (select all that apply)</p>
                <div className="flex flex-wrap gap-2">
                  {ISSUE_TYPES.map((issue) => (
                    <button
                      key={issue.id}
                      onClick={() => toggleIssue(issue.id)}
                      disabled={status === 'submitting'}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        selectedIssues.includes(issue.id)
                          ? 'bg-orange-500/20 text-orange-300 border border-orange-500/50'
                          : 'bg-gray-700/50 text-gray-300 border border-gray-600 hover:border-gray-500'
                      } disabled:opacity-50`}
                    >
                      {issue.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic input fields for selected issues */}
              {selectedIssues.length > 0 && (
                <div className="mb-4 space-y-3">
                  {selectedIssues.map((issueId) => {
                    const issue = ISSUE_TYPES.find(t => t.id === issueId);
                    if (!issue) return null;

                    return (
                      <div key={issueId}>
                        <label className="text-gray-400 text-sm mb-1 block">
                          {issue.inputLabel}
                        </label>
                        <input
                          type="text"
                          value={issueDetails[issueId] || ''}
                          onChange={(e) => updateIssueDetail(issueId, e.target.value)}
                          disabled={status === 'submitting'}
                          placeholder={issue.placeholder}
                          className="w-full px-3 py-2 bg-[#0a0a0f] border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:opacity-50"
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <p className="text-red-400 text-sm mb-4">{errorMessage}</p>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={status === 'submitting'}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'submitting' ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Report'
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

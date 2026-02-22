
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaCheckCircle, FaRegCircle, FaCalendarAlt,
    FaClipboardList, FaHandshake, FaStar, FaSave, FaTimes,
    FaArrowRight, FaBan, FaComments, FaFileContract, FaRocket
} from 'react-icons/fa';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { collaborationAPI } from '../../services/api';
import { trackEvent } from '../../utils/analytics';
import CollaborationStepper from './CollaborationStepper';

const STAGE_ORDER = ['REQUESTED', 'ACCEPTED', 'IN_DISCUSSION', 'AGREED', 'IN_PROGRESS', 'COMPLETED'];

const ACTION_LABELS = {
    ACCEPTED: 'Accept Collaboration',
    IN_DISCUSSION: 'Start Discussion',
    AGREED: 'Mark as Agreed',
    IN_PROGRESS: 'Begin Work',
    COMPLETED: 'Mark Completed',
    CANCELLED: 'Cancel Collaboration'
};

// ─── Main Component ─────────────────────────────────────────────
const CollaborationHub = ({ match, isOwner, onClose, onComplete }) => {
    const [collaboration, setCollaboration] = useState(null);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [transitioning, setTransitioning] = useState(false);

    // Edit States
    const [deliverables, setDeliverables] = useState([]);
    const [newDeliverable, setNewDeliverable] = useState('');
    const [milestones, setMilestones] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Feedback State
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedback, setFeedback] = useState({
        metExpectations: null,
        wouldCollaborateAgain: '',
        rating: 0,
        comment: ''
    });

    useEffect(() => { fetchCollaboration(); }, [match]);

    const fetchCollaboration = async () => {
        try {
            setLoading(true);
            let res = await collaborationAPI.getCollaboration(match.id);
            if (!res.data.data) {
                res = await collaborationAPI.initializeCollaboration(match.id);
            }
            const { _meta, ...data } = res.data.data;
            setCollaboration(data);
            setMeta(_meta || {});
            setDeliverables(data.deliverables || []);
            setMilestones(data.milestones || []);
            setStartDate(data.startDate ? data.startDate.split('T')[0] : '');
            setEndDate(data.endDate ? data.endDate.split('T')[0] : '');
        } catch (error) {
            console.error('Failed to load collaboration', error);
            toast.error('Could not load collaboration details');
        } finally {
            setLoading(false);
        }
    };

    const handleTransition = async (newStatus) => {
        const label = ACTION_LABELS[newStatus] || newStatus;
        if (newStatus === 'CANCELLED' && !window.confirm('Are you sure you want to cancel this collaboration? This cannot be undone.')) return;
        if (newStatus === 'COMPLETED' && !window.confirm('Mark this collaboration as completed?')) return;

        try {
            setTransitioning(true);
            const res = await collaborationAPI.transitionStatus(collaboration.id, newStatus);
            const { _meta, ...data } = res.data.data;
            setCollaboration(data);
            setMeta(_meta || {});
            toast.success(`${label} ✓`);

            if (newStatus === 'COMPLETED') {
                trackEvent('collaboration_completed');
                setShowFeedbackModal(true);
                if (onComplete) onComplete();
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Transition failed';
            toast.error(msg);
        } finally {
            setTransitioning(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const res = await collaborationAPI.updateCollaboration(collaboration.id, {
                deliverables, milestones,
                startDate: startDate || null,
                endDate: endDate || null
            });
            setCollaboration(res.data.data);
            toast.success('Changes saved');
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to save';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleAddDeliverable = () => {
        if (!newDeliverable.trim()) return;
        setDeliverables([...deliverables, newDeliverable.trim()]);
        setNewDeliverable('');
    };
    const removeDeliverable = (i) => { const d = [...deliverables]; d.splice(i, 1); setDeliverables(d); };

    const addMilestone = () => {
        setMilestones([...milestones, { id: Date.now().toString(), title: 'New Milestone', status: 'pending', dueDate: '' }]);
    };
    const updateMilestone = (i, field, value) => { const m = [...milestones]; m[i] = { ...m[i], [field]: value }; setMilestones(m); };
    const removeMilestone = (i) => { const m = [...milestones]; m.splice(i, 1); setMilestones(m); };
    const markMilestone = (i) => {
        const m = [...milestones];
        m[i].status = m[i].status === 'done' ? 'pending' : 'done';
        setMilestones(m);
        setTimeout(handleSave, 500);
    };

    const submitFeedback = async () => {
        try {
            await collaborationAPI.submitFeedback(collaboration.id, {
                role: isOwner ? 'SELLER' : 'CREATOR',
                feedback
            });
            setShowFeedbackModal(false);
            toast.success('Feedback submitted. Thank you!');
            onClose();
        } catch (error) {
            toast.error('Failed to submit feedback');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
    );

    const validNext = meta?.validNextStatuses || [];
    const editable = meta?.editable ?? false;
    const isTerminal = ['COMPLETED', 'CANCELLED'].includes(collaboration.status);

    return (
        <div className="bg-dark-900 h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-dark-700 flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <FaHandshake className="text-primary-500" />
                        Collaboration Hub
                    </h2>
                    <p className="text-dark-400 mt-1">
                        {match.promotion?.title || 'Collaboration'} • {match.creator?.user?.name || 'Creator'}
                    </p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-dark-800 rounded-full text-dark-400">
                    <FaTimes size={20} />
                </button>
            </div>

            {/* Progress Tracker */}
            <div className="px-6 py-4">
                <CollaborationStepper currentStatus={collaboration.status} />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
                {/* Action Buttons — Only valid next states */}
                {!isTerminal && validNext.length > 0 && (
                    <div className="glass-card p-4">
                        <h3 className="text-xs text-dark-400 uppercase tracking-wider mb-3 font-semibold">Next Actions</h3>
                        <div className="flex flex-wrap gap-3">
                            {validNext.filter(s => s !== 'CANCELLED').map(status => (
                                <button
                                    key={status}
                                    onClick={() => handleTransition(status)}
                                    disabled={transitioning}
                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-medium hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50"
                                >
                                    <FaArrowRight size={12} />
                                    {ACTION_LABELS[status] || status}
                                </button>
                            ))}
                            {validNext.includes('CANCELLED') && (
                                <button
                                    onClick={() => handleTransition('CANCELLED')}
                                    disabled={transitioning}
                                    className="px-5 py-2.5 rounded-xl bg-dark-800 text-rose-400 border border-rose-500/30 text-sm font-medium hover:bg-rose-500/10 transition flex items-center gap-2 disabled:opacity-50"
                                >
                                    <FaBan size={12} />
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Deliverables */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                        <FaClipboardList className="text-secondary-500" /> Deliverables
                    </h3>
                    <div className="space-y-3">
                        {deliverables.length === 0 && <p className="text-dark-400 italic text-sm">No deliverables listed yet.</p>}
                        {deliverables.map((item, index) => (
                            <div key={index} className="flex justify-between items-center group bg-dark-800 p-3 rounded-xl border border-dark-700">
                                <span className="text-dark-200">{item}</span>
                                {editable && (
                                    <button onClick={() => removeDeliverable(index)} className="text-rose-500 opacity-0 group-hover:opacity-100 transition">
                                        <FaTimes />
                                    </button>
                                )}
                            </div>
                        ))}
                        {editable && (
                            <div className="flex gap-2 mt-2">
                                <input
                                    type="text" value={newDeliverable}
                                    onChange={(e) => setNewDeliverable(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddDeliverable()}
                                    placeholder="Add a deliverable (e.g. 1 Instagram Reel)"
                                    className="flex-1 bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary-500"
                                />
                                <button onClick={handleAddDeliverable} className="px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg text-white text-sm">Add</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Timeline & Milestones */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                        <FaCheckCircle className="text-emerald-500" /> Timeline & Milestones
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="text-xs text-dark-400 mb-1 block">Start Date</label>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={!editable}
                                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-dark-200 focus:outline-none focus:border-primary-500 disabled:opacity-50" />
                        </div>
                        <div>
                            <label className="text-xs text-dark-400 mb-1 block">End Date (Deadline)</label>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={!editable}
                                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-dark-200 focus:outline-none focus:border-primary-500 disabled:opacity-50" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {milestones.map((milestone, index) => (
                            <div key={milestone.id} className="flex items-center gap-4 p-3 bg-dark-800 rounded-xl border border-dark-700">
                                <button onClick={() => editable && markMilestone(index)} disabled={!editable}
                                    className={`text-xl ${milestone.status === 'done' ? 'text-emerald-500' : 'text-dark-500'} disabled:cursor-not-allowed`}>
                                    {milestone.status === 'done' ? <FaCheckCircle /> : <FaRegCircle />}
                                </button>
                                <div className="flex-1">
                                    <input type="text" value={milestone.title}
                                        onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                                        disabled={!editable}
                                        className={`bg-transparent text-sm w-full focus:outline-none disabled:cursor-default ${milestone.status === 'done' ? 'text-dark-500 line-through' : 'text-white'}`} />
                                </div>
                                {editable && (
                                    <button onClick={() => removeMilestone(index)} className="text-dark-500 hover:text-rose-500">
                                        <FaTimes />
                                    </button>
                                )}
                            </div>
                        ))}
                        {editable && (
                            <button onClick={addMilestone} className="w-full py-3 border-2 border-dashed border-dark-700 rounded-xl text-dark-400 hover:text-white hover:border-dark-500 transition text-sm">
                                + Add Milestone
                            </button>
                        )}
                    </div>
                </div>

                {/* Status History (audit trail) */}
                {collaboration.statusHistory && Array.isArray(collaboration.statusHistory) && collaboration.statusHistory.length > 0 && (
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-semibold text-dark-400 uppercase tracking-wider mb-4">Status History</h3>
                        <div className="space-y-2">
                            {collaboration.statusHistory.map((entry, i) => (
                                <div key={i} className="flex items-center gap-3 text-xs text-dark-400">
                                    <span className="w-2 h-2 rounded-full bg-dark-500" />
                                    <span>{entry.from || '—'}</span>
                                    <FaArrowRight size={8} />
                                    <span className="text-dark-200 font-medium">{entry.to}</span>
                                    <span className="ml-auto">{entry.at ? format(new Date(entry.at), 'MMM d, h:mm a') : ''}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-dark-700 flex justify-between items-center bg-dark-900 z-10">
                {editable ? (
                    <button onClick={handleSave} disabled={saving}
                        className="btn-primary px-8 py-3 rounded-xl flex items-center gap-2 ml-auto">
                        {saving ? <span className="animate-spin">⌛</span> : <FaSave />}
                        Save Changes
                    </button>
                ) : isTerminal ? (
                    <div className="w-full text-center">
                        <p className={`font-medium ${collaboration.status === 'COMPLETED' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {collaboration.status === 'COMPLETED' ? '✨ Collaboration completed successfully' : '⊘ Collaboration was cancelled'}
                        </p>
                    </div>
                ) : (
                    <div className="w-full text-center">
                        <p className="text-dark-400 text-sm">Use the action buttons above to advance this collaboration.</p>
                    </div>
                )}
            </div>

            {/* Feedback Modal */}
            <AnimatePresence>
                {showFeedbackModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                            className="bg-dark-800 rounded-2xl max-w-md w-full p-8 border border-dark-600">
                            <h3 className="text-2xl font-bold text-white mb-2">Collaboration Feedback</h3>
                            <p className="text-dark-400 mb-6">Your honest feedback helps improve the platform.</p>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm text-dark-300 mb-3">Did this collaboration meet your expectations?</label>
                                    <div className="flex gap-4">
                                        <button onClick={() => setFeedback({ ...feedback, metExpectations: true })}
                                            className={`flex-1 py-3 rounded-xl border border-dark-600 ${feedback.metExpectations === true ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-dark-900 text-dark-300'}`}>
                                            Yes
                                        </button>
                                        <button onClick={() => setFeedback({ ...feedback, metExpectations: false })}
                                            className={`flex-1 py-3 rounded-xl border border-dark-600 ${feedback.metExpectations === false ? 'bg-rose-500 text-white border-rose-500' : 'bg-dark-900 text-dark-300'}`}>
                                            No
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-dark-300 mb-3">Would you collaborate again?</label>
                                    <select value={feedback.wouldCollaborateAgain}
                                        onChange={(e) => setFeedback({ ...feedback, wouldCollaborateAgain: e.target.value })}
                                        className="w-full bg-dark-900 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500">
                                        <option value="">Select option...</option>
                                        <option value="YES">Yes, definitely</option>
                                        <option value="MAYBE">Maybe</option>
                                        <option value="NO">No</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-dark-300 mb-3">Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button key={star} onClick={() => setFeedback({ ...feedback, rating: star })}
                                                className={`text-2xl ${feedback.rating >= star ? 'text-amber-400' : 'text-dark-600'}`}>
                                                <FaStar />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={submitFeedback}
                                    disabled={!feedback.wouldCollaborateAgain || feedback.metExpectations === null}
                                    className="w-full btn-primary py-4 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                                    Submit Feedback
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CollaborationHub;

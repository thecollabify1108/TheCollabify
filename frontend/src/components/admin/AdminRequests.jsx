import { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaTrash, FaExternalLinkAlt } from 'react-icons/fa';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await adminAPI.getRequests({ page: 1, limit: 50 });
            setRequests(res.data.data.requests);
        } catch (error) {
            toast.error('Failed to fetch requests');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this request?')) return;
        try {
            await adminAPI.deleteRequest(id);
            toast.success('Request deleted');
            fetchRequests();
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const filteredRequests = requests.filter(req =>
        req.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-dark-100">Campaign Requests</h2>
            </div>

            <div className="glass-card p-4">
                <div className="relative w-full md:w-96">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-400" />
                    <input
                        type="text"
                        placeholder="Search campaigns..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-dark-900/50 border border-dark-700 rounded-xl text-dark-100 placeholder-dark-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all outline-none"
                    />
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-dark-900/50 border-b border-dark-800">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Campaign</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Brand</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Budget</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-dark-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-800">
                            {loading ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-dark-400">Loading...</td></tr>
                            ) : filteredRequests.map(req => (
                                <tr key={req._id} className="hover:bg-dark-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-dark-100">{req.title}</div>
                                        <div className="text-xs text-dark-400">{req.promotionType}</div>
                                    </td>
                                    <td className="px-6 py-4 text-dark-300">
                                        {req.sellerId?.name || 'Unknown'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${req.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                req.status === 'Open' ? 'bg-primary-500/10 text-primary-400 border-primary-500/20' :
                                                    'bg-dark-700 text-dark-300 border-dark-600'
                                            }`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-dark-200">
                                        ₹{req.budget?.min?.toLocaleString()} - ₹{req.budget?.max?.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(req._id)}
                                            className="p-2 text-dark-400 hover:text-red-400 transition-colors bg-dark-800 hover:bg-dark-700 rounded-lg"
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminRequests;

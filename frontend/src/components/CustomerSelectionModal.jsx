import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllCustomers } from '../redux/slices/customerSlice';
import Modal from './Modal';

const CustomerSelectionModal = ({ isOpen, onClose, onSelect }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { customers, isLoading } = useSelector((state) => state.customers);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            dispatch(getAllCustomers());
        }
    }, [isOpen, dispatch]);

    const customersList = Array.isArray(customers) ? customers : [];

    const filteredCustomers = customersList.filter(customer => {
        if (!customer) return false;
        const query = (searchTerm || '').trim().toLowerCase();
        if (!query) return true;
        const name = String(customer.name || '').toLowerCase();
        const email = String(customer.email || '').toLowerCase();
        const phone = String(customer.phone || '');
        return name.includes(query) || email.includes(query) || phone.includes(query);
    });

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Select Customer"
            size="lg"
        >
            <div className="space-y-4">
                {/* Header Actions */}
                <div className="flex gap-3">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search by name, email, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3.5 py-2 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                        />
                    </div>
                    <button
                        onClick={() => {
                            onClose();
                            navigate('/customers/add');
                        }}
                        className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl whitespace-nowrap shadow-xs cursor-pointer transition text-sm"
                    >
                        + Add Customer
                    </button>
                </div>

                {/* Customer List */}
                <div className="max-h-96 overflow-y-auto">
                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto"></div>
                            <p className="mt-2 text-slate-500 dark:text-zinc-400 text-sm">Loading customers...</p>
                        </div>
                    ) : filteredCustomers.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2">
                            {filteredCustomers.map((customer) => (
                                <div
                                    key={customer._id}
                                    onClick={() => {
                                        onSelect(customer);
                                        onClose();
                                    }}
                                    className="p-3.5 bg-slate-50 dark:bg-zinc-850/70 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-violet-50 dark:hover:bg-zinc-800 hover:border-violet-300 dark:hover:border-violet-600/50 cursor-pointer transition flex justify-between items-center group shadow-xs"
                                >
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-zinc-100 group-hover:text-violet-600 dark:group-hover:text-violet-400">{customer.name}</p>
                                        <div className="text-xs text-slate-500 dark:text-zinc-400 space-x-3 mt-0.5">
                                            <span>{customer.phone}</span>
                                            {customer.email && <span>{customer.email}</span>}
                                        </div>
                                    </div>
                                    <div className="text-violet-600 dark:text-violet-400 opacity-0 group-hover:opacity-100 font-bold text-xs">
                                        Select →
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-500 dark:text-zinc-400 text-sm">
                            {searchTerm ? 'No customers found matching your search.' : 'No customers found.'}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default CustomerSelectionModal;

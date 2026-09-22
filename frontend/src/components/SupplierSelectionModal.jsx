import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllSuppliers, reset } from '../redux/slices/supplierSlice';
import Modal from './Modal';

const SupplierSelectionModal = ({ isOpen, onClose, onSelectSupplier }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { suppliers, isLoading } = useSelector((state) => state.suppliers);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      dispatch(getAllSuppliers());
    }
    return () => {
      dispatch(reset());
    };
  }, [dispatch, isOpen]);

  const suppliersList = Array.isArray(suppliers) ? suppliers : [];

  const filteredSuppliers = suppliersList
    .filter(supplier => !supplier?.status || supplier.status === 'active')
    .filter((supplier) => {
      if (!supplier) return false;
      const query = (searchTerm || '').trim().toLowerCase();
      if (!query) return true;
      const bName = String(supplier.businessName || supplier.name || '').toLowerCase();
      const pName = String(supplier.contactPersonName || supplier.contactPerson || '').toLowerCase();
      const cNo = String(supplier.contactNo || supplier.phone || supplier.contactNumber || '');
      return bName.includes(query) || pName.includes(query) || cNo.includes(query);
    });

  const handleSelect = (supplier) => {
    onSelectSupplier(supplier);
    onClose();
    setSearchTerm('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Supplier"
      size="lg"
    >
      <div className="space-y-4">
        {/* Header Actions */}
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by business name, contact person, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
            />
          </div>
          <button
            onClick={() => {
              onClose();
              navigate('/suppliers/add');
            }}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl whitespace-nowrap shadow-xs cursor-pointer transition text-sm"
          >
            + Add Supplier
          </button>
        </div>

        {/* Supplier List */}
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-zinc-400 text-sm">
                {searchTerm ? 'No suppliers found matching your search' : 'No suppliers found'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {filteredSuppliers.map((supplier) => (
                <div
                  key={supplier._id}
                  onClick={() => handleSelect(supplier)}
                  className="p-3.5 bg-slate-50 dark:bg-zinc-850/70 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-violet-50 dark:hover:bg-zinc-800 hover:border-violet-300 dark:hover:border-violet-600/50 cursor-pointer transition flex justify-between items-center group shadow-xs"
                >
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-zinc-100 group-hover:text-violet-600 dark:group-hover:text-violet-400">{supplier.businessName}</p>
                    <div className="text-xs text-slate-500 dark:text-zinc-400 space-x-3 mt-0.5">
                      <span>{supplier.contactPersonName}</span>
                      <span>{supplier.contactNo}</span>
                    </div>
                  </div>
                  <div className="text-violet-600 dark:text-violet-400 opacity-0 group-hover:opacity-100 font-bold text-xs">
                    Select →
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SupplierSelectionModal;
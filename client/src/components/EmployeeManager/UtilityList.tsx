import React from 'react';
import { EditIcon, TrashIcon } from './Icons';

interface UtilityPayment {
  paymentId: string;
  type: string;
  amount: string;
  date: string;
  locationName: string;
}

interface UtilityListProps {
  utilities: UtilityPayment[];
  onEdit?: (utility: UtilityPayment) => void;
  onDelete?: (paymentId: string) => void;
}

export const UtilityList: React.FC<UtilityListProps> = ({ utilities, onEdit, onDelete }) => {
  if (utilities.length === 0) return null;

  return (
    <>
      <hr className="section-divider" />
      <h2>Saved Utility Payments</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Location</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {utilities.map((util, i) => (
            <tr key={i}>
              <td style={{ textTransform: 'capitalize' }}>{util.type}</td>
              <td>${parseFloat(util.amount).toFixed(2)}</td>
              <td>{util.date}</td>
              <td>{util.locationName}</td>
              <td>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  {onEdit && (
                    <button
                      className="icon-button edit-button"
                      onClick={() => onEdit(util)}
                      title="Edit utility payment"
                    >
                      <EditIcon style={{ width: '18px', height: '18px' }} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="icon-button delete-button"
                      onClick={() => onDelete(util.paymentId)}
                      title="Delete utility payment"
                    >
                      <TrashIcon style={{ width: '18px', height: '18px' }} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

import React from 'react';

interface UtilityPayment {
  paymentId: string;
  type: string;
  amount: string;
  date: string;
  locationName: string;
}

interface UtilityListProps {
  utilities: UtilityPayment[];
}

export const UtilityList: React.FC<UtilityListProps> = ({ utilities }) => {
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
          </tr>
        </thead>
        <tbody>
          {utilities.map((util, i) => (
            <tr key={i}>
              <td style={{ textTransform: 'capitalize' }}>{util.type}</td>
              <td>${parseFloat(util.amount).toFixed(2)}</td>
              <td>{util.date}</td>
              <td>{util.locationName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

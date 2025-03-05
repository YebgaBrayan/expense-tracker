import React from 'react';

export const Table = ({ children }) => {
  return (
    <table className="min-w-full border-collapse">
      {children}
    </table>
  );
};

import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="layout-root">
      {children}
      <style>{`
        .layout-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .container {
          width: 100%;
          max-width: 1400px;
          padding: 2rem;
          margin: 0 auto;
        }
        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }
        }
        @media (max-width: 400px) {
            .container {
                padding: 0.5rem;
            }
        }
        .app-layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 2rem;
          align-items: start;
        }
        @media (max-width: 1024px) {
          .app-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

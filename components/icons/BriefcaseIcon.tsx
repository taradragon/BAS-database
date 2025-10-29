
import React from 'react';

export const BriefcaseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.07a2.25 2.25 0 0 1-2.25 2.25H5.996a2.25 2.25 0 0 1-2.25-2.25v-4.07a2.25 2.25 0 0 1 .528-1.485c.354-.427.85-.665 1.372-.665h11.596c.522 0 1.018.238 1.372.665.354.427.528 1.058.528 1.485Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.735V5.25A2.25 2.25 0 0 0 16.125 3H7.875A2.25 2.25 0 0 0 5.625 5.25v7.485" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.125 3v1.875" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 3v1.875" />
  </svg>
);

import React from 'react';

export default function LogoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width="1em"
      height="1em"
      fill="none"
      {...props}
    >
      <style>
        {`
          @keyframes rotate-cw {
            100% { transform: rotate(360deg); }
          }
          @keyframes rotate-ccw {
            100% { transform: rotate(-360deg); }
          }
          .ring-outer {
            transform-origin: 50px 50px;
            animation: rotate-cw 4s linear infinite;
          }
          .ring-inner {
            transform-origin: 50px 50px;
            animation: rotate-ccw 3s linear infinite;
          }
        `}
      </style>
      
      {/* Fully Black Background */}
      <circle cx="50" cy="50" r="49" fill="#000000" />
      
      {/* Dynamic Rotating Picture 1 (Outer Ring) */}
      <circle 
        cx="50" cy="50" r="34" 
        className="ring-outer"
        stroke="#FFFFFF" 
        strokeWidth="3" 
        strokeDasharray="150 63" 
        strokeLinecap="round" 
      />
      
      {/* Dynamic Rotating Picture 2 (Inner Ring) */}
      <circle 
        cx="50" cy="50" r="22" 
        className="ring-inner"
        stroke="#FFFFFF" 
        strokeWidth="3" 
        strokeDasharray="80 58" 
        strokeLinecap="round" 
      />
      
      {/* Center White Core */}
      <circle cx="50" cy="50" r="9" fill="#FFFFFF" />
    </svg>
  );
}

'use client';

import React from 'react';
import Image from 'next/image';

interface BrandLogoProps {
  size?: number;
  withText?: boolean;
  className?: string;
  badge?: string;
}

export function BrandLogo({
  size = 32,
  withText = false,
  className = '',
  badge = 'v2.0',
}: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className="relative rounded-xl flex items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-105"
        style={{
          width: size,
          height: size,
          boxShadow: '0 0 16px rgba(56, 189, 248, 0.35), 0 0 30px rgba(167, 139, 250, 0.2)',
        }}
      >
        <Image
          src="/logo.png"
          alt="Explain My Code Logo"
          width={size}
          height={size}
          className="w-full h-full object-cover rounded-xl"
          priority
        />
      </div>

      {withText && (
        <div className="flex items-center gap-2">
          <span
            className="font-semibold text-base tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            Explain My Code
          </span>
          {badge && (
            <span className="badge badge-info text-[10px] py-0.5 px-2 font-mono">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default BrandLogo;

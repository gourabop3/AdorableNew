"use client";

import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';

interface SafeButtonProps extends Omit<ButtonProps, 'onClick'> {
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
}

export const SafeButton: React.FC<SafeButtonProps> = ({ onClick, children, ...props }) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      e.preventDefault();
      onClick?.(e);
    } catch (error) {
      console.error('Button click error:', error);
    }
  };

  return (
    <Button onClick={handleClick} {...props}>
      {children}
    </Button>
  );
};
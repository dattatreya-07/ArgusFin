import React from 'react';

export interface VisuallyHiddenProps {
  children: React.ReactNode;
  as?: React.ElementType;
}

export const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({
  children,
  as: Component = 'span',
}) => {
  return (
    <Component className="sr-only absolute w-[1px] h-[1px] p-0 -m-[1px] overflow-hidden clip-rect-0 whitespace-nowrap border-0">
      {children}
    </Component>
  );
};

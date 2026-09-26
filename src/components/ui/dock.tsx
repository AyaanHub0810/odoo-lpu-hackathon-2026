'use client';

import React, {
  Children,
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
  AnimatePresence,
} from 'motion/react';
import { cn } from '@/lib/utils';

const DEFAULT_MAGNIFICATION = 66;
const DEFAULT_DISTANCE = 120;
const DEFAULT_PANEL_HEIGHT = 54;

type DockProps = {
  children: React.ReactNode;
  className?: string;
  distance?: number;
  panelHeight?: number;
  magnification?: number;
  spring?: SpringOptions;
};

type DockItemProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  onMouseEnter?: () => void;
};

type DockLabelProps = {
  className?: string;
  children: React.ReactNode;
};

type DockIconProps = {
  className?: string;
  children: React.ReactNode;
};

type DockContextType = {
  mouseX: MotionValue<number>;
  spring: SpringOptions;
  magnification: number;
  distance: number;
  registerItem: (id: string, getCenter: () => number) => () => void;
  getCenter: (id: string) => number;
};

const DockContext = createContext<DockContextType | undefined>(undefined);

function useDock() {
  const context = useContext(DockContext);
  if (!context) {
    throw new Error('useDock must be used within a DockProvider');
  }
  return context;
}

export function Dock({
  children,
  className,
  spring = { mass: 0.08, stiffness: 260, damping: 18 },
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
  panelHeight = DEFAULT_PANEL_HEIGHT,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const itemsMap = useRef<Map<string, () => number>>(new Map());
  const centersCache = useRef<Map<string, number>>(new Map());

  const registerItem = useCallback((id: string, getCenter: () => number) => {
    itemsMap.current.set(id, getCenter);
    return () => {
      itemsMap.current.delete(id);
      centersCache.current.delete(id);
    };
  }, []);

  const getCenter = useCallback((id: string) => {
    return centersCache.current.get(id) || 0;
  }, []);

  const refreshCenters = useCallback(() => {
    itemsMap.current.forEach((calcCenter, id) => {
      centersCache.current.set(id, calcCenter());
    });
  }, []);

  useEffect(() => {
    window.addEventListener('resize', refreshCenters, { passive: true });
    return () => window.removeEventListener('resize', refreshCenters);
  }, [refreshCenters]);

  return (
    <DockContext.Provider
      value={{
        mouseX,
        spring,
        distance,
        magnification,
        registerItem,
        getCenter,
      }}
    >
      <div
        onMouseEnter={() => {
          refreshCenters();
        }}
        onMouseMove={(e) => {
          mouseX.set(e.clientX);
        }}
        onMouseLeave={() => {
          mouseX.set(Infinity);
        }}
        className={cn(
          'relative mx-auto flex w-fit items-center gap-1.5 sm:gap-2 rounded-full border border-slate-200/90 dark:border-white/10 bg-white/85 dark:bg-[#090d16]/85 px-2.5 sm:px-3.5 py-1.5 shadow-[0_12px_36px_-8px_rgba(15,23,42,0.1),0_0_24px_rgba(99,102,241,0.08)] dark:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.85),0_0_24px_rgba(99,102,241,0.15)] backdrop-blur-2xl transition-[border-color,background-color] select-none overflow-visible',
          className
        )}
        style={{ height: panelHeight }}
        role="toolbar"
        aria-label="Application dock"
      >
        {children}
      </div>
    </DockContext.Provider>
  );
}

let itemIdCounter = 0;

export function DockItem({ children, className, onClick, onMouseEnter }: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const idRef = useRef<string>(`dock-item-${++itemIdCounter}`);
  const { distance, magnification, mouseX, spring, registerItem, getCenter } = useDock();
  const [isHoveredState, setIsHoveredState] = useState(false);

  // Register position calculator
  useEffect(() => {
    const unregister = registerItem(idRef.current, () => {
      if (!ref.current) return 0;
      const rect = ref.current.getBoundingClientRect();
      return rect.left + rect.width / 2;
    });
    return unregister;
  }, [registerItem]);

  // Pure memory math - ZERO forced reflows during continuous mouse movement!
  const mouseDistance = useTransform(mouseX, (x) => {
    if (x === Infinity) return Infinity;
    const center = getCenter(idRef.current);
    if (!center && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      return x - (rect.left + rect.width / 2);
    }
    return x - center;
  });

  const widthTransform = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [38, magnification, 38]
  );

  const width = useSpring(widthTransform, spring);

  return (
    <motion.div
      ref={ref}
      style={{
        width,
        height: width,
        willChange: 'width, height',
      }}
      onHoverStart={() => {
        setIsHoveredState(true);
        onMouseEnter?.();
      }}
      onHoverEnd={() => setIsHoveredState(false)}
      onMouseEnter={() => {
        setIsHoveredState(true);
        onMouseEnter?.();
      }}
      onMouseLeave={() => setIsHoveredState(false)}
      onFocus={() => {
        setIsHoveredState(true);
        onMouseEnter?.();
      }}
      onBlur={() => setIsHoveredState(false)}
      onClick={onClick}
      className={cn(
        'relative inline-flex items-center justify-center cursor-pointer select-none rounded-full flex-shrink-0',
        className
      )}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
    >
      {Children.map(children, (child) =>
        React.isValidElement(child)
          ? cloneElement(child as React.ReactElement<any>, { width, isHovered: isHoveredState })
          : child
      )}
    </motion.div>
  );
}

export function DockLabel({ children, className, ...rest }: DockLabelProps) {
  const restProps = rest as Record<string, unknown>;
  const isHovered = restProps['isHovered'] as boolean;

  return (
    <AnimatePresence>
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 0.9 }}
          animate={{ opacity: 1, y: 8, scale: 1 }}
          exit={{ opacity: 0, y: 0, scale: 0.9 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            'absolute -bottom-11 left-1/2 w-fit whitespace-nowrap rounded-lg border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0c101d] px-3 py-1.5 text-[10px] font-bold text-slate-700 dark:text-slate-200 shadow-2xl backdrop-blur-xl pointer-events-none z-[100]',
            className
          )}
          role="tooltip"
          style={{ x: '-50%' }}
        >
          {/* Small arrow pointing up */}
          <span className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 bg-white dark:bg-[#0c101d] border-l border-t border-slate-200/90 dark:border-white/10" />
          <span className="relative z-10">{children}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function DockIcon({ children, className, ...rest }: DockIconProps) {
  const restProps = rest as Record<string, unknown>;
  const width = restProps['width'] as MotionValue<number>;

  const iconSize = useTransform(width || new MotionValue(38), (val) => val * 0.52);

  return (
    <motion.div
      style={{
        width: iconSize,
        height: iconSize,
        willChange: 'width, height',
      }}
      className={cn('flex items-center justify-center pointer-events-none', className)}
    >
      {children}
    </motion.div>
  );
}

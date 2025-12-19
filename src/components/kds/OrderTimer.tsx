import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface OrderTimerProps {
  startTime: Date;
}

export function OrderTimer({ startTime }: OrderTimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const start = startTime.getTime();
      setElapsed(Math.floor((now - start) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  const getTimerClass = () => {
    if (minutes >= 10) return 'timer-urgent';
    if (minutes >= 5) return 'timer-warning';
    return 'timer-normal';
  };

  return (
    <span className={cn('text-kds-timer font-mono', getTimerClass())}>
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </span>
  );
}

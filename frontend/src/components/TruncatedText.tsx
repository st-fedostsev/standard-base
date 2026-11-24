import { useEffect, useRef, useState } from 'react';

import { Tooltip } from '@/components/Tooltip';
import { Typography } from '@mui/material';
import type { TypographyProps } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

type TruncatedTextProps = {
  /** Полный текст. В ячейке показывается столько, сколько помещается. */
  value: string;
  variant?: TypographyProps['variant'];
  color?: TypographyProps['color'];
  sx?: SxProps<Theme>;

  /**
   * Показывать подсказку всегда, даже если текст помещается целиком. Нужно для
   * идентификаторов: полный UUID полезно видеть на любом экране.
   */
  alwaysShowTooltip?: boolean;
};

const BASE_SX = {
  display: 'block',
  minWidth: 0,
  maxWidth: '100%',
} as const;

/**
 * Текст в одну строку с многоточием. Если он не помещается, при наведении или
 * фокусе показывает полное значение в Tooltip.
 */
export function TruncatedText({
  value,
  variant = 'body2',
  color,
  sx,
  alwaysShowTooltip = false,
}: TruncatedTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [isOverflowed, setIsOverflowed] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    let cancelled = false;
    let frame = 0;

    const update = () => {
      if (!cancelled) {
        setIsOverflowed(element.scrollWidth > element.clientWidth + 1);
      }
    };

    const scheduleUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    scheduleUpdate();

    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(element);
    window.addEventListener('resize', scheduleUpdate);

    // После загрузки шрифта ширина текста может измениться.
    void document.fonts?.ready.then(scheduleUpdate);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [value]);

  const mergedSx = sx ? [BASE_SX, ...(Array.isArray(sx) ? sx : [sx])] : BASE_SX;
  const shouldShowTooltip = alwaysShowTooltip || isOverflowed;

  return (
    <Tooltip
      render={() => value}
      pos='top'
      align='start'
      trigger='hover&focus'
      disabled={!shouldShowTooltip}
    >
      <Typography
        ref={ref}
        component='span'
        variant={variant}
        color={color}
        noWrap
        aria-label={value}
        sx={mergedSx}
      >
        {value}
      </Typography>
    </Tooltip>
  );
}

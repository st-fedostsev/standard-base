import type { ReactElement, ReactNode } from 'react';

import { Tooltip as MuiTooltip } from '@mui/material';
import type { TooltipProps as MuiTooltipProps } from '@mui/material';

export type TooltipPos = 'top' | 'bottom' | 'left' | 'right';

export type TooltipAlign = 'start' | 'center' | 'end';

export type TooltipTrigger = 'hover' | 'focus' | 'hover&focus';

export type TooltipProps = {
  /** Содержимое подсказки. */
  render: () => ReactNode;

  /** Сторона, с которой показывается подсказка. По умолчанию top. */
  pos?: TooltipPos;

  /** Выравнивание относительно элемента. По умолчанию center. */
  align?: TooltipAlign;

  /** Когда показывать подсказку. По умолчанию hover&focus. */
  trigger?: TooltipTrigger;

  /** Полностью отключает подсказку. */
  disabled?: boolean;

  /** Показывать стрелку. По умолчанию true. */
  hasArrow?: boolean;

  /** Задержка перед показом в миллисекундах. По умолчанию 300. */
  enterDelay?: number;

  /** Задержка перед скрытием в миллисекундах. */
  leaveDelay?: number;

  /** Элемент, к которому привязана подсказка. */
  children: ReactElement;
};

function getPlacement(
  pos: TooltipPos,
  align: TooltipAlign
): MuiTooltipProps['placement'] {
  return (align === 'center' ? pos : `${pos}-${align}`) as NonNullable<
    MuiTooltipProps['placement']
  >;
}

/**
 * Подсказка в стиле Контура: светлая карточка с тенью и стрелкой. Обёртка над
 * MUI Tooltip с API render/pos/trigger.
 */
export function Tooltip({
  render,
  pos = 'top',
  align = 'center',
  trigger = 'hover&focus',
  disabled = false,
  hasArrow = true,
  enterDelay = 300,
  leaveDelay,
  children,
}: TooltipProps) {
  return (
    <MuiTooltip
      title={disabled ? '' : render()}
      placement={getPlacement(pos, align)}
      arrow={hasArrow}
      enterDelay={enterDelay}
      leaveDelay={leaveDelay}
      describeChild
      disableHoverListener={disabled || trigger === 'focus'}
      disableFocusListener={disabled || trigger === 'hover'}
      disableTouchListener={disabled || trigger === 'focus'}
      slotProps={{
        tooltip: {
          sx: {
            maxWidth: 360,
            px: 1.5,
            py: 1,
            bgcolor: 'background.paper',
            color: 'text.primary',
            borderRadius: 1,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.16)',
            fontSize: 13,
            lineHeight: '18px',
            overflowWrap: 'anywhere',
          },
        },
        arrow: {
          sx: {
            color: 'background.paper',
          },
        },
      }}
    >
      {children}
    </MuiTooltip>
  );
}

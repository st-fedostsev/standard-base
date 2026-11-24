import type { ReactElement } from 'react';

import { Tab, Tabs } from '@mui/material';

export type PageHeaderTab = {
  value: string;
  label: string;
  icon?: ReactElement;
  disabled?: boolean;
};

type PageHeaderTabsProps = {
  value: string;
  onChange: (value: string) => void;
  tabs: readonly PageHeaderTab[];
  ariaLabel?: string;
};

/** Переключатель разделов страницы под её заголовком. */
export function PageHeaderTabs({
  value,
  onChange,
  tabs,
  ariaLabel,
}: PageHeaderTabsProps) {
  return (
    <Tabs
      value={value}
      onChange={(_, next: string) => onChange(next)}
      aria-label={ariaLabel}
      textColor='inherit'
      sx={{
        minHeight: 40,

        '& .MuiTabs-indicator': {
          height: 2,
          borderRadius: 1,
        },

        '& .MuiTab-root': {
          minWidth: 0,
          minHeight: 40,
          mr: 3,
          px: 0,
          gap: 1,
          fontFamily: 'Raleway, sans-serif',
          fontSize: 16,
          fontWeight: 500,
          lineHeight: '24px',
          textTransform: 'none',
          color: 'text.primary',

          '& .MuiSvgIcon-root': {
            fontSize: 24,
          },

          '&.Mui-selected': {
            color: 'primary.main',
          },
        },
      }}
    >
      {tabs.map((tab) => (
        <Tab
          key={tab.value}
          value={tab.value}
          label={tab.label}
          icon={tab.icon}
          iconPosition='start'
          disabled={tab.disabled}
        />
      ))}
    </Tabs>
  );
}

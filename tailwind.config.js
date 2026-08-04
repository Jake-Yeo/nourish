export default {
  theme: {
    screens: { compact: '441px', desktop: '960px' },
    extend: {
      colors: {
        canvas: '#F4F7F4', surface: '#FFFFFF', ink: '#192420', muted: '#71807A', border: '#E3E9E5',
        primary: '#23795E', 'primary-strong': '#155B46', 'primary-soft': '#E3F2EB', accent: '#C7E16E',
        'progress-track': '#EDF1EE', destructive: '#9B4147', 'destructive-soft': '#FAE8E9',
        warning: '#836328', 'warning-soft': '#FFF8E8', info: '#32639B', 'info-soft': '#E8F2FF',
        ai: '#6950AE', 'ai-soft': '#EEE9FF', overlay: 'rgb(12 25 20 / 48%)', 'muted-icon': '#87928D',
        protein: '#7856D8', carbs: '#4A90E2', fat: '#D77BA7', fiber: '#269A6D',
        lunch: '#C0791D', 'lunch-soft': '#FFF1DA', dinner: '#7055BF', 'dinner-soft': '#E9E5F8',
        snacks: '#B8535A', 'snacks-soft': '#F9E4E5', chart: '#BAD4C9', 'chart-copy': '#C5DED3',
      },
      spacing: {
        badge: '0.25rem', control: '0.5rem', 'control-wide': '0.75rem', content: '1rem', section: '1.125rem',
        card: '1.3125rem', 'card-large': '1.5rem', 'page-mobile': '1.125rem', 'page-desktop': '1.875rem',
        'page-top-mobile': '1.5rem', 'page-top-desktop': '2.375rem', 'page-bottom-mobile': '7.25rem',
        'page-bottom-desktop': '4.375rem', field: '0.75rem', 'modal-x': '1.1875rem', 'modal-top': '0.3125rem',
        'modal-bottom': '1.5rem', 'modal-safe': 'calc(1.5rem + env(safe-area-inset-bottom))',
        'navigation-height': 'calc(4.5rem + env(safe-area-inset-bottom))', 'navigation-safe': 'env(safe-area-inset-bottom)',
        'floating-button-offset': 'calc(5.125rem + env(safe-area-inset-bottom))',
        'icon-control': '2.625rem', 'icon-small': '2.4375rem', 'icon-medium': '3rem', 'icon-large': '4.25rem',
      },
      borderRadius: {
        card: '1.5625rem', modal: '1.75rem', control: '0.75rem', field: '0.6875rem',
        button: '0.9375rem', icon: '0.75rem', sheet: '1.125rem', pill: '9999px',
      },
      boxShadow: {
        card: '0 16px 40px rgb(23 51 40 / 8%)', primary: '0 9px 20px rgb(35 121 94 / 20%)',
        floating: '0 10px 25px rgb(20 75 56 / 30%)', modal: '0 -20px 60px rgb(10 30 22 / 22%)',
        toast: '0 12px 35px rgb(10 30 22 / 27%)', control: '0 7px 25px rgb(30 68 52 / 4%)',
      },
      fontSize: {
        micro: ['0.5625rem', '0.75rem'], eyebrow: ['0.6875rem', '1rem'], caption: ['0.6875rem', '1rem'], detail: ['0.75rem', '1.125rem'],
        body: ['0.875rem', '1.375rem'], section: ['1.3125rem', '1.75rem'], modal: ['1.4375rem', '1.75rem'],
      },
      maxWidth: { app: '52.5rem', modal: '38.75rem', 'photo-modal': '42.5rem' },
      gridTemplateColumns: {
        'date-navigation': '2.625rem 1fr 2.625rem', 'dashboard-summary': '1fr 7rem',
        'dashboard-summary-wide': '1fr 8rem', 'diary-row': 'auto 1fr auto auto', 'summary-value': '1fr auto',
        'app-shell': '15rem 1fr', 'captured-photo': '8.25rem 1fr', 'estimate-item': 'auto 1fr',
      },
    },
  },
}

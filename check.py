import json

text = open('lucide.txt', encoding='utf-8').read()
icons = [
    'Activity', 'Calculator', 'CalendarCheck', 'Users', 
    'Bell', 'CheckCircle2', 'Sparkles', 'Navigation', 
    'Home', 'LayoutDashboard', 'CalendarDays', 'Plus', 
    'ChevronDown', 'BarChart3', 'ScanText', 'ArrowRight',
    'SearchCode', 'Fingerprint', 'ShieldCheck', 'Gamepad2', 
    'MonitorPlay', 'CloudCog', 'LayoutGrid', 'Dumbbell', 
    'Banknote', 'HelpCircle', 'UserCircle2', 'X', 'RefreshCw', 
    'CreditCard', 'Eye', 'DollarSign', 'Shield', 'Zap'
]
missing = [i for i in icons if f'"{i}"' not in text]
print('MISSING:', missing)

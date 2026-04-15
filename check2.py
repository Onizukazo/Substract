import re
text = open('c:/Users/rishi/Downloads/test 2/app.jsx').read()
lucide = open('c:/Users/rishi/Downloads/test 2/lucide.txt', encoding='utf-8').read()

m = re.search(r'const\s*\{([^}]+)\}\s*=\s*window\.LucideReact', text, re.DOTALL)
if m:
    icons = [i.strip() for i in m.group(1).split(',') if i.strip()]
    missing = [i for i in icons if f'"{i}"' not in lucide]
    print("MISSING IN DESTRUCTURING:", missing)
else:
    print("Could not find destructuring")

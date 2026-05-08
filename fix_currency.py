with open('app.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix double ₹₹ to just ₹
content = content.replace('\u20b9\u20b9', '\u20b9')

# Inside JS template literals (backticks), ₹{expr} won't work.
# It needs ₹${expr}. Fix the known template literal pattern:
content = content.replace("`Owes \u20b9{", "`Owes \u20b9${")

# Also need to check for template literal patterns with content like:
# `₹{something.toFixed(0)}/person`
# Find and fix those too
import re

# Find patterns like: `...₹{...}...` inside template literals
# These need to be `...₹${...}...`
lines = content.split('\n')
fixed_lines = []
for line in lines:
    # Check if line has a template literal containing ₹{
    # Simple heuristic: if there's a backtick before ₹{ and after }
    if '`' in line and '\u20b9{' in line:
        # Replace ₹{ with ₹${ only inside template literals
        # More specific: if preceded by a backtick context
        line = line.replace('\u20b9{', '\u20b9${')
    fixed_lines.append(line)

content = '\n'.join(fixed_lines)

# But now we may have broken JSX ₹{expr} that was CORRECT
# In JSX (not template literals), ₹{expr} is correct
# In template literals, ₹${expr} is correct
# Let's be more surgical - only fix lines with backtick template literals

# Actually, let me just search for ALL remaining issues
count_double = content.count('\u20b9\u20b9')
with open('app.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

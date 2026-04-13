import re

file_path = r'c:\Users\fabia\Desktop\STARFORCE-Dark-Horizon\script\gameLoop.js'

# Read the file
with open(file_path, 'r', encoding='utf8') as f:
    content = f.read()

# Try to find and display the problematic section around line 110
lines = content.split('\n')
print("Lines 102-116:")
for i in range(101, 116):
    if i < len(lines):
        line = lines[i]
        # Show with visible whitespace
        visible = line.replace(' ', '·').replace('\t', '→')
        print(f"{i+1}: [{visible}]")

# Pattern to match the garbage block with flexible whitespace
pattern = r'    // -+\s+\n\s*\n(\s*\n)+\s*// -+\s*\n\s*// PLAYER & SPAWN\s*\n\s*// -+\s*\n\s*// -+\s*\n\s*// WINGMAN'

replacement = r'    // -----------------------------------\n    // WINGMAN'

new_content = re.sub(pattern, replacement, content)

if new_content != content:
    print("\n✓ Pattern matched! Writing fix...")
    with open(file_path, 'w', encoding='utf8') as f:
        f.write(new_content)
    
    # Verify
    with open(file_path, 'r', encoding='utf8') as f:
        lines = f.read().split('\n')
    print("\nFixed section (lines 98-120):")
    for i in range(97, 120):
        if i < len(lines):
            print(f"{i+1}: {lines[i]}")
else:
    print("\n✗ Pattern did not match")

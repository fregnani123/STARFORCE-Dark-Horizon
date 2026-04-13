import os
import shutil

# File paths
original_file = r'c:\Users\fabia\Desktop\STARFORCE-Dark-Horizon\script\gameLoop.js'
fixed_file = r'c:\Users\fabia\Desktop\STARFORCE-Dark-Horizon\script\gameLoop_fixed.js'

# Read the fixed version
with open(fixed_file, 'r', encoding='utf-8') as f:
    fixed_content = f.read()

# Create backup
with open(original_file, 'r', encoding='utf-8') as f:
    original_content = f.read()

backup_file = original_file + '.bak'
with open(backup_file, 'w', encoding='utf-8') as f:
    f.write(original_content)

print(f"✓ Backup created: {backup_file}")

# Write the fixed version
with open(original_file, 'w', encoding='utf-8') as f:
    f.write(fixed_content)

print(f"✓ File updated: {original_file}")

# Count lines
original_lines = len(original_content.split('\n'))
fixed_lines = len(fixed_content.split('\n'))
print(f"✓ Lines removed: {original_lines - fixed_lines}")

# Verify changes
if 'if (currentWingman) currentWingman.draw(ctx)' in fixed_content:
    print("❌ ERROR: currentWingman.draw line still found!")
else:
    print("✓ currentWingman.draw() line removed")

if 'console.error(\'[Wingman] erro no gameLoop:\'' in fixed_content:
    print("❌ ERROR: WINGMAN block still found!")
else:
    print("✓ WINGMAN block removed")

print("\nSUCCESS: WINGMAN removal complete")

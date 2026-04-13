#!/usr/bin/env python3
import os

file_path = r'c:\Users\fabia\Desktop\STARFORCE-Dark-Horizon\script\gameLoop.js'

# Read the file
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Original file: {len(lines)} lines")

# Step 1: Remove lines 103-139 (1-indexed, inclusive)
# Convert to 0-indexed: 102-138
result = []
for i, line in enumerate(lines):
    line_num = i + 1  # 1-based line number
    if 103 <= line_num <= 139:
        print(f"Removing line {line_num}: {line.rstrip()[:60]}")
        continue
    result.append(line)

print(f"After removing lines 103-139: {len(result)} lines remain")

# Step 2: Remove the line containing "if (currentWingman) currentWingman.draw(ctx);"
final_result = []
for line in result:
    if 'if (currentWingman)' in line and 'currentWingman.draw(ctx)' in line:
        print(f"Removing line with currentWingman.draw(): {line.rstrip()[:60]}")
        continue
    final_result.append(line)

print(f"After removing currentWingman.draw line: {len(final_result)} lines remain")

# Step 3: Write back to file
with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(final_result)

print(f"✓ File updated: {file_path}")
print(f"✓ Total lines removed: {len(lines) - len(final_result)}")

#!/usr/bin/env python3
import sys

# Read the file line by line
with open(r'c:\Users\fabia\Desktop\STARFORCE-Dark-Horizon\script\gameLoop.js', 'rb') as f:
    lines = f.read().split(b'\n')

# Show lines 110-116
for i in range(109, 116):
    if i < len(lines):
        line = lines[i]
        # Show hex representation and ASCII
        print(f"Line {i+1}:")
        print(f"  Raw: {line}")
        print(f"  Hex: {line.hex()}")
        print(f"  Repr: {repr(line)}")
        print()

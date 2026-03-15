#!/bin/bash

# Script to crop modes.gif to remove left and right borders

INPUT_FILE="static/videos/modes.gif"
OUTPUT_FILE="static/videos/modes_cropped.gif"
BACKUP_FILE="static/videos/modes_original.gif"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== GIF Crop Script ===${NC}"
echo ""

# Check if gifsicle is installed
if ! command -v gifsicle &> /dev/null; then
    echo -e "${RED}Error: gifsicle is not installed${NC}"
    exit 1
fi

# Check if input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo -e "${RED}Error: $INPUT_FILE not found${NC}"
    exit 1
fi

echo -e "Processing: ${GREEN}$INPUT_FILE${NC}"
echo ""

# Backup original file if not already backed up
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${YELLOW}Creating backup...${NC}"
    cp "$INPUT_FILE" "$BACKUP_FILE"
    echo -e "${GREEN}Backup created: $BACKUP_FILE${NC}"
    echo ""
fi

# Get original dimensions
echo -e "${YELLOW}Original GIF info:${NC}"
gifsicle --info "$INPUT_FILE" | head -5

echo ""
echo -e "${YELLOW}Cropping GIF...${NC}"

# Original size is 3024x1230
# Crop to remove borders: crop from x=70, y=0, width=2884 (3024-140), height=1230
# This removes approximately 70 pixels from each side
gifsicle "$INPUT_FILE" --crop 70,0+2884x1230 --optimize=3 -o "$OUTPUT_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}=== Success! ===${NC}"
    
    # Show info
    echo ""
    echo -e "${YELLOW}Cropped GIF info:${NC}"
    gifsicle --info "$OUTPUT_FILE" | head -5
    
    # Check sizes
    ORIG_SIZE=$(du -h "$INPUT_FILE" | cut -f1)
    NEW_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
    
    echo ""
    echo -e "Original size: ${YELLOW}$ORIG_SIZE${NC}"
    echo -e "New size: ${GREEN}$NEW_SIZE${NC}"
    echo ""
    echo "Properties:"
    echo "  ✓ Cropped 70 pixels from left and right"
    echo "  ✓ New dimensions: 2884x1230 (from 3024x1230)"
    echo ""
    echo "To replace the original:"
    echo "  mv $OUTPUT_FILE $INPUT_FILE"
    echo ""
    echo "To restore the original:"
    echo "  cp $BACKUP_FILE $INPUT_FILE"
else
    echo -e "${RED}Error cropping GIF${NC}"
    exit 1
fi

#!/bin/bash

# Script to modify prism_teaser.gif to have constant framerate and freeze at the end

INPUT_FILE="static/videos/prism_teaser.gif"
OUTPUT_FILE="static/videos/prism_teaser_fixed.gif"
BACKUP_FILE="static/videos/prism_teaser_original.gif"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== GIF Framerate & Loop Fix Script ===${NC}"
echo ""

# Check if gifsicle is installed
if ! command -v gifsicle &> /dev/null; then
    echo -e "${RED}Error: gifsicle is not installed${NC}"
    echo "Please install it using: conda install conda-forge::gifsicle"
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

# Get info about the GIF
echo -e "${YELLOW}Analyzing GIF...${NC}"
gifsicle --info "$INPUT_FILE" | head -20

echo ""
echo -e "${YELLOW}Fixing framerate and disabling loop...${NC}"

# Fix the GIF:
# --delay 10 = 10 centiseconds (0.1 seconds) per frame = 10 fps (constant framerate)
# --loopcount=1 = play once and stop (freeze at end)
# You can adjust --delay value: 5 = 20fps, 10 = 10fps, 20 = 5fps
gifsicle "$INPUT_FILE" \
  --delay 10 \
  --loopcount=1 \
  --optimize=3 \
  -o "$OUTPUT_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}=== Success! ===${NC}"
    echo -e "Original: ${YELLOW}$INPUT_FILE${NC} (backed up to $BACKUP_FILE)"
    echo -e "Fixed version: ${GREEN}$OUTPUT_FILE${NC}"
    echo ""
    echo "Properties:"
    echo "  - Constant framerate: 10 fps (0.1s per frame)"
    echo "  - Loop count: 1 (plays once then freezes)"
    echo ""
    echo "To replace the original with the fixed version:"
    echo "  mv $OUTPUT_FILE $INPUT_FILE"
    echo ""
    echo "To restore the original:"
    echo "  cp $BACKUP_FILE $INPUT_FILE"
else
    echo -e "${RED}Error processing GIF${NC}"
    exit 1
fi

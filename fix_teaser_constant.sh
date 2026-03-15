#!/bin/bash

# Script to modify prism_teaser.gif with truly constant framerate and no loop

INPUT_FILE="static/videos/prism_teaser.gif"
OUTPUT_FILE="static/videos/prism_teaser_fixed.gif"
TEMP_DIR="static/videos/temp_frames"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== GIF Constant Framerate & No-Loop Fix ===${NC}"
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

# Create temp directory
mkdir -p "$TEMP_DIR"

# Extract all frames
echo -e "${YELLOW}Extracting frames...${NC}"
gifsicle --explode "$INPUT_FILE" -o "$TEMP_DIR/frame"

# Count frames
FRAME_COUNT=$(ls -1 "$TEMP_DIR"/frame.* 2>/dev/null | wc -l)
echo -e "Found ${GREEN}$FRAME_COUNT frames${NC}"

if [ $FRAME_COUNT -eq 0 ]; then
    echo -e "${RED}No frames extracted${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Reassemble with constant delay and no loop
echo -e "${YELLOW}Reassembling with constant framerate...${NC}"

# Set delay to 10 centiseconds (0.1s = 10fps) for all frames
# Use --loopcount=1 to play once and freeze
gifsicle --delay 10 --loopcount=1 --optimize=3 "$TEMP_DIR"/frame.* -o "$OUTPUT_FILE"

# Clean up
rm -rf "$TEMP_DIR"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}=== Success! ===${NC}"
    
    # Show info
    echo ""
    echo -e "${YELLOW}Original GIF info:${NC}"
    gifsicle --info "$INPUT_FILE" | grep -E "loop|images"
    
    echo ""
    echo -e "${YELLOW}Fixed GIF info:${NC}"
    gifsicle --info "$OUTPUT_FILE" | grep -E "loop|images"
    
    # Check sizes
    ORIG_SIZE=$(du -h "$INPUT_FILE" | cut -f1)
    NEW_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
    
    echo ""
    echo -e "Original size: ${YELLOW}$ORIG_SIZE${NC}"
    echo -e "New size: ${GREEN}$NEW_SIZE${NC}"
    echo ""
    echo "Properties:"
    echo "  ✓ Constant framerate: 10 fps (0.1s per frame)"
    echo "  ✓ Loop count: 1 (plays once then freezes at last frame)"
    echo ""
    echo "To replace the original:"
    echo "  mv $OUTPUT_FILE $INPUT_FILE"
else
    echo -e "${RED}Error processing GIF${NC}"
    exit 1
fi

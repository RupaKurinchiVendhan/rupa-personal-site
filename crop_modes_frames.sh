#!/bin/bash

# Script to crop modes.gif by extracting, cropping, and reassembling frames

INPUT_FILE="static/videos/modes.gif"
OUTPUT_FILE="static/videos/modes_cropped.gif"
TEMP_DIR="static/videos/temp_modes"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== GIF Crop with Frame Extraction ===${NC}"
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
echo -e "${YELLOW}Warning: This has 787 frames and may take a while...${NC}"
echo ""

# Create temp directory
mkdir -p "$TEMP_DIR"

# Extract all frames
echo -e "${YELLOW}Extracting frames...${NC}"
gifsicle --unoptimize "$INPUT_FILE" | gifsicle --explode - -o "$TEMP_DIR/frame"

# Count frames
FRAME_COUNT=$(ls -1 "$TEMP_DIR"/frame.* 2>/dev/null | wc -l)
echo -e "Found ${GREEN}$FRAME_COUNT frames${NC}"

if [ $FRAME_COUNT -eq 0 ]; then
    echo -e "${RED}No frames extracted${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Crop each frame (remove 70 pixels from left and right)
echo -e "${YELLOW}Cropping frames...${NC}"
for frame in "$TEMP_DIR"/frame.*; do
    gifsicle "$frame" --crop 70,0+2884x1230 -o "${frame}.cropped"
    mv "${frame}.cropped" "$frame"
done

# Reassemble with original timing
echo -e "${YELLOW}Reassembling GIF...${NC}"
gifsicle --delay=2 --optimize=3 "$TEMP_DIR"/frame.* -o "$OUTPUT_FILE"

# Clean up
echo -e "${YELLOW}Cleaning up temp files...${NC}"
rm -rf "$TEMP_DIR"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}=== Success! ===${NC}"
    
    # Show info
    echo ""
    echo -e "${YELLOW}Cropped GIF info:${NC}"
    gifsicle --info "$OUTPUT_FILE" | head -10
    
    # Check sizes
    ORIG_SIZE=$(du -h "$INPUT_FILE" | cut -f1)
    NEW_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
    
    echo ""
    echo -e "Original size: ${YELLOW}$ORIG_SIZE${NC}"
    echo -e "New size: ${GREEN}$NEW_SIZE${NC}"
    echo ""
    echo "To replace the original:"
    echo "  mv $OUTPUT_FILE $INPUT_FILE"
else
    echo -e "${RED}Error processing GIF${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
fi

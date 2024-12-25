#!/bin/bash

# Define the root folder containing the archive
ROOT_FOLDER="/Users/eliaskarlsson/sixteencolors-archive/sixteencolors-archive-master"

# Define the output folder
OUTPUT_FOLDER="$ROOT_FOLDER/output"

# Create the output folder if it doesn't exist
mkdir -p "$OUTPUT_FOLDER"

# Find and process all .ANS files in the archive
find "$ROOT_FOLDER" -type f -name "*.ANS" | while read -r FILE; do
    # Get the relative path of the file from the root folder
    RELATIVE_PATH="${FILE#$ROOT_FOLDER/}"

    # Create the corresponding subfolder structure in the output folder
    OUTPUT_SUBFOLDER=$(dirname "$OUTPUT_FOLDER/$RELATIVE_PATH")
    mkdir -p "$OUTPUT_SUBFOLDER"

    # Get the base name of the file (without the folder path and extension)
    BASENAME=$(basename "$FILE" .ANS)

    # Run ansilove to create a PNG
    ansilove "$FILE" -o "$OUTPUT_SUBFOLDER/$BASENAME.png"

    # Print a message for each file processed
    echo "Processed: $FILE -> $OUTPUT_SUBFOLDER/$BASENAME.png"
done

echo "Batch processing completed! Check the output folder: $OUTPUT_FOLDER"

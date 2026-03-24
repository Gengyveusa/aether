#!/usr/bin/env bash
# Setup script for ScienceClaw → Supabase sync
# Creates config directory and prompts for credentials

set -euo pipefail

CONFIG_DIR="$HOME/.scienceclaw"
CONFIG_FILE="$CONFIG_DIR/supabase_config.json"
TEMPLATE="$(dirname "$0")/supabase_config_template.json"

echo "=== ScienceClaw Supabase Sync Setup ==="
echo

mkdir -p "$CONFIG_DIR"

if [ -f "$CONFIG_FILE" ]; then
    echo "Config already exists at $CONFIG_FILE"
    echo "Current contents:"
    cat "$CONFIG_FILE"
    echo
    read -p "Overwrite? (y/N): " overwrite
    if [[ ! "$overwrite" =~ ^[yY]$ ]]; then
        echo "Keeping existing config."
        exit 0
    fi
fi

echo "Enter your Supabase project URL (e.g., https://abc123.supabase.co):"
read -p "> " SUPABASE_URL

echo "Enter your Supabase anon key:"
read -p "> " SUPABASE_KEY

TABLE="artifacts"
echo "Table name [artifacts]:"
read -p "> " TABLE_INPUT
if [ -n "$TABLE_INPUT" ]; then
    TABLE="$TABLE_INPUT"
fi

cat > "$CONFIG_FILE" <<EOF
{
  "url": "$SUPABASE_URL",
  "anon_key": "$SUPABASE_KEY",
  "table": "$TABLE"
}
EOF

chmod 600 "$CONFIG_FILE"

echo
echo "Config written to $CONFIG_FILE (permissions: 600)"
echo

# Print the CREATE TABLE SQL
echo "=== Run this SQL in your Supabase SQL Editor ==="
python3 "$(dirname "$0")/supabase_sync.py" --create-table
echo

echo "=== Test connectivity ==="
echo "Run: python3 $(dirname "$0")/supabase_sync.py --once"
echo
echo "=== Enable watch mode ==="
echo "Run: python3 $(dirname "$0")/supabase_sync.py --watch"

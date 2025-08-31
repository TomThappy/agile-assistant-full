#!/bin/bash

# Script zur Zusammenfassung der letzten CodeRabbit Bot-Kommentare
# Verwendung: ./summarize-bot-comments.sh <PR_NUMBER>

set -e

PR_NUMBER="$1"

if [ -z "$PR_NUMBER" ]; then
    echo "❌ Fehler: PR-Nummer ist erforderlich"
    echo "Verwendung: $0 <PR_NUMBER>"
    exit 1
fi

if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Fehler: GITHUB_TOKEN environment variable ist erforderlich"
    exit 1
fi

echo "📋 Hole die letzten 3 CodeRabbit Bot-Kommentare aus PR #$PR_NUMBER..."

# Erstelle Zusammenfassung Header
cat > bot_summary.md << 'EOF'
## 🤖 CodeRabbit Bot Kommentar-Zusammenfassung

EOF

# Hole die letzten 3 CodeRabbit Kommentare
COMMENTS=$(gh api repos/$GITHUB_REPOSITORY/issues/$PR_NUMBER/comments \
    --jq '.[] | select(.user.login == "coderabbitai[bot]") | {
        body: .body,
        created_at: .created_at,
        updated_at: .updated_at,
        html_url: .html_url
    }' | jq -s 'sort_by(.created_at) | reverse | .[0:3]')

COMMENT_COUNT=$(echo "$COMMENTS" | jq 'length')

if [ "$COMMENT_COUNT" -eq 0 ]; then
    echo "**Keine CodeRabbit Kommentare gefunden.**" >> bot_summary.md
    echo "ℹ️ Keine CodeRabbit Kommentare in dieser PR gefunden"
else
    echo "✅ Gefunden: $COMMENT_COUNT CodeRabbit Kommentar(e)"
    echo "**Letzte $COMMENT_COUNT CodeRabbit Kommentare:**" >> bot_summary.md
    echo "" >> bot_summary.md
    
    # Verarbeite jeden Kommentar
    echo "$COMMENTS" | jq -r '.[] | @base64' | while read comment; do
        decoded=$(echo "$comment" | base64 -d)
        
        created_at=$(echo "$decoded" | jq -r '.created_at')
        body=$(echo "$decoded" | jq -r '.body')
        html_url=$(echo "$decoded" | jq -r '.html_url')
        
        # Formatiere Datum (ISO 8601 zu deutschem Format)
        formatted_date=$(date -d "$created_at" '+%d.%m.%Y %H:%M' 2>/dev/null || \
                        date -j -f "%Y-%m-%dT%H:%M:%SZ" "$created_at" '+%d.%m.%Y %H:%M' 2>/dev/null || \
                        echo "$created_at")
        
        echo "### 📅 $formatted_date" >> bot_summary.md
        echo "" >> bot_summary.md
        
        # Kürze sehr lange Kommentare
        if [ ${#body} -gt 1000 ]; then
            echo "${body:0:1000}..." >> bot_summary.md
            echo "" >> bot_summary.md
            echo "*[Kommentar gekürzt - [Vollständigen Kommentar ansehen]($html_url)]*" >> bot_summary.md
        else
            echo "$body" >> bot_summary.md
        fi
        
        echo "" >> bot_summary.md
        echo "🔗 [Kommentar ansehen]($html_url)" >> bot_summary.md
        echo "" >> bot_summary.md
        echo "---" >> bot_summary.md
        echo "" >> bot_summary.md
    done
fi

echo "" >> bot_summary.md
echo "*Automatisch generiert am $(date '+%d.%m.%Y %H:%M:%S')*" >> bot_summary.md

# Ausgabe für Workflow-Logs
echo "📋 Bot Comment Summary:"
echo "========================"
cat bot_summary.md
echo "========================"

echo "✅ Bot-Kommentar Zusammenfassung erstellt"

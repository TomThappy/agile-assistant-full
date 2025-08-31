#!/bin/bash

# Script für automatische Anwendung von CodeRabbit GitHub Suggested Changes
# Verwendung: ./apply-coderabbit-suggestions.sh <PR_NUMBER>

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

echo "🔍 Suche nach CodeRabbit Suggested Changes in PR #$PR_NUMBER..."

# Hole alle Reviews vom CodeRabbit Bot
REVIEWS=$(gh api repos/$GITHUB_REPOSITORY/pulls/$PR_NUMBER/reviews \
    --jq '.[] | select(.user.login == "coderabbitai[bot]")')

if [ -z "$REVIEWS" ]; then
    echo "ℹ️ Keine CodeRabbit Reviews gefunden"
    exit 0
fi

echo "✅ CodeRabbit Reviews gefunden, prüfe auf Suggested Changes..."

# Hole alle Review-Kommentare mit Suggestions
SUGGESTIONS=$(gh api repos/$GITHUB_REPOSITORY/pulls/$PR_NUMBER/reviews \
    --jq '.[] | select(.user.login == "coderabbitai[bot]") | .id' | \
    while read review_id; do
        gh api repos/$GITHUB_REPOSITORY/pulls/reviews/$review_id/comments \
            --jq '.[] | select(.suggestion != null) | {
                path: .path,
                line: .line,
                suggestion: .suggestion,
                original_line: .original_line,
                side: .side
            }'
    done | jq -s '.')

SUGGESTION_COUNT=$(echo "$SUGGESTIONS" | jq 'length')

if [ "$SUGGESTION_COUNT" -eq 0 ]; then
    echo "ℹ️ Keine GitHub Suggested Changes gefunden"
    exit 0
fi

echo "🎯 Gefunden: $SUGGESTION_COUNT Suggested Changes"

# Anwenden der Suggestions
echo "$SUGGESTIONS" | jq -r '.[] | @base64' | while read suggestion; do
    decoded=$(echo "$suggestion" | base64 -d)
    
    file_path=$(echo "$decoded" | jq -r '.path')
    line_number=$(echo "$decoded" | jq -r '.line')
    new_content=$(echo "$decoded" | jq -r '.suggestion')
    
    echo "📝 Applying suggestion to $file_path at line $line_number"
    
    # Erstelle Backup
    if [ -f "$file_path" ]; then
        cp "$file_path" "$file_path.backup"
        
        # Ersetze die entsprechende Zeile
        if command -v gsed >/dev/null 2>&1; then
            # macOS mit GNU sed
            gsed -i "${line_number}s/.*/$new_content/" "$file_path"
        else
            # Linux sed
            sed -i "${line_number}s/.*/$new_content/" "$file_path"
        fi
        
        echo "✅ Suggestion angewendet auf $file_path"
    else
        echo "⚠️ Datei $file_path nicht gefunden, überspringe"
    fi
done

# Prüfe auf Änderungen
if [ -n "$(git status --porcelain)" ]; then
    echo "📦 Committe Änderungen..."
    git add .
    git commit -m "🤖 Auto-apply CodeRabbit suggestions

Applied $(echo "$SUGGESTIONS" | jq 'length') suggestions from CodeRabbit review."
    
    echo "🚀 Pushe Änderungen..."
    git push origin $(git branch --show-current)
    
    echo "✅ CodeRabbit suggestions erfolgreich angewendet und gepusht"
else
    echo "ℹ️ Keine Änderungen durch Suggestions"
fi

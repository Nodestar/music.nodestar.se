#!/usr/bin/env bash
# Bygger sajten och speglar build/ till FTP-servern med lftp.
# Uppgifter läses från .env.deploy (gitignorad). Se .env.deploy.example.
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f .env.deploy ] || { echo "Saknar .env.deploy – kopiera .env.deploy.example och fyll i." >&2; exit 1; }
# Läs KEY=value rad för rad utan att köra filen som skalskript, så att
# specialtecken i lösenordet (#, $, !, mellanslag …) tas bokstavligt.
while IFS= read -r line || [ -n "$line" ]; do
  case "$line" in ''|\#*) continue ;; esac
  key="${line%%=*}"; val="${line#*=}"
  case "$val" in \"*\") val="${val#\"}"; val="${val%\"}" ;; \'*\') val="${val#\'}"; val="${val%\'}" ;; esac
  export "$key=$val"
done < .env.deploy
: "${FTP_HOST:?}" "${FTP_USER:?}" "${FTP_PASS:?}" "${FTP_DIR:?}"
PROTO="${FTP_PROTOCOL:-ftps}"
command -v lftp >/dev/null || { echo "lftp saknas: brew install lftp" >&2; exit 1; }

if [ "${1:-}" != "--no-build" ]; then
  npm run build
fi

case "$PROTO" in
  ftps) URL="ftp://$FTP_HOST"; TLS="set ftp:ssl-force true; set ftp:ssl-protect-data true;" ;;
  ftp)  URL="ftp://$FTP_HOST"; TLS="set ftp:ssl-allow false;" ;;
  sftp) URL="sftp://$FTP_HOST"; TLS="" ;;
  *) echo "Okänt FTP_PROTOCOL: $PROTO" >&2; exit 1 ;;
esac

# --delete tar bort filer på servern som inte finns i build/ (inom FTP_DIR).
# Lägg till --dry-run som argument för att bara visa vad som skulle göras.
DRY=""; [ "${2:-${1:-}}" = "--dry-run" ] && DRY="--dry-run"

lftp -u "$FTP_USER","$FTP_PASS" "$URL" <<LFTP
$TLS
set net:max-retries 2
set net:timeout 30
mirror --reverse --delete --verbose --parallel=4 $DRY build "$FTP_DIR"
bye
LFTP

echo "Klart: build/ → $PROTO://$FTP_HOST$FTP_DIR"

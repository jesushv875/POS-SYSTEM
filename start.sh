#!/bin/bash
# Inicia el backend y ngrok juntos

NGROK_DOMAIN="nonharmonious-nonfictively-jesica.ngrok-free.dev"
BACKEND_PORT=5001

echo "🚀 Iniciando backend..."
cd "$(dirname "$0")/backend"
npm start &
BACKEND_PID=$!

sleep 2

echo "🌐 Iniciando ngrok en $NGROK_DOMAIN..."
ngrok http --domain=$NGROK_DOMAIN $BACKEND_PORT &
NGROK_PID=$!

echo ""
echo "✅ Todo corriendo:"
echo "   Backend local:  http://localhost:$BACKEND_PORT"
echo "   URL pública:    https://$NGROK_DOMAIN"
echo ""
echo "Presiona Ctrl+C para detener todo."

# Al presionar Ctrl+C cierra ambos procesos
trap "echo 'Deteniendo...'; kill $BACKEND_PID $NGROK_PID 2>/dev/null; exit" INT TERM
wait

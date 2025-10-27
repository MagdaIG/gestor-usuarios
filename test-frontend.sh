#!/bin/bash

echo "🚀 Probando el Frontend de Gestión de Usuarios y Roles"
echo "=================================================="

echo "✅ 1. Verificando que el servidor esté funcionando..."
if curl -s http://localhost:3001/api/health | grep -q "ok"; then
    echo "   ✅ Servidor funcionando correctamente"
else
    echo "   ❌ Servidor no responde"
    exit 1
fi

echo ""
echo "✅ 2. Verificando archivos estáticos..."
if curl -s -I http://localhost:3001/assets/js/ui.js | grep -q "200 OK"; then
    echo "   ✅ Archivos JavaScript se sirven correctamente"
else
    echo "   ❌ Error sirviendo archivos JavaScript"
fi

if curl -s -I http://localhost:3001/assets/css/styles.css | grep -q "200 OK"; then
    echo "   ✅ Archivos CSS se sirven correctamente"
else
    echo "   ❌ Error sirviendo archivos CSS"
fi

echo ""
echo "✅ 3. Verificando páginas HTML..."
pages=("index.html" "users.html" "user-detail.html" "roles.html")
for page in "${pages[@]}"; do
    if curl -s http://localhost:3001/$page | grep -q "<!DOCTYPE html"; then
        echo "   ✅ $page se sirve correctamente"
    else
        echo "   ❌ Error sirviendo $page"
    fi
done

echo ""
echo "✅ 4. Verificando API endpoints..."
if curl -s http://localhost:3001/api/roles | grep -q "success"; then
    echo "   ✅ API de roles funcionando"
else
    echo "   ❌ Error en API de roles"
fi

if curl -s http://localhost:3001/api/users | grep -q "success"; then
    echo "   ✅ API de usuarios funcionando"
else
    echo "   ❌ Error en API de usuarios"
fi

echo ""
echo "🎉 ¡Frontend completamente funcional!"
echo ""
echo "📱 Accede a las siguientes URLs:"
echo "   • Dashboard: http://localhost:3001/"
echo "   • Usuarios: http://localhost:3001/users.html"
echo "   • Roles: http://localhost:3001/roles.html"
echo "   • API: http://localhost:3001/api/"
echo ""
echo "💡 Si ves errores 404 en el navegador:"
echo "   1. Refresca la página (Ctrl+F5 o Cmd+Shift+R)"
echo "   2. Limpia la caché del navegador"
echo "   3. Abre las herramientas de desarrollador (F12) y verifica la consola"

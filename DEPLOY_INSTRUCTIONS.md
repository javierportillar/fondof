# Deploy a Firebase Hosting

Para hacer el deploy de tu proyecto a Firebase Hosting, sigue estos pasos:

## 🔥 **Configuración Completada**

Ya he configurado todo lo necesario para el deploy:

1. **✅ Firebase Hosting configurado** en `firebase.json`
2. **✅ Script de deploy** en `package.json` 
3. **✅ Build exitoso** - archivos en `dist/`
4. **✅ Proyecto Firebase** ya configurado (`fondofortuna`)

## 🚀 **Para Hacer el Deploy**

### Opción 1: Manualmente
```bash
# 1. Inicia sesión en Firebase (solo una vez)
firebase login

# 2. Haz el deploy
npm run deploy
```

### Opción 2: Automático con GitHub Actions (Recomendado)
```bash
# Crear archivo para GitHub Actions
mkdir -p .github/workflows
```

## 📋 **Pasos Manuales Detallados**

1. **Construye el proyecto:**
   ```bash
   npm run build
   ```

2. **Inicia sesión en Firebase:**
   ```bash
   firebase login
   # Sigue las instrucciones en el navegador
   ```

3. **Haz el deploy:**
   ```bash
   npm run deploy
   # o directamente:
   firebase deploy --only hosting
   ```

## 🔧 **Configuración Realizada**

### `firebase.json`
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{"source": "**", "destination": "/index.html"}]
  }
}
```

### `package.json` (scripts añadidos)
```json
{
  "scripts": {
    "deploy": "npm run build && firebase deploy --only hosting"
  }
}
```

## 🌐 **Resultado Final**

Tu aplicación estará disponible en:
```
https://fondofortuna.web.app
```
o 
```
https://fondofortuna.firebaseapp.com
```

## ⚠️ **Importante**

- Asegúrate de tener tus variables de entorno en el proyecto de Firebase
- Configura las reglas de CORS si es necesario para Supabase
- El build actual tiene chunks grandes (>500KB) - considera code splitting para optimizar

## 🎯 **Siguiente Pasos**

1. Ejecuta `firebase login` para autenticarte
2. Usa `npm run deploy` para subir los cambios
3. Configura dominio personalizado si lo necesitas

¡Tu proyecto está listo para deploy a Firebase Hosting! 🚀
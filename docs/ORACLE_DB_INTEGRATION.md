# Integración de la base de datos Oracle con Ueta Travel Access

Fecha: 2025-11-19

Este documento resume cómo la aplicación Next.js (`Ueta-Travel-Access`) se integra con Oracle Autonomous Database (ADB), qué pasos se siguieron en esta sesión para preparar la BD, y qué comandos puedes usar en una entrevista para demostrar la integración.

## Resumen ejecutivo

- Motor DB: Oracle Autonomous Database (ATP) en `sa-bogota-1`.
- Conexión: modo Thin de `node-oracledb` usando wallet (TCPS) con `tnsnames.ora` y `cwallet.sso`.
- Archivos del wallet desplegados en: `/home/opc/wallet` (en la VM).
- Variables de entorno usadas en la VM: `.env.production` y `.env.local` en `/home/opc/ueta-travel-access`.
- Migraciones ejecutadas: `scripts/01-create-tables.sql`, `scripts/02-insert-data.sql`.
- Seed (datos masivos): `scripts/seed-large-dataset.js` — insertó ~500 productos, 200 usuarios, 300 órdenes.

## Archivo wallet y TNS

- Wallet copiado: `/home/opc/Wallet_uetatraveldb.zip` y descomprimido en `/home/opc/wallet`.
- Contenido importante: `tnsnames.ora`, `cwallet.sso`, `sqlnet.ora`, `ojdbc.properties`.
- `TNS_ADMIN` apuntando a `/home/opc/wallet` (configurado en `.env.local`) para que `node-oracledb` encuentre `tnsnames.ora`.

## Variables de entorno clave

- NODE_ENV=production
- NEXT_PUBLIC_API_URL=http://149.130.188.231:3000
- DB_USER=ADMIN
- DB_PASSWORD=UetaTravel2025!
- DB_CONNECT_STRING=uetatraveldb_high    # tns alias (uso en run-migration / scripts)
- WALLET_LOCATION=/home/opc/wallet
- WALLET_PASSWORD=UetaTravel2025!
- TNS_ADMIN=/home/opc/wallet
- OCI_NAMESPACE, OCI_BUCKET_NAME, OCI_REGION — para Object Storage (opcional)

Los archivos `.env.production` y `.env.local` están en `/home/opc/ueta-travel-access`.

## Cómo se conecta la app (concepto)

1. `lib/db/oracledb.ts` configura `node-oracledb` en modo Thin usando las vars: `DB_USER`, `DB_PASSWORD`, `DB_CONNECT_STRING`, `WALLET_LOCATION`, `WALLET_PASSWORD`.
2. `TNS_ADMIN` hace que `tnsnames.ora` sea visible para la librería y así se pueden usar aliases como `uetatraveldb_high`.
3. Las queries se ejecutan a través de `lib/services/*` (por ejemplo `product.service.ts`) que llaman a `lib/db/oracledb.executeQuery`.

## Pasos que ejecuté (resumen reproducible)

1. Subir wallet al servidor via SCP y descomprimir:

```bash
scp -i /path/to/key Wallet_uetatraveldb.zip opc@149.130.188.231:/home/opc/
ssh -i /path/to/key opc@149.130.188.231
unzip -o /home/opc/Wallet_uetatraveldb.zip -d /home/opc/wallet
chown -R opc:opc /home/opc/wallet
chmod -R 700 /home/opc/wallet
chmod 600 /home/opc/wallet/cwallet.sso
```

2. Crear `.env.local` con `DB_CONNECT_STRING=uetatraveldb_high` y `TNS_ADMIN=/home/opc/wallet`.

3. Ejecutar migración (en la VM):

```bash
cd /home/opc/ueta-travel-access
npm ci --only=production
NODE_ENV=production node scripts/run-migration.js
```

4. Ejecutar seed masivo (insertó ~500 productos):

```bash
NODE_ENV=production node scripts/seed-large-dataset.js 500 200 300
```

5. Verificar conteos y filas (ejemplo):

```bash
NODE_ENV=production node scripts/query-summary.js
# o usar sqlcl / sqlplus si prefieres
```

6. Parche aplicado para la API (evita error 500): antes de devolver `products` en `app/api/products/route.ts` hacemos `JSON.parse(JSON.stringify(products))` para asegurarnos de devolver POJOs sin referencias circulares.

## Comandos útiles para la demo (copiar/pegar)

- Probar health:
```bash
curl -sS http://149.130.188.231:3000/api/health | jq .
```

- Probar productos (primeros):
```bash
curl -sS http://149.130.188.231:3000/api/products | jq '.data | .[0:10]'
```

- Consultas directas desde la VM (Node quick-check):
```bash
cd /home/opc/ueta-travel-access
NODE_ENV=production node scripts/dump-front-products.js
```

## Logs generados en la sesión

- `/home/opc/migration-*.log` : salida del `run-migration.js`.
- `/home/opc/seed-*.log` : salida del script de seed.

## Problemas comunes y soluciones rápidas

- Error `NJS-516: no configuration directory set or available to search for tnsnames.ora`:
  - Asegúrate de exportar `TNS_ADMIN` o incluir `TNS_ADMIN` en `.env.local` apuntando al wallet.

- Error `connectString cannot be empty`:
  - Define `DB_CONNECT_STRING` (valor: alias en `tnsnames.ora`, p. ej. `uetatraveldb_high`) o pasa connectString al getConnection.

- Error `Converting circular structure to JSON` al servir la API:
  - Asegúrate de devolver objetos POJO: aplica `JSON.parse(JSON.stringify(obj))` antes de NextResponse.json o transforma filas con `OUT_FORMAT_OBJECT` y mapea a tipos simples.

## Recomendaciones para la entrevista

1. Explica la elección de wallet + modo Thin: evita instalar Instant Client en contenedores y facilita TCPS.
2. Muestra la ruta del wallet, el `tnsnames.ora` y el alias `uetatraveldb_high`.
3. Ejecuta `curl /api/health` y `curl /api/products` para mostrar que la app sirve datos reales.
4. Muestra los scripts `scripts/run-migration.js` y `scripts/seed-large-dataset.js` (menciona que el seed generó 500 productos, 200 usuarios y 300 órdenes).
5. Prepara respuestas para preguntas sobre seguridad: dónde están los secretos, recomendación de moverlos a OCI Vault o GitHub Secrets y usar Instance Principals para Object Storage.

## Next steps opcionales

- Refactorizar `run-migration.js` para manejar bloques PL/SQL delimitados por `/` (actualmente algunos `END;` seguidos de `/` generaron ORA-00900 en splits simples).
- Configurar Instance Principals para Object Storage y probar `scripts/test-upload.js` desde la VM.
- Añadir backups automáticos y exportar un dump previo a cambios grandes.

---
Si quieres, puedo generar una versión corta en PPT o preparar 5 comandos y outputs listos para mostrar en la entrevista. ¿Quieres que lo haga ahora?

#!/bin/bash

DATABASE_URL="postgresql://postgres:Restaurante1@34.148.61.16:5432/restaurantedb"

echo "Creando tablas..."
psql "$DATABASE_URL" -f 01_create_tables.sql

echo "Insertando datos y consultando..."
psql "$DATABASE_URL" -f 02_seed_and_select.sql

echo "Eliminando tablas..."
psql "$DATABASE_URL" -f 03_drop_database.sql

echo "Proceso finalizado"
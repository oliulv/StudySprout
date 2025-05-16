# Alembic Migrations

This directory contains Alembic migration scripts for the database schema.

## Generating Migrations

After making changes to the SQLAlchemy models, create a new migration:

```bash
alembic revision --autogenerate -m "Description of changes"
```

## Applying Migrations

To apply all pending migrations:

```bash
alembic upgrade head
```

To apply migrations up to a specific revision:

```bash
alembic upgrade <revision_id>
```

## Rolling Back Migrations

To roll back the most recent migration:

```bash
alembic downgrade -1
```

To roll back to a specific revision:

```bash
alembic downgrade <revision_id>
```

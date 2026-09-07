# Woldeok Moneyverse — Guide Français

[← README principal](../README.md) · [Changelog](../docs/changelog/CHANGELOG.fr.md) · [Index](../docs/INDEX.md)

Woldeok Moneyverse est une plateforme d’économie virtuelle communautaire basée sur **Next.js, NestJS et PostgreSQL**. WLD, actions virtuelles, mini-jeux de casino et récompenses sont uniquement des données internes au service.

## Fonctionnalités
- métiers, tâches répétables et EXP;
- quêtes et progression;
- portefeuille WLD et registre comptable;
- boutique/inventaire;
- actions et entreprises virtuelles;
- banque, intérêts, crédit et obligations virtuelles;
- casino virtuel à résultat autoritaire côté serveur;
- outils d’administration et d’exploitation.

Les écritures économiques critiques passent par des fonctions PostgreSQL `SECURITY DEFINER` qui contrôlent l’acteur, les politiques, l’idempotence et la cohérence du registre.

Les montants WLD sont transportés comme chaînes d’entiers exactes afin d’éviter les pertes de précision JavaScript.

Casino: RTP de base 95 %, 10–200 WLD par partie, exposition quotidienne de 2 000 WLD et perte réalisée quotidienne de 1 000 WLD. Les limites personnelles peuvent être plus strictes.

Voir [l’index de documentation](../docs/INDEX.md).

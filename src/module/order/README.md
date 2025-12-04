# Module Order

Ce module implémente la création d'une commande en respectant les conventions suivantes :

## Architecture
- **Controller** : `createOrderController` reçoit la requête HTTP, instancie les dépendances et traduit les erreurs applicatives en codes HTTP.
- **Use case** : `CreateOrderUseCase` porte les règles métier (validation des produits, des bornes de prix) et crée l'entité `Order` via son constructeur pour garantir l'encapsulation (initialisation du statut et de la date de création).
- **Repository** : interface `CreateOrderRepository` et implémentation `CreateOrderTypeOrmRepository` pour persister l'entité via TypeORM.
- **Entité** : la classe `Order` centralise l'état métier (produits, prix total, statut, date de création) et fournit un constructeur unique pour contrôler son initialisation.

## Qualité et conventions
- **Validation en entrée** : le use case valide la liste des produits (1 à 5 identifiants numériques) et le prix total (nombre compris entre 2€ et 500€).
- **Gestion des erreurs** : les exceptions métier renvoyées par le use case sont converties en réponses HTTP 400 dans le contrôleur ; les erreurs inattendues renvoient une réponse 500 générique.
- **Encapsulation** : toute nouvelle commande est instanciée avec `new Order(productIds, totalPrice)` afin que le statut par défaut (`PENDING`) et la date de création soient fixés par l'entité.
- **Couche d'accès aux données** : le dépôt TypeORM n'expose qu'une méthode `save` afin de limiter les points d'entrée vers la base.

## Points d'extension
- Calculer automatiquement le prix total à partir des produits persistés pourra être ajouté dans le use case en réutilisant cette structure (validation, construction de l'entité, persistance via le repository).

# Aula sobre MongoDB

## Operadores

O MongoDB oferece uma variedade de operadores para realizar diversas operações em consultas, atualizações, projeções e agregações.

### Operadores de Comparação

- `$eq`: Igual a =
- `$ne`: Diferente de !=
- `$gt`: Maior que >
- `$gte`: Maior ou igual a >=
- `$lt`: Menor que <
- `$lte`: Menor ou igual a <=
- `$in`: Pertence a um conjunto in()
- `$nin`: Não pertence a um conjunto not in()

### Operadores Lógicos

- `$and`: Realiza a operação lógica "E" em uma lista de expressões
- `$or`: Realiza a operação lógica "OU" em uma lista de expressões
- `$not`: Inverte o resultado de uma expressão booleana
- `$nor`: Realiza a operação lógica "NEM" em uma lista de expressões

### Operadores de Elemento

- `$exists`: Verifica se um campo existe em um documento
- `$type`: Verifica o tipo de um valor de campo

### Operadores de Array

- `$elemMatch`: Correspondência de elementos em um array com base em múltiplas condições
- `$size`: Verifica o tamanho de um array

### Operadores de String

- `$regex`: Realiza correspondência de padrões usando expressões regulares
- `$text`: Realiza pesquisa de texto em campos de texto indexados

### Operadores de Atualização

- `$set`: Define um valor para um campo
- `$unset`: Remove um campo de um documento
- `$inc`: Incrementa um valor numérico
- `$push`: Adiciona um elemento a um array
- `$pull`: Remove elementos de um array com base em uma condição
- `$addToSet`: Adiciona um elemento a um array apenas se ele não estiver presente
- `$rename`: Renomeia um campo em um documento

## Aggregate

O método `aggregate()` do MongoDB permite realizar operações de agregação de dados semelhantes às encontradas no `SQL`. No entanto, o método `aggregate()` do MongoDB oferece maior flexibilidade, permitindo que os desenvolvedores criem operações de agregação sofisticadas que não são possíveis com o `SQL`.

### $match

O operador `$match` é um estágio de pipeline que filtra os documentos de entrada, passando apenas aqueles que correspondem a uma determinada condição para o próximo estágio do pipeline.

```sql
SELECT * FROM collection
WHERE <condição>
```

```js
db.collection.aggregate([
  { $match: { <condição> } }
])
```

#### Exemplo

```sql
SELECT * FROM collection
WHERE quantity >= 250
```

```js
db.collection.aggregate([{ $match: { quantity: { $gte: 250 } } }]);
```

### $project

O operador `$project` é um estágio de pipeline que remodela cada documento de entrada, incluindo, excluindo ou renomeando campos. Esse estágio é útil para limitar os campos de saída do pipeline, criar novos campos computados ou reorganizar os documentos.

```sql
SELECT campo1, campo2, ... FROM collection
```

```js
db.collection.aggregate([
  { $project: { <especificação> } }
])
```

#### Exemplo

```sql
SELECT item FROM collection
```

```js
db.collection.aggregate([{ $project: { item: 1 } }]);
```

### $addFields

O operador $addFields é usado para adicionar novos campos a um documento durante uma operação de agregação. Ele permite criar campos calculados ou modificar campos existentes com base em expressões.

```sql
SELECT *, expression AS new_field FROM collection
```

```js
db.collection.aggregate([{ $addFields: { new_field: expression } }]);
```

#### Exemplo

```sql
SELECT *, (price * quantity) AS total FROM products
```

```js
db.products.aggregate([{ $addFields: { total: { $multiply: ["$price", "$quantity"] } } }]);
```

### $group

O operador `$group` agrupa documentos com base em um campo específico e pode agregar os valores de vários campos nos documentos agrupados, assim como as funções `GROUP BY` e aggregate do `SQL`.

```sql
SELECT campo1, campo2, ..., aggregate_func(campo) FROM collection
GROUP BY campo
```

```js
db.collection.aggregate([
  { $group: { _id: <expression>, <field1>: { <accumulator1> : <expression1> }, ... } }
])
```

#### Exemplo

```sql
SELECT item, SUM(price * quantity) AS total FROM collection
GROUP BY item
```

```js
db.collection.aggregate([{ $group: { _id: "$item", total: { $sum: { $multiply: ["$price", "$quantity"] } } } }]);
```

### $sort

O operador `$sort` reordena os documentos de entrada com base nos campos e nos valores de ordem especificados. Para especificar a ordem de classificação, use 1 para ordem ascendente e -1 para ordem descendente.

```sql
SELECT * FROM collection
ORDER BY campo1 ASC, campo2 DESC, ...
```

```js
db.collection.aggregate([
  { $sort: { <campo1>: <ordem1>, <campo2>: <ordem2>, ... } }
])
```

#### Exemplo

```sql
SELECT * FROM collection
ORDER BY item ASC, quantity DESC
```

```js
db.collection.aggregate([{ $sort: { item: 1, quantity: -1 } }]);
```

### $limit

O operador `$limit` limita o número de documentos que passam pelo estágio de pipeline.

```sql
SELECT * FROM collection
LIMIT <número>
```

```js
db.collection.aggregate([
  { $limit: <número> }
])
```

#### Exemplo

```sql
SELECT * FROM orders
LIMIT 5
```

```js
db.orders.aggregate([{ $limit: 5 }]);
```

### $skip

O operador `$skip` é usado para pular um número específico de documentos em uma coleção durante a operação de agregação. Ele permite pular os primeiros N documentos e retornar os documentos restantes.

```sql
SELECT * FROM collection
OFFSET N
```

```js
db.collection.aggregate([{ $skip: N }]);
```

#### Exemplo

```sql
SELECT * FROM orders
OFFSET 10
```

```js
db.orders.aggregate([{ $skip: 10 }]);
```

### $unwind

O operador `$unwind` é usado para descontrair um campo de matriz em vários documentos, gerando um documento para cada elemento da matriz.

```js
db.collection.aggregate([{ $unwind: "$campo" }]);
```

#### Exemplo

```js
db.collection.aggregate([{ $unwind: "$items" }]);
```

### $lookup

O operador `$lookup` realiza uma operação de junção entre duas coleções no MongoDB. Ele permite combinar documentos de várias coleções com base em campos relacionados.

```sql
SELECT * FROM collection1
JOIN collection2 ON collection1.field = collection2.field
```

```js
db.collection1.aggregate([
  {
    $lookup: {
      from: "collection2",
      localField: "field",
      foreignField: "collection2.field",
      as: "joinedData",
    },
  },
]);
```

#### Exemplo

```sql
SELECT * FROM orders
JOIN customers ON orders.customerId = customers._id
```

```js
db.orders.aggregate([
  {
    $lookup: {
      from: "customers",
      localField: "customerId",
      foreignField: "customers._id",
      as: "customerData",
    },
  },
]);
```

### $group com $lookup

O operador `$group` pode ser usado em conjunto com o operador `$lookup` para realizar agregações em uma coleção após realizar uma junção com outra coleção.

```sql
SELECT collection1.field, aggregate_func(collection2.field) FROM collection1
JOIN collection2 ON collection1.field = collection2.field
GROUP BY collection1.field
```

```js
db.collection1.aggregate([
  {
    $lookup: {
      from: "collection2",
      localField: "field",
      foreignField: "collection2.field",
      as: "joinedData",
    },
  },
  {
    $group: {
      _id: "$field",
      aggregateField: { $aggregateFunc: "$joinedData.field" },
    },
  },
]);
```

#### Exemplo

```sql
SELECT orders.customerId, SUM(orderItems.price * orderItems.quantity) AS total FROM orders
JOIN orderItems ON orders._id = orderItems.orderId
GROUP BY orders.customerId
```

```js
db.orders.aggregate([
  {
    $lookup: {
      from: "orderItems",
      localField: "_id",
      foreignField: "orderId",
      as: "joinedData",
    },
  },
  {
    $group: {
      _id: "$customerId",
      total: { $sum: { $multiply: ["$joinedData.price", "$joinedData.quantity"] } },
    },
  },
]);
```

## Operadores de acumulação

### $sum

O operador `$sum` é usado para calcular a soma de valores de um campo numérico em documentos durante uma operação de agregação. Ele retorna a soma total dos valores encontrados.

#### Exemplo

```sql
SELECT SUM(quantity) AS total_quantity FROM collection
```

```js
db.collection.aggregate([{ $group: { _id: null, total_quantity: { $sum: "$quantity" } } }]);
```

### $avg

O operador `$sum` é usado para calcular a soma de valores de um campo numérico em documentos durante uma operação de agregação. Ele retorna a soma total dos valores encontrados.

#### Exemplo

```sql
SELECT AVG(price) AS average_price FROM collection
```

```js
db.collection.aggregate([{ $group: { _id: null, average_price: { $avg: "$price" } } }]);
```

### $min

O operador `$min` é usado para encontrar o valor mínimo de um campo numérico em documentos durante uma operação de agregação. Ele retorna o valor mínimo encontrado.

#### Exemplo

```sql
SELECT MIN(quantity) AS min_quantity FROM collection
```

```js
db.collection.aggregate([{ $group: { _id: null, min_quantity: { $min: "$quantity" } } }]);
```

### $max

O operador `$max` é usado para encontrar o valor máximo de um campo numérico em documentos durante uma operação de agregação. Ele retorna o valor máximo encontrado.

#### Exemplo

```sql
SELECT MAX(price) AS max_price FROM collection
```

```js
db.collection.aggregate([{ $group: { _id: null, max_price: { $max: "$price" } } }]);
```

### $count

O operador `$count` é usado para contar o número de documentos em uma coleção durante uma operação de agregação. Ele retorna o número total de documentos encontrados.

#### Exemplo

```sql
SELECT COUNT(*) AS total_documents FROM collection
```

```js
db.collection.aggregate([{ $count: "total_documents" }]);
```

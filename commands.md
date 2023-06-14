```js
[
  { $match: {
    "provider": "google"
  }
]
```

```js 
[
  { 
    $match: {
      "provider": "google"
    },
  },
  {
    $group: {
      _id: {provider: "$provider", type: "$type"},
      count: { $count: {} },
      provider: {$first: "$provider"},
      type: {$first: "$type"}
    }
  }
]
```

```js
db.reports.aggregate([
  { 
    $match: {
      "provider": "google"
    },
  },
  {
   $lookup: {
     from: "users",
     localField: "user_id",
     foreignField: "_id",
     as: "user"
   }
  }
])
```

```js
db.reports.aggregate([
  { 
    $match: {
      "provider": "google"
    },
  },
  {
   $lookup: {
     from: "users",
     localField: "user_id",
     foreignField: "_id",
     as: "user"
   }
  },
  {
    $unwind: { path: "$user"}
  }
])
```

```js
db.reports.aggregate([
  { 
    $match: {
      "provider": "google",
      "created_at": {
        $gte: ISODate('2023-05-01'),
        $lte: ISODate('2023-06-01')
      }
    },
  },
  {
    $group: {
      _id: {provider: "$provider", type: "$type"},
      count: { $count: {} },
      provider: {$first: "$provider"},
      type: {$first: "$type"}
    }
  }
])
```

```ts
import { writeFile } from "fs/promises";
import { Collection, MongoClient } from "mongodb";
import { join } from "path";

class ReportRepository {
  constructor(private readonly _collection: Collection) {}

  async getReport(input: { from: Date; to: Date; provider: string }) {
    return this._collection
      .aggregate([
        {
          $match: {
            provider: input.provider,
            created_at: { $gte: input.from, $lte: input.to },
          },
        },
        {
          $group: {
            _id: { provider: "$provider", type: "$type" },
            count: { $count: {} },
            provider: { $first: "$provider" },
            type: { $first: "$type" },
          },
        },
      ])
      .toArray();
  }
}

const client = new MongoClient("mongodb://root:root@localhost:27017");
const repository = new ReportRepository(client.db("aula").collection("reports"));

async function main() {
  const report = await repository.getReport({
    from: new Date("2023-05-01"),
    to: new Date("2023-06-01"),
    provider: "google",
  });

  await writeFile(join(__dirname, "report.json"), JSON.stringify(report));
}

main()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
```
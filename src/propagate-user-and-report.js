const { MongoClient, ObjectId } = require("mongodb");
const { faker } = require("@faker-js/faker"); // https://fakerjs.dev

const client = new MongoClient("mongodb://root:root@localhost:27017");

const type = new Set(["unknown", "suspend", "reactivate", "subscribe", "unsubscribe", "billing"]);
const providers = new Map([
    ["google", ["play-store-plus", "play-store-lite", "youtube-plus", "youtube-lite"]],
    ["apple", ["apple-store-plus", "apple-store-lite", "apple-music-plus", "apple-music-lite"]],
    ["spotify", ["spotify-plus", "spotify-lite", "spotify-family"]],
    ["netflix", ["netflix-plus", "netflix-lite", "netflix-family"]],
]);

function makeUser() {
    const registerWithEmail = faker.datatype.boolean();

    return {
        _id: new ObjectId(),
        name: faker.person.fullName(),
        email: registerWithEmail ? faker.internet.email() : null,
        phone_number: registerWithEmail ? null : faker.phone.number("+55###########"),
        birth_date: faker.date.past({ min: 14, max: 65 }),
        created_at: faker.date.past({ min: 0, max: 3 }),
        updated_at: faker.date.past({ min: 0, max: 3 }),
        address: {
            street: faker.location.street(),
            number: faker.number.int({ min: 1, max: 1000 }).toString(),
            city: faker.location.city(),
            state: faker.location.state(),
            country: faker.location.country(),
            zip_code: faker.location.zipCode(),
        },
    };
}

function makeReport(user) {
    const provider = faker.helpers.arrayElement([...providers.keys()]);
    const serviceId = faker.helpers.arrayElement(providers.get(provider));

    return {
        _id: new ObjectId(),
        user_id: user._id,
        provider: provider,
        service_id: serviceId,
        subscription_id: faker.string.uuid(),
        created_at: faker.date.past({ min: 0, max: 3 }),
        updated_at: faker.date.past({ min: 0, max: 3 }),
        email: user.email,
        phone_number: user.phone_number,
        type: faker.helpers.arrayElement([...type]),
    };
}

(async () => {
    await client.connect();

    const db = client.db("aula");

    const bulkUser = db.collection("users").initializeUnorderedBulkOp();
    const bulkReport = db.collection("reports").initializeUnorderedBulkOp();

    for (let i = 0; i < 500_000; i++) {
        const user = makeUser();

        for (let i = 0; i < faker.number.int({ min: 0, max: 10 }); i++) {
            bulkReport.insert(makeReport(user));
        }

        bulkUser.insert(user);
    }

    await bulkUser.execute();
    await bulkReport.execute();
})();

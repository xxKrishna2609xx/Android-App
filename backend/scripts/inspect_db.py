import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os, json
from bson import ObjectId

load_dotenv()

client = AsyncIOMotorClient(os.getenv('MONGO_URI'))
db = client[os.getenv('DATABASE_NAME', 'nearlly_db')]

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return super().default(o)

async def main():
    cats = await db.categories.find().to_list(1000)
    subs = await db.subcategories.find().to_list(1000)
    
    print(f"\n=== CATEGORIES ({len(cats)}) ===")
    for c in cats:
        c['_id'] = str(c['_id'])
        print(f"  id={c.get('id','N/A')} | _id={c['_id']} | name={c.get('name')}")
    
    print(f"\n=== SUBCATEGORIES ({len(subs)}) ===")
    for s in subs:
        s['_id'] = str(s['_id'])
        print(f"  id={s.get('id','N/A')} | _id={s['_id']} | name={s.get('name')} | categoryId={s.get('categoryId')}")
    
    client.close()

asyncio.run(main())

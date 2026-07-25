"""
Generates exactly 100 properties for prisma/seed-data/properties.json:
  - 40 flats  (type: residential, propertySubType: "flat")
  - 30 land   (type: land, propertySubType: "land")
  - 30 plots  (type: land, propertySubType: "plot")

Run with:

    python3 prisma/seed-data/generate_properties.py

This OVERWRITES properties.json with a fresh, deterministic (seeded) batch.
"""
import json
import random
from pathlib import Path

random.seed(42)

HERE = Path(__file__).parent
OUT = HERE / "properties.json"

AGENTS = ["u-agent-1", "u-agent-2"]

# Areas across Dhaka & Narayanganj
AREAS = [
    ("Dhanmondi", "Dhaka", "1209", 23.7461, 90.3742),
    ("Gulshan", "Dhaka", "1212", 23.7925, 90.4078),
    ("Banani", "Dhaka", "1213", 23.7937, 90.4066),
    ("Uttara", "Dhaka", "1230", 23.8759, 90.3795),
    ("Mirpur", "Dhaka", "1216", 23.8223, 90.3654),
    ("Bashundhara", "Dhaka", "1229", 23.8151, 90.4340),
    ("Mohammadpur", "Dhaka", "1207", 23.7656, 90.3588),
    ("Sonargaon", "Narayanganj", "1440", 23.6489, 90.6018),
    ("Fatullah", "Narayanganj", "1421", 23.6389, 90.5019),
    ("Bandar", "Narayanganj", "1410", 23.6136, 90.5169),
    ("Siddhirganj", "Narayanganj", "1430", 23.6667, 90.5089),
    ("Rupganj", "Narayanganj", "1460", 23.7500, 90.5333),
    ("Savar", "Dhaka", "1340", 23.8583, 90.2667),
    ("Keraniganj", "Dhaka", "1310", 23.6939, 90.3833),
]

FLAT_IMAGES = [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80",
    "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=1200&q=80",
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80",
]

LAND_IMAGES = [
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80",
    "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1200&q=80",
]

PLOT_IMAGES = [
    "https://images.unsplash.com/photo-1464082354059-27db6ce50048?w=1200&q=80",
    "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1200&q=80",
]

FACINGS = ["north", "south", "east", "west", "north-east", "north-west", "south-east", "south-west"]
LAND_USE = ["residential", "commercial", "agricultural"]
STREETS = ["Road", "Lane", "Avenue", "Block", "Sector", "Plot Road", "Housing Estate Road"]


def rand_address(area):
    return f"House {random.randint(1, 60)}, {random.choice(STREETS)} {random.randint(1, 27)}, {area}"


def make_flat(i, agent_idx):
    area, city, zip_code, lat, lng = random.choice(AREAS)
    beds = random.choice([1, 2, 2, 3, 3, 4])
    baths = max(1, beds - random.choice([0, 1]))
    sqft = random.randint(650, 2600)
    purpose = random.choice(["rent", "sale"])
    price = random.randint(12000, 90000) if purpose == "rent" else random.randint(2_500_000, 25_000_000)
    return {
        "propertyId": f"p-{1000 + i}",
        "title": f"{random.choice(['Cozy', 'Spacious', 'Modern', 'Elegant', 'Charming', 'Sunlit'])} {beds}-Bed Flat in {area}",
        "description": f"A well-maintained {beds}-bedroom, {baths}-bathroom flat in {area}, {city}, offering {sqft} sqft of living space with easy access to schools, markets and main roads.",
        "type": "residential",
        "purpose": purpose,
        "price": price,
        "squareFeet": sqft,
        "parkingSpace": random.choice([0, 1, 1, 2]),
        "address": rand_address(area),
        "city": city,
        "state": f"{city} Division" if city == "Dhaka" else "Dhaka Division",
        "zipCode": zip_code,
        "latitude": round(lat + random.uniform(-0.01, 0.01), 6),
        "longitude": round(lng + random.uniform(-0.01, 0.01), 6),
        "images": [random.choice(FLAT_IMAGES)],
        "amenities": {
            "parkingSpace": random.choice([0, 1, 2]),
            "furnished": random.choice([True, False]),
            "petFriendly": random.choice([True, False]),
            "pool": random.random() < 0.1,
            "gym": random.random() < 0.15,
            "security": random.random() < 0.7,
            "elevator": random.random() < 0.4,
            "internet": random.random() < 0.8,
        },
        "status": "available",
        "agentId": AGENTS[agent_idx % 2],
        "createdAt": "2025-01-15T09:00:00.000Z",
        "updatedAt": "2025-01-15T09:00:00.000Z",
        "yearBuilt": random.randint(2005, 2024),
        "taxRate": round(random.uniform(4, 8), 1),
        "bedrooms": beds,
        "bathrooms": baths,
        "propertySubType": "flat",
        "hasGarden": random.random() < 0.2,
    }


def make_land_or_plot(i, agent_idx, sub_type):
    area, city, zip_code, lat, lng = random.choice(AREAS)
    sqft = random.randint(1600, 8000) if sub_type == "land" else random.randint(360, 1600)
    purpose = "sale"
    price = int(sqft * random.uniform(2500, 9000))
    label = "Land" if sub_type == "land" else "Plot"
    return {
        "propertyId": f"p-{1000 + i}",
        "title": f"{sqft} sqft {label} for Sale in {area}",
        "description": f"A {random.choice(FACINGS)}-facing {label.lower()} of {sqft} sqft in {area}, {city}, ideal for {random.choice(LAND_USE)} use with clear title and utility connections nearby.",
        "type": "land",
        "purpose": purpose,
        "price": price,
        "squareFeet": sqft,
        "parkingSpace": 0,
        "address": rand_address(area),
        "city": city,
        "state": f"{city} Division" if city == "Dhaka" else "Dhaka Division",
        "zipCode": zip_code,
        "latitude": round(lat + random.uniform(-0.015, 0.015), 6),
        "longitude": round(lng + random.uniform(-0.015, 0.015), 6),
        "images": [random.choice(LAND_IMAGES if sub_type == "land" else PLOT_IMAGES)],
        "amenities": {
            "parkingSpace": 0,
            "furnished": False,
            "petFriendly": False,
            "pool": False,
            "gym": False,
            "security": random.random() < 0.3,
            "elevator": False,
            "internet": False,
        },
        "status": "available",
        "agentId": AGENTS[agent_idx % 2],
        "createdAt": "2025-01-15T09:00:00.000Z",
        "updatedAt": "2025-01-15T09:00:00.000Z",
        "yearBuilt": 2024,
        "taxRate": round(random.uniform(2, 5), 1),
        "propertySubType": sub_type,
        "facing": random.choice(FACINGS),
        "roadWidthFt": random.choice([12, 16, 20, 24, 30, 40]),
        "landUseType": random.choice(LAND_USE),
    }


def main():
    properties = []
    counter = 0
    for _ in range(40):
        properties.append(make_flat(counter, counter))
        counter += 1
    for _ in range(30):
        properties.append(make_land_or_plot(counter, counter, "land"))
        counter += 1
    for _ in range(30):
        properties.append(make_land_or_plot(counter, counter, "plot"))
        counter += 1

    OUT.write_text(json.dumps(properties, indent=2) + "\n")
    print(f"Wrote {len(properties)} properties (40 flat / 30 land / 30 plot) to {OUT}")


if __name__ == "__main__":
    main()

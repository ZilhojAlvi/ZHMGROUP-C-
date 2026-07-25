/**
 * Development seed script.
 *
 * This is NOT wired into any login flow or authentication bypass — it
 * simply inserts real rows into the database via Prisma, with passwords
 * hashed through the same bcrypt path used by the real signup API. Run it
 * manually when you want sample data to develop/demo against:
 *
 *   npm run db:seed
 *
 * Do NOT run this against a production database unless you intend to
 * create these specific test accounts. Feel free to delete this file if
 * you don't want any seed data at all.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import properties from "./seed-data/properties.json";
import tools from "./seed-data/tools.json";

const prisma = new PrismaClient();

const SEED_USERS = [
  {
    id: "u-admin-1",
    email: "admin@srems.dev",
    password: "Admin@12345",
    role: "admin" as const,
    fname: "Nadia",
    lname: "Rahman",
    phone: "+880 1711-000001",
    department: "Platform Operations",
  },
  {
    id: "u-agent-1",
    email: "tariq.agent@srems.dev",
    password: "Agent@12345",
    role: "agent" as const,
    fname: "Tariq",
    lname: "Islam",
    phone: "+880 1711-000002",
    licenceNumber: "AG-DHK-4471",
    agency: "Prime Realty Group",
    verificationStatus: "verified" as const,
    rating: 4.8,
  },
  {
    id: "u-agent-2",
    email: "farhana.agent@srems.dev",
    password: "Agent@12345",
    role: "agent" as const,
    fname: "Farhana",
    lname: "Chowdhury",
    phone: "+880 1711-000003",
    licenceNumber: "AG-DHK-5820",
    agency: "Skyline Properties",
    verificationStatus: "pending" as const,
    rating: 4.2,
  },
  {
    id: "u-cust-1",
    email: "imran.customer@srems.dev",
    password: "Customer@12345",
    role: "customer" as const,
    fname: "Imran",
    lname: "Hossain",
    phone: "+880 1711-000004",
  },
];

async function main() {
  console.log("Seeding database...");

  for (const u of SEED_USERS) {
    const passwordHash = await bcrypt.hash(u.password, 12);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        id: u.id,
        email: u.email,
        passwordHash,
        role: u.role,
        isActive: true,
        isEmailVerified: true, // seeded accounts are pre-verified for convenience
        profile: {
          create: {
            fname: u.fname,
            lname: u.lname,
            phone: u.phone,
            ...(u.role === "agent"
              ? {
                  licenceNumber: u.licenceNumber,
                  agency: u.agency,
                  verificationStatus: u.verificationStatus,
                  rating: u.rating,
                  propertiesListed: 0,
                }
              : {}),
            ...(u.role === "admin" ? { department: u.department } : {}),
          },
        },
      },
    });
    console.log(`  user: ${u.email} (password: ${u.password})`);
  }

  for (const p of properties as Record<string, unknown>[]) {
    const amenities = p.amenities as Record<string, unknown>;
    await prisma.property.upsert({
      where: { id: p.propertyId as string },
      update: {},
      create: {
        id: p.propertyId as string,
        title: p.title as string,
        description: p.description as string,
        type: p.type as "residential" | "commercial" | "land",
        purpose: p.purpose as "sale" | "rent",
        price: p.price as number,
        squareFeet: p.squareFeet as number,
        parkingSpace: (amenities.parkingSpace as number) ?? 0,
        address: p.address as string,
        city: p.city as string,
        state: p.state as string,
        zipCode: p.zipCode as string,
        latitude: p.latitude as number,
        longitude: p.longitude as number,
        images: p.images as string[],
        status: p.status as "available" | "booked" | "under_review" | "sold" | "inactive",
        yearBuilt: p.yearBuilt as number,
        taxRate: p.taxRate as number,
        furnished: Boolean(amenities.furnished),
        petFriendly: Boolean(amenities.petFriendly),
        pool: Boolean(amenities.pool),
        gym: Boolean(amenities.gym),
        security: Boolean(amenities.security),
        elevator: Boolean(amenities.elevator),
        internet: Boolean(amenities.internet),
        bedrooms: p.bedrooms as number | undefined,
        bathrooms: p.bathrooms as number | undefined,
        hasGarden: p.hasGarden as boolean | undefined,
        floors: p.floors as number | undefined,
        officeRooms: p.officeRooms as number | undefined,
        zoningType: p.zoningType as string | undefined,
        loadingDock: p.loadingDock as boolean | undefined,
        facing: p.facing as string | undefined,
        roadWidthFt: p.roadWidthFt as number | undefined,
        landUseType: p.landUseType as string | undefined,
        propertySubType: p.propertySubType as string,
        agentId: p.agentId as string,
      },
    });
  }
  console.log(`  ${properties.length} properties seeded`);

  for (const t of tools as { toolId: string; toolName: string; category: string; workingRate: number; availability: boolean }[]) {
    await prisma.maintenanceTool.upsert({
      where: { id: t.toolId },
      update: {},
      create: {
        id: t.toolId,
        toolName: t.toolName,
        category: t.category,
        workingRate: t.workingRate,
        availability: t.availability,
      },
    });
  }
  console.log(`  ${tools.length} maintenance tools seeded`);

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

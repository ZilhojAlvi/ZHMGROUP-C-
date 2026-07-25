import {
  CommercialProperty,
  LandProperty,
  Property,
  ResidentialProperty,
} from "@/types";

/**
 * ITaxable - contract for anything that can compute a tax liability.
 */
export interface ITaxable {
  calculateTax(): number;
}

/**
 * Abstract base class mirroring the PropertyBase entity.
 * Residential/Commercial subclasses add domain-specific fields & behaviour.
 */
export abstract class PropertyModel implements ITaxable {
  public readonly propertyId: string;
  public title: string;
  public price: number;
  public squareFeet: number;
  public parkingSpace: number;
  public taxRate: number;
  public status: string;

  constructor(data: Property) {
    this.propertyId = data.propertyId;
    this.title = data.title;
    this.price = data.price;
    this.squareFeet = data.squareFeet;
    this.parkingSpace = data.parkingSpace;
    this.taxRate = data.taxRate;
    this.status = data.status;
  }

  /** Base tax = price * taxRate%. Subclasses apply additional modifiers. */
  calculateTax(): number {
    return Math.round(this.price * (this.taxRate / 100) * 100) / 100;
  }

  abstract get category(): "residential" | "commercial" | "land";
  abstract get displaySummary(): string;
}

/**
 * ResidentialPropertyModel - homes, apartments, villas...
 * Residential tax gets a small homeowner relief discount.
 */
export class ResidentialPropertyModel extends PropertyModel {
  public bedrooms: number;
  public bathrooms: number;
  public propertySubType: ResidentialProperty["propertySubType"];

  constructor(data: ResidentialProperty) {
    super(data);
    this.bedrooms = data.bedrooms;
    this.bathrooms = data.bathrooms;
    this.propertySubType = data.propertySubType;
  }

  get category(): "residential" {
    return "residential";
  }

  /** Residential properties receive a 10% relief on the base tax rate. */
  calculateTax(): number {
    const base = super.calculateTax();
    const relief = base * 0.1;
    return Math.round((base - relief) * 100) / 100;
  }

  get displaySummary(): string {
    return `${this.bedrooms} bed · ${this.bathrooms} bath · ${this.squareFeet.toLocaleString()} sqft`;
  }
}

/**
 * CommercialPropertyModel - offices, retail, warehouses...
 * Commercial tax has an added levy for zoning/utility load.
 */
export class CommercialPropertyModel extends PropertyModel {
  public floors: number;
  public officeRooms: number;
  public propertySubType: CommercialProperty["propertySubType"];
  public zoningType: string;

  constructor(data: CommercialProperty) {
    super(data);
    this.floors = data.floors;
    this.officeRooms = data.officeRooms;
    this.propertySubType = data.propertySubType;
    this.zoningType = data.zoningType;
  }

  get category(): "commercial" {
    return "commercial";
  }

  /** Commercial properties carry an extra 5% commercial levy. */
  calculateTax(): number {
    const base = super.calculateTax();
    const levy = base * 0.05;
    return Math.round((base + levy) * 100) / 100;
  }

  get displaySummary(): string {
    return `${this.floors} floor(s) · ${this.officeRooms} rooms · ${this.squareFeet.toLocaleString()} sqft`;
  }
}

/**
 * LandPropertyModel - vacant land & subdivided plots.
 * Land carries no structure levy/relief — flat base tax applies.
 */
export class LandPropertyModel extends PropertyModel {
  public propertySubType: LandProperty["propertySubType"];
  public facing: LandProperty["facing"];
  public roadWidthFt: number;
  public landUseType: LandProperty["landUseType"];

  constructor(data: LandProperty) {
    super(data);
    this.propertySubType = data.propertySubType;
    this.facing = data.facing;
    this.roadWidthFt = data.roadWidthFt;
    this.landUseType = data.landUseType;
  }

  get category(): "land" {
    return "land";
  }

  get displaySummary(): string {
    const label = this.propertySubType === "plot" ? "Plot" : "Land";
    return `${label} · ${this.squareFeet.toLocaleString()} sqft · ${this.facing}-facing · ${this.roadWidthFt}ft road`;
  }
}

/** Factory: builds the correct polymorphic subclass instance from a plain record. */
export function createPropertyModel(data: Property): PropertyModel {
  if (data.type === "residential") {
    return new ResidentialPropertyModel(data);
  }
  if (data.type === "land") {
    return new LandPropertyModel(data as LandProperty);
  }
  return new CommercialPropertyModel(data as CommercialProperty);
}

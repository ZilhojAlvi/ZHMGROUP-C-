"use client";

import { FormEvent, useEffect, useState } from "react";
import { Property, PropertyType, ListingPurpose } from "@/types";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CITIES } from "@/utils/constants";
import { validateNumberRange, validateRequired } from "@/utils/validators";

export interface PropertyFormValues {
  title: string;
  description: string;
  type: PropertyType;
  purpose: ListingPurpose;
  price: number;
  squareFeet: number;
  parkingSpace: number;
  address: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  floors: number;
  officeRooms: number;
  facing: string;
  roadWidthFt: number;
  landUseType: string;
  taxRate: number;
  imageUrl: string;
}

const DEFAULT_VALUES: PropertyFormValues = {
  title: "",
  description: "",
  type: "residential",
  purpose: "rent",
  price: 0,
  squareFeet: 0,
  parkingSpace: 0,
  address: "",
  city: "Dhaka",
  bedrooms: 1,
  bathrooms: 1,
  floors: 1,
  officeRooms: 1,
  facing: "north",
  roadWidthFt: 20,
  landUseType: "residential",
  taxRate: 6,
  imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80",
};

export function PropertyForm({
  initial,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  initial?: Property | null;
  onSubmit: (values: PropertyFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}) {
  const [values, setValues] = useState<PropertyFormValues>(DEFAULT_VALUES);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initial) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValues({
        title: initial.title,
        description: initial.description,
        type: initial.type,
        purpose: initial.purpose,
        price: initial.price,
        squareFeet: initial.squareFeet,
        parkingSpace: initial.parkingSpace,
        address: initial.address,
        city: initial.city,
        bedrooms: initial.type === "residential" ? initial.bedrooms : 1,
        bathrooms: initial.type === "residential" ? initial.bathrooms : 1,
        floors: initial.type === "commercial" ? initial.floors : 1,
        officeRooms: initial.type === "commercial" ? initial.officeRooms : 1,
        facing: initial.type === "land" ? initial.facing : "north",
        roadWidthFt: initial.type === "land" ? initial.roadWidthFt : 20,
        landUseType: initial.type === "land" ? initial.landUseType : "residential",
        taxRate: initial.taxRate,
        imageUrl: initial.images[0] ?? DEFAULT_VALUES.imageUrl,
      });
    } else {
      setValues(DEFAULT_VALUES);
    }
  }, [initial]);

  const update = (patch: Partial<PropertyFormValues>) => setValues((v) => ({ ...v, ...patch }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    const titleCheck = validateRequired(values.title, "Title");
    if (!titleCheck.valid) newErrors.title = titleCheck.message!;
    const addressCheck = validateRequired(values.address, "Address");
    if (!addressCheck.valid) newErrors.address = addressCheck.message!;
    const priceCheck = validateNumberRange(values.price, 1, 1_000_000_000, "Price");
    if (!priceCheck.valid) newErrors.price = priceCheck.message!;
    const sqftCheck = validateNumberRange(values.squareFeet, 50, 200_000, "Square feet");
    if (!sqftCheck.valid) newErrors.squareFeet = sqftCheck.message!;
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        required
        value={values.title}
        error={errors.title}
        onChange={(e) => update({ title: e.target.value })}
        placeholder="e.g. Riverside Modern Apartment"
      />
      <Textarea
        label="Description"
        rows={3}
        value={values.description}
        onChange={(e) => update({ description: e.target.value })}
        placeholder="Describe the property's key features..."
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Type"
          value={values.type}
          onChange={(e) => update({ type: e.target.value as PropertyType })}
          options={[
            { label: "Residential", value: "residential" },
            { label: "Commercial", value: "commercial" },
            { label: "Land / Plot", value: "land" },
          ]}
        />
        <Select
          label="Purpose"
          value={values.purpose}
          onChange={(e) => update({ purpose: e.target.value as ListingPurpose })}
          options={[
            { label: "For rent", value: "rent" },
            { label: "For sale", value: "sale" },
          ]}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Price (BDT)"
          type="number"
          required
          value={values.price || ""}
          error={errors.price}
          onChange={(e) => update({ price: Number(e.target.value) })}
        />
        <Input
          label="Square feet"
          type="number"
          required
          value={values.squareFeet || ""}
          error={errors.squareFeet}
          onChange={(e) => update({ squareFeet: Number(e.target.value) })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Address" required value={values.address} error={errors.address} onChange={(e) => update({ address: e.target.value })} />
        <Select
          label="City"
          value={values.city}
          onChange={(e) => update({ city: e.target.value })}
          options={CITIES.map((c) => ({ label: c, value: c }))}
        />
      </div>

      {values.type === "residential" && (
        <div className="grid grid-cols-3 gap-4">
          <Input label="Bedrooms" type="number" value={values.bedrooms} onChange={(e) => update({ bedrooms: Number(e.target.value) })} />
          <Input label="Bathrooms" type="number" value={values.bathrooms} onChange={(e) => update({ bathrooms: Number(e.target.value) })} />
          <Input label="Parking" type="number" value={values.parkingSpace} onChange={(e) => update({ parkingSpace: Number(e.target.value) })} />
        </div>
      )}
      {values.type === "commercial" && (
        <div className="grid grid-cols-3 gap-4">
          <Input label="Floors" type="number" value={values.floors} onChange={(e) => update({ floors: Number(e.target.value) })} />
          <Input label="Rooms" type="number" value={values.officeRooms} onChange={(e) => update({ officeRooms: Number(e.target.value) })} />
          <Input label="Parking" type="number" value={values.parkingSpace} onChange={(e) => update({ parkingSpace: Number(e.target.value) })} />
        </div>
      )}
      {values.type === "land" && (
        <div className="grid grid-cols-3 gap-4">
          <Select
            label="Facing"
            value={values.facing}
            onChange={(e) => update({ facing: e.target.value })}
            options={["north", "south", "east", "west", "north-east", "north-west", "south-east", "south-west"].map((f) => ({ label: f, value: f }))}
          />
          <Input label="Road width (ft)" type="number" value={values.roadWidthFt} onChange={(e) => update({ roadWidthFt: Number(e.target.value) })} />
          <Select
            label="Land use"
            value={values.landUseType}
            onChange={(e) => update({ landUseType: e.target.value })}
            options={[
              { label: "Residential", value: "residential" },
              { label: "Commercial", value: "commercial" },
              { label: "Agricultural", value: "agricultural" },
            ]}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Tax rate (%)"
          type="number"
          step="0.1"
          value={values.taxRate}
          onChange={(e) => update({ taxRate: Number(e.target.value) })}
          hint="Used to compute the property's estimated tax."
        />
        <Input
          label="Image URL"
          value={values.imageUrl}
          onChange={(e) => update({ imageUrl: e.target.value })}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {initial ? "Save changes" : "Add property"}
        </Button>
      </div>
    </form>
  );
}

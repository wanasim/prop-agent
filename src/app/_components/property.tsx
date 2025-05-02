"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { api } from "~/trpc/react";
import { createProperty } from "../_action";

const SubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
    >
      {pending ? "Submitting..." : "Submit"}
    </button>
  );
};

export function LatestProperty() {
  const [latestProperty] = api.property.getLatest.useSuspenseQuery();
  const { data: allProperties } = api.property.getAllProperties.useQuery();

  const utils = api.useUtils();

  return (
    <div className="w-full max-w-xs">
      {latestProperty ? (
        <p className="truncate">Your most recent property: {latestProperty.name}</p>
      ) : (
        <p>You have no property yet.</p>
      )}
      {allProperties?.length && <h2>List of All Properties</h2>}{" "}
      {allProperties?.map((property) => (
        <p key={property.id}>{property.name}</p>
      ))}
      <form
        className="flex flex-col gap-2"
        action={async (formData) => {
          const name = formData.get("name") as string;
          await createProperty({ name });
          await utils.property.invalidate();
        }}
      >
        <input
          type="text"
          placeholder="Title"
          name="name"
          required
          className="w-full rounded-full bg-white/10 px-4 py-2 text-white"
        />
        <SubmitButton />
      </form>
    </div>
  );
}

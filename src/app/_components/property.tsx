"use client";

import { useState } from "react";

import { api } from "~/trpc/react";

export function LatestProperty() {
  const [latestProperty] = api.property.getLatest.useSuspenseQuery();
  const { data: allProperties } = api.property.getAllProperties.useQuery();

  const utils = api.useUtils();
  const [name, setName] = useState("");
  const createProperty = api.property.create.useMutation({
    onSuccess: async () => {
      await utils.property.invalidate();
      setName("");
    },
  });

  return (
    <div className="w-full max-w-xs">
      {latestProperty ? (
        <p className="truncate">Your most recent property: {latestProperty.name}</p>
      ) : (
        <p>You have no property yet.</p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createProperty.mutate({ name });
        }}
        className="flex flex-col gap-2"
      >
        <input
          type="text"
          placeholder="Title"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-full bg-white/10 px-4 py-2 text-white"
        />
        <button
          type="submit"
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          disabled={createProperty.isPending}
        >
          {createProperty.isPending ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { createFormHook, createFormHookContexts, useForm, useStore } from "@tanstack/react-form";
import { TableProperties } from "lucide-react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api } from "~/trpc/react";

const metaSchema = z.object({
  submitAction: z.enum(["next", "previous", "finish"]).nullable(),
});

const formSchema = z.object({
  userType: z.enum(["OWNER", "TENANT"]).optional(),
  properties: z.array(z.object({ name: z.string() })).optional(),
  selectedProperty: z.number().optional(),
  currentStep: z.number().default(0),
});

const { fieldContext, formContext, useFormContext, useFieldContext } = createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldComponents: {
    Input,
    RadioGroup,
  },
  formComponents: {
    ActionsButtons,
  },
  fieldContext,
  formContext,
});

type FormMeta = {
  submitAction: "next" | "previous" | "finish" | null;
  currentStep: number;
};

export default function OnboardingPage() {
  const { mutate: updateUserType } = api.user.update.useMutation({
    onSuccess: () => {
      redirect("/dashboard");
    },
  });

  const form = useAppForm({
    defaultValues: formSchema.parse({
      userType: undefined,
      properties: [{ name: "" }],
      selectedProperty: undefined,
      currentStep: 0,
    }),
    onSubmitMeta: metaSchema.parse({
      submitAction: null,
    }),

    onSubmit: async ({ value, meta }) => {
      if (meta.submitAction === "next") {
        form.setFieldValue("currentStep", value.currentStep + 1);
      } else if (meta.submitAction === "previous") {
        form.setFieldValue("currentStep", value.currentStep - 1);
      } else if (meta.submitAction === "finish") {
        updateUserType({
          userType: value.userType as "OWNER" | "TENANT",
          properties: value.properties,
          selectedProperty: value.selectedProperty as number,
        });
      }
    },
  });

  const totalSteps = 2;
  const { data: properties } = api.property.getAllProperties.useQuery();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-[400px] max-w-[90vw]">
        <CardHeader>
          <CardTitle>Welcome to Prop Agent</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="space-y-6"
          >
            <form.Subscribe
              selector={(state) => ({
                userType: state.values.userType,
                currentStep: state.values.currentStep,
              })}
            >
              {({ userType, currentStep }) => (
                <>
                  {currentStep === 0 && (
                    <form.Field
                      name="userType"
                      validators={{
                        onChange: ({ value }) => {
                          if (currentStep === 0) {
                            if (!value) {
                              return "Please select a user type";
                            }
                          }
                          return undefined;
                        },
                      }}
                    >
                      {(field) => (
                        <div className="space-y-4">
                          <Label>Select your user type</Label>
                          <RadioGroup
                            value={field.state.value}
                            onValueChange={(value) =>
                              field.handleChange(value as "OWNER" | "TENANT")
                            }
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="OWNER" id="owner" />
                              <Label htmlFor="owner">Property Owner</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="TENANT" id="tenant" />
                              <Label htmlFor="tenant">Tenant</Label>
                            </div>
                          </RadioGroup>
                          {field.state.meta.errors && (
                            <p className="text-red-500 text-sm">
                              {field.state.meta.errors.join(", ")}
                            </p>
                          )}
                        </div>
                      )}
                    </form.Field>
                  )}

                  {currentStep === 1 && userType === "OWNER" && (
                    <form.Field name="properties" mode="array">
                      {(field) => (
                        <div className="space-y-4">
                          <Label>Add your properties</Label>
                          {field.state.value?.map((property: { name: string }, index: number) => (
                            <div
                              key={`property-${index}-${property.name}`}
                              className="flex flex-col gap-2"
                            >
                              <form.Field
                                name={`properties[${index}].name`}
                                validators={{
                                  onBlur: ({ value: property }) => {
                                    /** might not neeed to ref usertype again here */
                                    if (currentStep === 1 && userType === "OWNER") {
                                      if (!property?.length) {
                                        console.log(
                                          "MUST HAVE A NAME and currentStep",
                                          currentStep,
                                        );
                                        return "Must have a name";
                                      }
                                    }
                                    return undefined;
                                  },
                                }}
                              >
                                {(nameField) => (
                                  <div className="flex flex-col gap-1">
                                    <div className="flex gap-2">
                                      <Input
                                        onBlur={() => nameField.handleBlur()}
                                        value={nameField.state.value}
                                        onChange={(e) => nameField.handleChange(e.target.value)}
                                        placeholder="Property name"
                                      />
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={() => field.removeValue(index)}
                                      >
                                        Remove
                                      </Button>
                                    </div>
                                    <div>
                                      {nameField.state.meta.errors && (
                                        <p className="text-red-500 text-sm">
                                          {nameField.state.meta.errors.join(", ")}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </form.Field>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => field.pushValue({ name: "" })}
                          >
                            Add Another Property
                          </Button>
                        </div>
                      )}
                    </form.Field>
                  )}

                  {currentStep === 1 && userType === "TENANT" && (
                    <form.Field
                      name="selectedProperty"
                      validators={{
                        onChange: ({ value }) => {
                          if (currentStep === 1) {
                            if (!value) {
                              return "Please select a property";
                            }
                          }
                          return undefined;
                        },
                      }}
                    >
                      {(field) => (
                        <div className="space-y-4">
                          <Label>Select a property to rent:</Label>
                          <Select
                            value={String(field.state.value)}
                            onValueChange={(value) => field.handleChange(Number(value))}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a property" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Properties</SelectLabel>
                                {properties?.map((property) => (
                                  <SelectItem key={property.id} value={String(property.id)}>
                                    <div className="flex flex-col">
                                      <span className="font-medium">{property.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        ID: {property.id}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          {field.state.meta.errors && (
                            <p className="text-red-500 text-sm">
                              {field.state.meta.errors.join(", ")}
                            </p>
                          )}
                        </div>
                      )}
                    </form.Field>
                  )}
                </>
              )}
            </form.Subscribe>

            <div className="flex justify-between">
              <form.AppForm>
                <ActionsButtons />
              </form.AppForm>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center gap-2">
          <form.Subscribe
            selector={(state) => ({
              currentStep: state.values.currentStep,
            })}
          >
            {({ currentStep }) => (
              <>
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <button
                    key={`step-${index + 1}`}
                    type="button"
                    className={`h-2 w-2 rounded-full transition-colors ${
                      currentStep === index ? "bg-primary" : "bg-muted"
                    }`}
                    aria-label={`Go to step ${index + 1}`}
                  />
                ))}
                <div>{form.state.errors}</div>
              </>
            )}
          </form.Subscribe>
        </CardFooter>
      </Card>
    </div>
  );
}

export function ActionsButtons() {
  const form = useFormContext();

  return (
    <form.Subscribe
      selector={(state) => ({
        isSubmitting: state.isSubmitting,
        currentStep: state.values.currentStep as unknown as number,
        userType: state.values.userType as unknown as string,
      })}
    >
      {({ isSubmitting, currentStep, userType }) => (
        <div className="flex w-full justify-between">
          {currentStep !== 0 && (
            <Button
              disabled={isSubmitting}
              type="button"
              variant="outline"
              onClick={() => {
                form.setFieldValue("currentStep" as never, (currentStep - 1) as never);
                // form.handleSubmit({ submitAction: "previous" });
              }}
            >
              Previous
            </Button>
          )}
          <div className="flex-1" /> {/* Spacer */}
          <Button
            disabled={isSubmitting || !userType}
            type="submit"
            onClick={() => {
              currentStep < 1
                ? form.setFieldValue("currentStep" as never, (currentStep + 1) as never)
                : form.handleSubmit({ submitAction: "finish" });
            }}
          >
            {currentStep < 1 ? "Next" : "Finish"}
          </Button>
        </div>
      )}
    </form.Subscribe>
  );
}

"use client";

import { createFormHook, createFormHookContexts, useForm, useStore } from "@tanstack/react-form";
import { signIn } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { api } from "~/trpc/react";

const metaSchema = z.object({
  submitAction: z.enum(["next", "previous", "finish"]).nullable(),
});

const formSchema = z.object({
  userType: z.enum(["OWNER", "TENANT"]).optional(),
  properties: z.array(z.object({ name: z.string() })),
  selectedProperty: z.number().optional(),
  currentStep: z.number(),
});

const { fieldContext, formContext, useFormContext } = createFormHookContexts();

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

export default function OnboardingPage() {
  // /** move this inside onsubmit handler in useappform */
  const { mutate: updateUserType } = api.user.update.useMutation({
    onSuccess: () => {
      redirect("/");
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
      console.log("onsubmitvalue", value, meta);
      switch (meta.submitAction) {
        case "next":
          form.setFieldValue("currentStep", form.getFieldValue("currentStep") + 1);
          break;
        case "previous":
          form.setFieldValue("currentStep", form.getFieldValue("currentStep") - 1);
          break;
        case "finish":
          console.log("submit");
          // handle submit and redirect to dashboard
          updateUserType({
            userType: value.userType as "OWNER" | "TENANT",
            properties: value.properties,
            selectedProperty: value.selectedProperty as number,
          });
          break;
        default:
          console.error("Invalid submit action", meta.submitAction);
          break;
      }
    },
  });

  const totalSteps = 3;

  const { data: properties } = api.property.getAllProperties.useQuery();

  // /** move this inside onsubmit handler in useappform */
  // const { mutate: createProperty } = api.property.create.useMutation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Welcome to Prop Agent</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="space-y-6"
          >
            <form.Subscribe
              selector={(state) => ({
                currentStep: state.values.currentStep,
                userType: state.values.userType,
              })}
            >
              {({ currentStep, userType }) => (
                <>
                  {currentStep === 0 && (
                    <form.Field
                      name="userType"
                      validators={{
                        onChange: ({ value }) => {
                          if (!value && currentStep === 0) {
                            return "Please select a user type";
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
                          {field.state.value.map((property: { name: string }, index: number) => (
                            <div
                              key={`property-${index}-${property.name}`}
                              className="flex flex-col gap-2"
                            >
                              <form.Field
                                name={`properties[${index}].name`}
                                validators={{
                                  onChange: ({ value: property }) => {
                                    if (currentStep === 1 && userType === "OWNER") {
                                      if (!property.length) {
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
                          console.log("value for selectedProperty", value);
                          // Only validate if we're on step 1
                          if (currentStep === 1 && userType === "TENANT") {
                            const result = z.string().safeParse(value);
                            if (!result.success) {
                              return "Please select a property";
                            }
                          }
                          return undefined;
                        },
                      }}
                    >
                      {(field) => (
                        <div className="space-y-4">
                          <Label>Select a property</Label>

                          <RadioGroup
                            value={String(field.state.value)}
                            onValueChange={(value) => field.handleChange(Number(value))}
                          >
                            {properties?.map((property) => (
                              <div key={property.id} className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value={String(property.id)}
                                  id={String(property.id)}
                                />
                                <Label htmlFor={String(property.id)}>{property.name}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      )}
                    </form.Field>
                  )}
                </>
              )}
            </form.Subscribe>

            <div className="flex justify-between">
              <form.AppForm>
                <form.ActionsButtons />
              </form.AppForm>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center gap-2">
          <form.Subscribe selector={(state) => state.values.currentStep}>
            {(currentStep) => (
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
              </>
            )}
          </form.Subscribe>
        </CardFooter>
      </Card>
    </div>
  );
}

export function ActionsButtons({ label }: { label?: string }) {
  const form = useFormContext();

  return (
    <form.Subscribe
      selector={(state) => ({
        isSubmitting: state.isSubmitting,
        userType: state.values.userType,
        currentStep: state.values.currentStep,
      })}
    >
      {({ isSubmitting, currentStep }) => (
        <>
          {currentStep !== 0 && (
            <Button
              disabled={isSubmitting}
              type="submit"
              onClick={() => {
                console.log("previous button");
                form.handleSubmit({ submitAction: "previous" });
              }}
            >
              Previous
            </Button>
          )}
          <Button
            disabled={isSubmitting}
            type="submit"
            onClick={() => {
              console.log("nexting");
              (currentStep as unknown as number) < 2
                ? form.handleSubmit({ submitAction: "next" })
                : form.handleSubmit({ submitAction: "finish" });
            }}
          >
            {currentStep}
            {(currentStep as unknown as number) < 2 ? "Next" : "Finish"}
          </Button>
        </>
      )}
    </form.Subscribe>
  );
}

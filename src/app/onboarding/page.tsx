"use client";

import { createFormHook, createFormHookContexts, useForm, useStore } from "@tanstack/react-form";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { api } from "~/trpc/react";

type FormMeta = {
  submitAction: "next" | "previous" | "finish" | null;
};

const defaultMeta: FormMeta = {
  submitAction: null,
};

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
  const form = useAppForm({
    defaultValues: {
      userType: undefined as "OWNER" | "TENANT" | undefined,
      properties: [{ name: "" }],
      selectedProperty: undefined as string | undefined,
      currentStep: 0,
    },
    onSubmitMeta: defaultMeta,
    onSubmit: async ({ value, meta }) => {
      console.log("value on submit", value);
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
          break;
        default:
          console.log("default");
          console.error("Invalid submit action", meta.submitAction);
          break;
      }
    },
  });

  const totalSteps = 3;

  const { data: properties } = api.property.getAllProperties.useQuery();

  /** move this inside onsubmit handler in useappform */
  const { mutate: updateUserType } = api.user.update.useMutation({
    onSuccess: () => {
      const currentStep = form.getFieldValue("currentStep");
      if (currentStep < totalSteps - 1) {
        form.setFieldValue("currentStep", currentStep + 1);
      }
    },
  });

  /** move this inside onsubmit handler in useappform */
  const { mutate: createProperty } = api.property.create.useMutation();

  const addProperty = () => {
    const properties = form.getFieldValue("properties") || [];
    form.setFieldValue("properties", [...properties, { name: "" }]);
  };

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
            <form.Subscribe selector={(state) => state.values.currentStep}>
              {(currentStep) => (
                <>
                  {console.log("currentStep new value!!!", currentStep)}
                  {currentStep === 0 && (
                    <form.Field
                      name="userType"
                      validators={{
                        onChange: ({ value }) => {
                          if (!value) {
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
                            <p className="text-sm text-red-500">
                              {field.state.meta.errors.join(", ")}
                            </p>
                          )}
                        </div>
                      )}
                    </form.Field>
                  )}

                  {currentStep === 1 && form.getFieldValue("userType") === "OWNER" && (
                    <form.Field name="properties">
                      {(field) => (
                        <div className="space-y-4">
                          <Label>Add your properties</Label>
                          {field.state.value.map((property: { name: string }, index: number) => (
                            <div key={`property-${index}-${property.name}`} className="flex gap-2">
                              <form.Field name={`properties[${index}].name`}>
                                {(nameField) => (
                                  <Input
                                    value={nameField.state.value}
                                    onChange={(e) => nameField.handleChange(e.target.value)}
                                    placeholder="Property name"
                                  />
                                )}
                              </form.Field>
                            </div>
                          ))}
                          <Button type="button" variant="outline" onClick={addProperty}>
                            Add Another Property
                          </Button>
                        </div>
                      )}
                    </form.Field>
                  )}

                  {currentStep === 1 && form.getFieldValue("userType") === "TENANT" && (
                    <form.Field name="selectedProperty">
                      {(field) => (
                        <div className="space-y-4">
                          <Label>Select a property</Label>
                          <RadioGroup value={field.state.value} onValueChange={field.handleChange}>
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

  const firstName = useStore(form.store, (state) => state.values.firstName);
  const { userType, properties, selectedProperty, currentStep } = form.state.values;
  console.log("currentStep!@#s", currentStep);
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

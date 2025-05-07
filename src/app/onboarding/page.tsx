"use client";

import {  useState } from "react";
import { z } from "zod";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";
import { useForm } from "@tanstack/react-form";
import { signIn } from "next-auth/react";

const formSchema = z.object({
  userType: z.enum(["OWNER", "TENANT"]),
  properties: z.array(z.object({
    name: z.string().min(1, "Property name is required")
  })).optional(),
  selectedProperty: z.string().optional()
});

type FormData = z.infer<typeof formSchema>;



export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 3;


  const { data: properties } = api.property.getAllProperties.useQuery();

  const { mutate: updateUserType } = api.user.update.useMutation({
    onSuccess: () => {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(prev => prev + 1);
      }
    }
  });

  const { mutate: createProperty } = api.property.create.useMutation();

  const form = useForm({
    defaultValues: {
      userType: undefined as "OWNER" | "TENANT" | undefined,
      properties: [{ name: "" }],
      selectedProperty: undefined as string | undefined
    },
    onSubmit: async ({ value }) => {
      if (currentStep === totalSteps - 1) {
        // Handle final submission
        if (value.userType === "OWNER") {
          // Create properties
          await Promise.all(
            value.properties?.map(property => 
              createProperty({ name: property.name })
            ) ?? []
          );
        } else if (value.userType === "TENANT") {
          // Handle tenant property selection
          // TODO: Add tenant property assignment logic
          console.log("Selected property:", value.selectedProperty);
        }
        // Complete the sign-in process
        // await signIn();
      } else {
        // Handle intermediate steps
        if (currentStep === 0 && value.userType) {
          await updateUserType({ userType: value.userType });
        }
        // Move to next step
        setCurrentStep(prev => prev + 1);
      }
    }
  });

  const isStepValid = (values: Partial<FormData>) => {
    console.log("values", values);
    switch (currentStep) {
      case 0:
        return !!values.userType;
      case 1:
        if (values.userType === "OWNER") {
          return values.properties?.every((p: { name: string }) => p.name.length > 0);
        }
        return true;
      case 2:
        if (values.userType === "TENANT") {
          return !!values.selectedProperty;
        }
        return true;
      default:
        return false;
    }
  };

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
          <form onSubmit={form.handleSubmit} className="space-y-6">
            {currentStep === 0 && (
              <div className="space-y-4">
                <Label>Select your user type</Label>
                <RadioGroup
                  onValueChange={(value) => form.setFieldValue("userType", value as "OWNER" | "TENANT")}
                  defaultValue={form.getFieldValue("userType")}
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
              </div>
            )}

            {currentStep === 1 && form.getFieldValue("userType") === "OWNER" && (
              <div className="space-y-4">
                <Label>Add your properties</Label>
                {form.getFieldValue("properties")?.map((_: any, index: number) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={form.getFieldValue(`properties[${index}].name`)}
                      onChange={(e) => form.setFieldValue(`properties[${index}].name`, e.target.value)}
                      placeholder="Property name"
                    />
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addProperty}>
                  Add Another Property
                </Button>
              </div>
            )}

            {currentStep === 2 && form.getFieldValue("userType") === "TENANT" && (
              <div className="space-y-4">
                <Label>Select a property</Label>
                <RadioGroup
                  onValueChange={(value) => form.setFieldValue("selectedProperty", value)}
                  defaultValue={form.getFieldValue("selectedProperty")}
                >
                  {properties?.map((property) => (
                    <div key={property.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={String(property.id)} id={String(property.id)} />
                      <Label htmlFor={String(property.id)}>{property.name}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(prev => prev - 1)}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              <Button
                type="submit"
                disabled={!isStepValid(form.state.values)}
              >
                {currentStep === totalSteps - 1 ? "Complete Setup" : "Next Step"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center gap-2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`h-2 w-2 rounded-full transition-colors ${
                currentStep === index ? "bg-primary" : "bg-muted"
              }`}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </CardFooter>
      </Card>
    </div>
  );
}
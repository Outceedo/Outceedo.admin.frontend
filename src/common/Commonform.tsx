import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import React from "react";
import { useState } from "react";

interface FormControl {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  componentType: "input" | "select" | "textarea";
  options?: { id: string; label: string }[];
}

interface CommonFormProps {
  formControls: FormControl[];
  formData: { [key: string]: string };
  setFormData: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  buttonText?: string;
  isBtnDisabled?: boolean;
  onCancel?: () => void;
}

function CommonForm({
  formControls,
  formData,
  setFormData,
  onSubmit,
  buttonText,
  isBtnDisabled,
  onCancel,
}: CommonFormProps) {
  function renderInputsByComponentType(getControlItem: FormControl) {
    let element = null;
    const value = formData[getControlItem.name] || "";

    switch (getControlItem.componentType) {
      case "input":
        element = (
          <Input
            name={getControlItem.name}
            placeholder={getControlItem.placeholder}
            id={getControlItem.name}
            type={getControlItem.type}
            value={value}
            onChange={(event) =>
              setFormData({
                ...formData,
                [getControlItem.name]: event.target.value,
              })
            }
            className={`p-2 border rounded-md dark:bg-slate-600 dark:text-white ${
              errors[getControlItem.name] ? "border-red-500" : ""
            }`}
          />
        );
        break;

      case "select":
        element = (
          <Select
            onValueChange={(value) =>
              setFormData({
                ...formData,
                [getControlItem.name]: value,
              })
            }
            value={value}
          >
            <SelectTrigger className="w-full p-2 border rounded-md dark:bg-slate-600 dark:text-white">
              <SelectValue placeholder={getControlItem.label} />
            </SelectTrigger>
            <SelectContent>
              {getControlItem.options?.map((optionItem) => (
                <SelectItem key={optionItem.id} value={optionItem.id}>
                  {optionItem.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        break;

      case "textarea":
        element = (
          <Textarea
            name={getControlItem.name}
            placeholder={getControlItem.placeholder}
            id={getControlItem.name}
            value={value}
            onChange={(event) =>
              setFormData({
                ...formData,
                [getControlItem.name]: event.target.value,
              })
            }
            className={`p-2 border rounded-md dark:bg-slate-600 dark:text-white ${
              errors[getControlItem.name] ? "border-red-500" : ""
            }`}
          />
        );
        break;

      default:
        element = (
          <Input
            name={getControlItem.name}
            placeholder={getControlItem.placeholder}
            id={getControlItem.name}
            type={getControlItem.type}
            value={value}
            onChange={(event) =>
              setFormData({
                ...formData,
                [getControlItem.name]: event.target.value,
              })
            }
            className={`p-2 border rounded-md dark:bg-slate-600 dark:text-white ${
              errors[getControlItem.name] ? "border-red-500" : ""
            }`}
          />
        );
        break;
    }

    return element;
  }
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const handleInternalSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: { [key: string]: boolean } = {};
    formControls.forEach((control) => {
      if (!formData[control.name]?.trim()) {
        newErrors[control.name] = true;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit(e); // only submit if no errors
    }
  };
  return (
    <form onSubmit={handleInternalSubmit} className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {formControls.map((controlItem) => (
          <div
            className="grid gap-1.5 col-span-1 md:col-span-1"
            key={controlItem.name}
          >
            <Label className="font-medium text-sm text-gray-700 dark:text-gray-200">
              {controlItem.label}
            </Label>
            {renderInputsByComponentType(controlItem)}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            onCancel?.(); // this calls parent clear logic
            setErrors({}); // <-- clear validation errors
          }}
          className="text-gray-600 bg-gray-100 hover:bg-gray-200"
        >
          Cancel
        </Button>
        <Button
          disabled={isBtnDisabled}
          type="submit"
          className="bg-[#FF323B] text-white dark:hover:bg-red-600 hover:bg-red-600"
        >
          {buttonText || "Submit"}
        </Button>
      </div>
    </form>
  );
}

export default CommonForm;

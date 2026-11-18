import type { FieldValues, Path, UseFormReturn } from "react-hook-form"

import { ApiError } from "@/lib/api/client"

function formFieldForApiField<T extends FieldValues>(
  apiField: string,
  formValues: T,
  formFieldForRenamedApiField: Record<string, Path<T>>,
): Path<T> | undefined {
  const renamedFormField = formFieldForRenamedApiField[apiField]
  if (renamedFormField) return renamedFormField

  const formHasSameNamedField = apiField in formValues
  if (formHasSameNamedField) return apiField as Path<T>

  return undefined
}

export function setFieldErrorsFromApi<T extends FieldValues>(
  form: UseFormReturn<T>,
  error: Error,
  formFieldForRenamedApiField: Record<string, Path<T>> = {},
) {
  if (!(error instanceof ApiError)) return
  const formValues = form.getValues()
  for (const { field, message } of error.fieldIssues) {
    const formField = formFieldForApiField(
      field,
      formValues,
      formFieldForRenamedApiField,
    )
    if (formField) form.setError(formField, { type: "server", message })
  }
}

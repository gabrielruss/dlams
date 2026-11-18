import { describe, expect, it } from "vitest"

import { fieldIssuesFromValidationErrors } from "./fieldIssues"

describe("fieldIssuesFromValidationErrors", () => {
  it("writes its own text for each validation error type", () => {
    expect(
      fieldIssuesFromValidationErrors([
        {
          type: "string_too_long",
          loc: ["body", "name"],
          msg: "String should have at most 200 characters",
          ctx: { max_length: 200 },
        },
        {
          type: "string_too_short",
          loc: ["body", "username"],
          msg: "String should have at least 4 characters",
          ctx: { min_length: 4 },
        },
        {
          type: "string_too_short",
          loc: ["body", "console_label"],
          msg: "String should have at least 1 character",
          ctx: { min_length: 1 },
        },
        {
          type: "missing",
          loc: ["body", "invitation_code"],
          msg: "Field required",
        },
        {
          type: "enum",
          loc: ["body", "condition"],
          msg: "Input should be 'Loose', 'CIB', 'New' or 'Item & Box'",
        },
        {
          type: "date_from_datetime_parsing",
          loc: ["body", "last_played"],
          msg: "Input should be a valid date",
        },
      ]),
    ).toEqual([
      { field: "name", message: "Must be 200 characters or fewer" },
      { field: "username", message: "Must be at least 4 characters" },
      { field: "console_label", message: "This field is required" },
      { field: "invitation_code", message: "This field is required" },
      { field: "condition", message: "Choose one of the listed options" },
      { field: "last_played", message: "Enter a valid date" },
    ])
  })

  it("keeps our own validator's message without Pydantic's prefix", () => {
    expect(
      fieldIssuesFromValidationErrors([
        {
          type: "value_error",
          loc: ["body", "last_played"],
          msg: "Value error, Last played can't be in the future",
        },
      ]),
    ).toEqual([
      { field: "last_played", message: "Last played can't be in the future" },
    ])
  })

  it("drops errors it has no text for or that are not on a body field", () => {
    expect(
      fieldIssuesFromValidationErrors([
        {
          type: "extra_forbidden",
          loc: ["body", "extra"],
          msg: "Extra inputs are not permitted",
        },
        {
          type: "int_parsing",
          loc: ["path", "collection_id"],
          msg: "Input should be a valid integer",
        },
        { type: "missing", loc: ["body"], msg: "Field required" },
      ]),
    ).toEqual([])
  })
})

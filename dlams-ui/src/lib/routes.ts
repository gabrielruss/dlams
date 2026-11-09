import { generatePath } from "react-router-dom"

export const routes = {
  home: "/",
  login: "/login",
  register: "/register",
  adminUsers: "/admin/users",
  sharedCollection: "/s/:token",
} as const

export const sharedCollectionPath = (token: string) =>
  generatePath(routes.sharedCollection, { token })

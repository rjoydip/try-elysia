import { t } from "elysia";

const userObject = t.Object({
  id: t.String(),
  name: t.String(),
  email: t.String(),
  emailVerified: t.Optional(t.Boolean()),
  image: t.Optional(t.String()),
});

export const createUser = t.Object({
  name: t.String(),
  email: t.String(),
  image: t.Optional(t.String()),
});

export const updateUser = t.Object({
  name: t.Optional(t.String()),
  email: t.Optional(t.String()),
  image: t.Optional(t.String()),
});

export const deleteUser = t.Object({
  id: t.String(),
});

export const paginationQuery = t.Object({
  limit: t.Optional(t.Number()),
  offset: t.Optional(t.Number()),
});

export { userObject };

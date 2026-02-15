import { t } from "elysia";

export const getUsers = t.Array(
  t.Object({
    id: t.String(),
    name: t.String(),
    email: t.String(),
    emailVerified: t.Boolean(),
    image: t.String(),
  }),
);

export const getUser = t.Object({
  id: t.String(),
  name: t.String(),
  email: t.String(),
  emailVerified: t.Boolean(),
  image: t.String(),
});

export const createUser = t.Object({
  name: t.String(),
  email: t.String(),
  emailVerified: t.Boolean(),
  image: t.String(),
});

export const updateUser = t.Object({
  id: t.String(),
  payload: t.Object({
    name: t.String(),
    email: t.String(),
    image: t.String(),
  }),
});
export const deleteUser = t.Object({
  id: t.String(),
});

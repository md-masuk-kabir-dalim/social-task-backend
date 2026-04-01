## 🛠️ Prisma Database Management

### Generating the Prisma Client

To generate the Prisma client from your schema:

```bash
npx prisma generate --schema=./prisma/schema
```

### Pushing Schema Changes

To push the schema changes to the database:

```bash
npx prisma db push --schema=./prisma/schema
```

To open the Prisma Studio, you can run:

```bash
npx prisma studio --schema=./prisma/schema
```

### Running Migrations ( only for mysql)

To run migrations for MySQL, you can use the following command:

```bash
npx prisma migrate dev --schema=./prisma/schema
```

To format the Prisma schema file, you can use:

```bash 
npx prisma format --schema=./prisma/schema
```



# before production 
# 1. path: app/middlewares/csrfProtection.ts
export const validateCsrf = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token =
    (req.headers["x-csrf-token"] as string) || req.cookies[CSRF_COOKIE_NAME];
  const sessionId = req.cookies["SESSION-ID"];
  // if (!token || !sessionId || !verifyCsrfToken(token, sessionId)) {
  //   res.status(403).json({ success: false, message: "Invalid CSRF token" });
  //   return;
  // }

  next();
};
Production: Uncomment these lines to enforce CSRF protection.

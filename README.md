# Next Auth Static
Next.js Static Auth is a comprehensive TypeScript library for managing authentication and authorization in Next.js static exported projects

- can be used on the client side, anywhere
## Features

- **User Authentication**: Implement secure user registration, login, and logout functionality.
- **Token Management**: Securely handle JWT tokens for authentication.
- **Session Handling**: Manage user sessions
- **Static Site Integration**: Seamlessly works with Next.js static site generation.

## Installation

```bash
npm install next auth static
```


## Usage

In layout.tsx

```js
"use client";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthConfig, AuthProvider } from "next-auth-static";
import AuthProviderComponent from "./authProvider";
const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
      const authConfig: AuthConfig = {
    tokenType: "Bearer",
    tokenKeys: {
      accessToken: "access_token",
    },
  };
  return (
    <html lang="en">
      <body className={inter.className}>
      <AuthProvider config={authConfig}>{children}</AuthProvider>;
      </body>
    </html>
  );
}

```

user sign in:

```js
"use client";
import { useAuth } from "next-auth-static";
import React, { useState } from "react";

const LoginPage = () => {
  const { signIn} = useAuth();

  const handleLogin = async () => {
    try {
      const response = await fetch("example-login-endpoint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        await signIn({
          accessToken: data.token,
          user: {
            name: "test",
            email: "test",
          },
        });

      } else {
        alert(`Login failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred while trying to log in.");
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default LoginPage;

```

signout:

```js
  const {signOut } = useAuth();

 <button onClick={() => signOut().then(() => alert("Logged out"))}>
        logout
      </button>
```

get current sessions:

```js
  const {currentSession } = useAuth();

    const { user = {} } = currentSession || {};
     if (user) {
      console.log("user", user);
    }
```



## API

### useAuth()

Returns an object with the following methods and properties:

#### signIn(accessToken: string, options?: SignInOptions): Promise<void>

Signs in a user.

- `accessToken`: The user's access token
- `options`: Optional object containing additional sign-in data
  - `user`: Object containing user data

#### signOut(): Promise<void>

Signs out the current user.

#### currentSession: { user?: User } | null

The current user session, if any.
## License

MIT

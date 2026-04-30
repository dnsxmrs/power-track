# [1.7.0-beta.4](https://github.com/dnsxmrs/power-track/compare/v1.7.0-beta.3...v1.7.0-beta.4) (2026-04-30)


### Features

* **validation:** update phone number validation logic in AddUserModal and createUserAccount ([2a07423](https://github.com/dnsxmrs/power-track/commit/2a07423afb8f1d1d04841ec4189088d3ed7c625b))

# [1.7.0-beta.3](https://github.com/dnsxmrs/power-track/compare/v1.7.0-beta.2...v1.7.0-beta.3) (2026-04-30)


### Features

* **users:** enhance user management with improved data handling and new user attributes ([97f6580](https://github.com/dnsxmrs/power-track/commit/97f6580a523c3397697fb788a6cbddb303bdc056))

# [1.7.0-beta.2](https://github.com/dnsxmrs/power-track/compare/v1.7.0-beta.1...v1.7.0-beta.2) (2026-04-30)


### Features

* **validation:** enhance user input validation for name, email, and phone number in AddUserModal and createUserAccount ([ff459c3](https://github.com/dnsxmrs/power-track/commit/ff459c338aea0252da39dca9c3fa9a3cdb489d12))

# [1.7.0-beta.1](https://github.com/dnsxmrs/power-track/compare/v1.6.0...v1.7.0-beta.1) (2026-04-30)


### Features

* **notification:** add user creation success/error notifications ([095b063](https://github.com/dnsxmrs/power-track/commit/095b0634bda97736800f3f0f2b2cdc106e41a159))

# [1.6.0](https://github.com/dnsxmrs/power-track/compare/v1.5.0...v1.6.0) (2026-04-30)


### Features

* **user:** standardize user roles to 'admin' and 'user' in AddUserModal and user creation ([dfb9dc0](https://github.com/dnsxmrs/power-track/commit/dfb9dc0ec74d4214daca71d0485df7c777a50718))

# [1.5.0](https://github.com/dnsxmrs/power-track/compare/v1.4.0...v1.5.0) (2026-04-30)


### Features

* add user management functionality with AddUserModal and user list page ([008aff1](https://github.com/dnsxmrs/power-track/commit/008aff1f154f1f4ee8c2c4777fd9cda9c0f1188f))
* **AddUserModal:** enhance layout and styling for user form with responsive design ([f8d7648](https://github.com/dnsxmrs/power-track/commit/f8d7648b11f249e94fbed14fafc5ef15faf431e2))
* **AddUserModal:** replace password fields with phone number input and validation ([a3c6677](https://github.com/dnsxmrs/power-track/commit/a3c667770b1c3b01bf4e829d693527a4cec18f52))
* remove backup files for AddUserModal and UsersPage components ([138066e](https://github.com/dnsxmrs/power-track/commit/138066e10e8937d04ae1037e32c749377809b7c7))
* **user:** add phoneNumber field to User model ([a0af8b7](https://github.com/dnsxmrs/power-track/commit/a0af8b71c4868724e94208d1a88ff59f93c46427))
* **user:** implement user account creation and email notification ([a43add4](https://github.com/dnsxmrs/power-track/commit/a43add421eeecb894235f1f7a0f38f1ff6630c89))

# [1.4.0](https://github.com/dnsxmrs/power-track/compare/v1.3.0...v1.4.0) (2026-04-29)


### Features

* **auth:** integrate Better Auth Expo support and adjust origin handling for mobile clients ([3e39755](https://github.com/dnsxmrs/power-track/commit/3e39755a2cf832ec1f567ee0572c65d8bc04ccc9))

# [1.3.0](https://github.com/dnsxmrs/power-track/compare/v1.2.1...v1.3.0) (2026-04-29)


### Features

* **auth:** add dynamic base URL handling for production and development environments ([7951792](https://github.com/dnsxmrs/power-track/commit/7951792b52dd641f7fe967e92a5d1ec9ecd58ec8))

## [1.2.1](https://github.com/dnsxmrs/power-track/compare/v1.2.0...v1.2.1) (2026-04-29)


### Bug Fixes

* **prisma:** update datasource URL from DIRECT_URL to DATABASE_URL ([6752cce](https://github.com/dnsxmrs/power-track/commit/6752cce13ff1cc4bfe562470e5a5791d3bb71c24))

# [1.2.0](https://github.com/dnsxmrs/power-track/compare/v1.1.0...v1.2.0) (2026-04-29)


### Features

* **auth:** implement email existence check and CORS support in check-email route ([f643dd8](https://github.com/dnsxmrs/power-track/commit/f643dd822bd1e1ec68b2d9f47c9152e452bfea81))

# [1.1.0](https://github.com/dnsxmrs/power-track/compare/v1.0.1...v1.1.0) (2026-04-27)


### Bug Fixes

* **auth:** ensure valid SMTP port handling and configuration check ([740eb1a](https://github.com/dnsxmrs/power-track/commit/740eb1a7e0250ac83b8fc1e43818a584ebb23b1e))
* update apostrophe usage ([6e05569](https://github.com/dnsxmrs/power-track/commit/6e0556931935ec0a5f5fb39d7bf4c3bc6f547d7b))


### Features

* add power-track icon file ([68aa978](https://github.com/dnsxmrs/power-track/commit/68aa97832f30fb02a7cebe810e993a8856c0064f))
* **auth:** add password reset functionality with OTP verification ([d43fca8](https://github.com/dnsxmrs/power-track/commit/d43fca8e5de0023441f7d331d831428c318b7433))
* **dashboard:** implement data fetching and loading states in DashboardClient ([b41737e](https://github.com/dnsxmrs/power-track/commit/b41737e1580823a0d1ae9adf495b0ded434c98f6))
* **dashboard:** refactor dashboard components and add type definitions for DashboardData and DashboardMetric ([84fc0ad](https://github.com/dnsxmrs/power-track/commit/84fc0ad39ef60a74d6718f732717d8e1a35b5456))
* implement authentication flow with sign-in and sign-up pages and AuthContext provider ([44805a0](https://github.com/dnsxmrs/power-track/commit/44805a00d776b3590b64e34575f741ffb47487d6))
* implement sign-in and sign-up client components with global styling and glassmorphism design ([8fcc6b4](https://github.com/dnsxmrs/power-track/commit/8fcc6b4cafd6100a76ff30a55bc1664940b7c843))

# [1.1.0-beta.4](https://github.com/dnsxmrs/power-track/compare/v1.1.0-beta.3...v1.1.0-beta.4) (2026-04-27)


### Bug Fixes

* **auth:** ensure valid SMTP port handling and configuration check ([740eb1a](https://github.com/dnsxmrs/power-track/commit/740eb1a7e0250ac83b8fc1e43818a584ebb23b1e))


### Features

* **dashboard:** refactor dashboard components and add type definitions for DashboardData and DashboardMetric ([84fc0ad](https://github.com/dnsxmrs/power-track/commit/84fc0ad39ef60a74d6718f732717d8e1a35b5456))

# [1.1.0-beta.3](https://github.com/dnsxmrs/power-track/compare/v1.1.0-beta.2...v1.1.0-beta.3) (2026-04-27)


### Features

* add power-track icon file ([68aa978](https://github.com/dnsxmrs/power-track/commit/68aa97832f30fb02a7cebe810e993a8856c0064f))
* **auth:** add password reset functionality with OTP verification ([d43fca8](https://github.com/dnsxmrs/power-track/commit/d43fca8e5de0023441f7d331d831428c318b7433))
* **dashboard:** implement data fetching and loading states in DashboardClient ([b41737e](https://github.com/dnsxmrs/power-track/commit/b41737e1580823a0d1ae9adf495b0ded434c98f6))

# [1.1.0-beta.2](https://github.com/dnsxmrs/power-track/compare/v1.1.0-beta.1...v1.1.0-beta.2) (2026-04-25)


### Features

* implement sign-in and sign-up client components with global styling and glassmorphism design ([8fcc6b4](https://github.com/dnsxmrs/power-track/commit/8fcc6b4cafd6100a76ff30a55bc1664940b7c843))

# [1.1.0-beta.1](https://github.com/dnsxmrs/power-track/compare/v1.0.1...v1.1.0-beta.1) (2026-04-25)


### Bug Fixes

* update apostrophe usage ([6e05569](https://github.com/dnsxmrs/power-track/commit/6e0556931935ec0a5f5fb39d7bf4c3bc6f547d7b))


### Features

* implement authentication flow with sign-in and sign-up pages and AuthContext provider ([44805a0](https://github.com/dnsxmrs/power-track/commit/44805a00d776b3590b64e34575f741ffb47487d6))

## [1.0.1](https://github.com/dnsxmrs/power-track/compare/v1.0.0...v1.0.1) (2026-04-25)


### Bug Fixes

* update release badge URL in README ([46e6cb6](https://github.com/dnsxmrs/power-track/commit/46e6cb643ec15f68e0f00b1263772c23c40e16ab))
* update release badges and added beta as a version with one branch ([9dfd87a](https://github.com/dnsxmrs/power-track/commit/9dfd87ab22112a57aab47682be03d565da93c639))

# 1.0.0 (2026-04-25)


### Bug Fixes

* update release branch references in configuration and README ([4842cba](https://github.com/dnsxmrs/power-track/commit/4842cba4f571671f05e49c53e95a968c0e2c63c1))


### Features

* add MIT License file and update README with project details and structure ([cd59e6b](https://github.com/dnsxmrs/power-track/commit/cd59e6b933d68198b40c8302536339530d55e101))
* add settings page with alert thresholds, notification preferences, and account settings ([339ed95](https://github.com/dnsxmrs/power-track/commit/339ed9553a3d83e547ca6a20d776a186eb8a3057))
* enhance UI components with updated styles and improve accessibility ([2dc9511](https://github.com/dnsxmrs/power-track/commit/2dc95118b23c4b7df18ba3baac2f13a791d5e4b0))
* integrate Better Auth with Prisma and implement authentication flow ([8b13434](https://github.com/dnsxmrs/power-track/commit/8b134343e412397577f1c2d0461ca3190b862672))

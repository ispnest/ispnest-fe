# Frontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.6.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

### Local multi-tenant browser testing (apex first)

To test apex-first tenancy locally without `/etc/hosts` host aliases, run:

```bash
NG_APP_TENANCY_APEX=localhost NG_APP_FORCE_APEX=true npm run start:force-apex
```

Then open:

- Apex: `http://localhost:4200`

After logging in as platform admin, switch into a tenant context from the backend tenancy
switch flow (`POST /api/admin/tenants/{id}/switch`).

`NG_APP_FORCE_APEX=true` forces apex mode in local frontend detection.
`NG_APP_DEV_TENANT_SLUG` is a localhost fallback slug and should not be used as an apex flag.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

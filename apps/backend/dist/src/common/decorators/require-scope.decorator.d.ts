import type { IntegrationScope } from '@nodedr-restaurant/types';
export declare const INTEGRATION_SCOPES_KEY = "requiredIntegrationScopes";
export declare const RequireScope: (...scopes: IntegrationScope[]) => import("@nestjs/common").CustomDecorator<string>;

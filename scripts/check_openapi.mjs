import SwaggerParser from "@apidevtools/swagger-parser";

await SwaggerParser.validate("docs/openapi/identity.json");
await SwaggerParser.validate("docs/openapi/cms.json");
await SwaggerParser.validate("docs/openapi/public.json");
console.log("Identity, CMS and public OpenAPI contracts validated");

import SwaggerParser from "@apidevtools/swagger-parser";

await SwaggerParser.validate("docs/openapi/identity.json");
await SwaggerParser.validate("docs/openapi/cms.json");
await SwaggerParser.validate("docs/openapi/public.json");
await SwaggerParser.validate("docs/openapi/inquiries.json");
console.log("Identity, CMS, public and inquiry-operations OpenAPI contracts validated");

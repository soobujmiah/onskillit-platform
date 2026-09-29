import SwaggerParser from "@apidevtools/swagger-parser";

await SwaggerParser.validate("docs/openapi/identity.json");
await SwaggerParser.validate("docs/openapi/cms.json");
console.log("Identity and CMS OpenAPI contracts validated");

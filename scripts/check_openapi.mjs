import SwaggerParser from "@apidevtools/swagger-parser";

await SwaggerParser.validate("docs/openapi/identity.json");
console.log("Identity OpenAPI contract validated");

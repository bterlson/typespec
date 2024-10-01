import { Child, code, Indent, mapJoin, refkey } from "@alloy-js/core";
import * as jv from "@alloy-js/java";
import { useJavaNamePolicy } from "@alloy-js/java";
import { $, EmitContext, Model, ModelProperty } from "@typespec/compiler";
import { TypeExpression } from "@typespec/emitter-framework/java";
import { HttpOperation, OperationContainer } from "@typespec/http";
import { FlatHttpResponse } from "@typespec/http/typekit";
import { isNoEmit } from "../emitter.js";
import { RestController } from "../spring/components/index.js";
import { SpringServiceEndpoint } from "../spring/components/spring-service-endpoint.js";
import { springFramework } from "../spring/libraries/index.js";
import {
  getCustomResponseModelName,
  getErrorResponses,
  getNonErrorResponses,
} from "./responses.js";

export interface OperationsGroup {
  container?: OperationContainer;
  operations: HttpOperation[];
}

/**
 * Emit route handlers for http operations. Takes an OperationsGroup
 *
 * @param context Emit context
 * @param ops List of http operations
 */
export function emitOperations(context: EmitContext, ops: Record<string, OperationsGroup>) {
  return (
    <>
      {Object.values(ops).map((nsOps) => {
        if (nsOps.container === undefined) return null;

        const serviceAccessor = nsOps.container?.name.toLowerCase() + "Service";

        return (
          <jv.SourceFile path={`${nsOps.container?.name}Controller.java`}>
            <RestController container={nsOps.container}>
              <jv.Variable
                private
                final
                type={refkey(`${nsOps.container?.name}Service`)}
                name={serviceAccessor}
              />

              <jv.Annotation type={springFramework.Autowired} />
              <jv.Constructor
                public
                parameters={{
                  [serviceAccessor]: refkey(`${nsOps.container?.name}Service`),
                }}
              >
                this.{serviceAccessor} = {serviceAccessor};
              </jv.Constructor>

              {mapJoin(
                nsOps.operations,
                (op) => {
                  // Build names for params, to pass to service call
                  const bodyParams = op.parameters.body;
                  const headerParams = $.httpRequest.getParameters(op, "header");
                  const pathParams = $.httpRequest.getParameters(op, "path");
                  const queryParams = $.httpRequest.getParameters(op, "query");

                  const paramNames: string[] = [];

                  // Request body
                  if (bodyParams && bodyParams.property) {
                    paramNames.push(bodyParams.property.name);
                  }

                  if (headerParams) {
                    for (const prop of headerParams.properties.values()) {
                      paramNames.push(prop.name);
                    }
                  }

                  if (pathParams) {
                    for (const prop of pathParams.properties.values()) {
                      paramNames.push(prop.name);
                    }
                  }

                  if (queryParams) {
                    for (const prop of queryParams.properties.values()) {
                      paramNames.push(prop.name);
                    }
                  }

                  // Declare body of endpoint method depending on the following scenarios.
                  // 1. Response body is defined and one status code provided
                  // - Returns a ResponseEntity wrapping body object and this single status code
                  // 2. Response body is undefined and one status code provided
                  // - Returns a ResponseEntity with no body and this single status code
                  // 3. The above two cases (body or no body) but with multiple status codes
                  // - Generate custom java class with a property for each of the status codes. The
                  // - types of the property will be either the body type if defined, or void.
                  // - The business logic interface will return this custom object
                  // - with one of the properties set relevant to the status code to be returned.
                  // - This endpoint will then detect which is set, and send that status code with the
                  // - relevant body.

                  // If any of the response models has @error decorator, wrap method in try-catch block
                  // and in catch block return ResponseEntity wrapping the error model as body, and status code of error model

                  // TODO: Currently takes first response as the basis for the @body type
                  const response: FlatHttpResponse = $.httpOperation.getResponses(op.operation)[0];

                  const nonErrorResponses = getNonErrorResponses(op);
                  const requiresCustomModel = nonErrorResponses.length > 1;

                  // Takes status codes from all responses, this could happen from for instance e.g MyDataModel | CreatedResponse, emits status codes 200 & 201
                  // or MyDataModel & CreatedResponse only emits status code 201

                  const statusCode = response.statusCode;

                  const responseBodyType = response.responseContent.body?.type;

                  const errorResponses = getErrorResponses(op);

                  const serviceBody = (
                    <>
                      {requiresCustomModel
                        ? code`
                          ${refkey(getCustomResponseModelName(op))} returnedBody = ${serviceAccessor}.${op.operation?.name}(${paramNames.join(", ")});
                          ${mapJoin(
                            nonErrorResponses,
                            (res) => {
                              const responseModel = res.type as Model;
                              const inBuiltResponse = isNoEmit(responseModel);
                              return code`
                                if (returnedBody.get${responseModel.name}() != null) {
                                  return new ${springFramework.ResponseEntity}${(<jv.Generics />)}(${!inBuiltResponse && code`returnedBody.get${responseModel.name}(), `}${springFramework.HttpStatus}.valueOf(${res.statusCodes as number}));
                                }
                              `;
                            },
                            {
                              joiner: " else ",
                            },
                          )}
                          return new ${springFramework.ResponseEntity}${(<jv.Generics />)}(${springFramework.HttpStatus}.valueOf(${statusCode as number}));
                        `
                        : responseBodyType != null
                          ? code`
                          ${(<TypeExpression type={responseBodyType} />)} returnedBody = ${serviceAccessor}.${op.operation?.name}(${paramNames.join(", ")});
                          return new ${springFramework.ResponseEntity}${(<jv.Generics />)}(returnedBody, ${springFramework.HttpStatus}.valueOf(${statusCode as number}));
                        `
                          : code`
                          ${serviceAccessor}.${op.operation?.name}(${paramNames.join(", ")});
                          return new ${springFramework.ResponseEntity}${(<jv.Generics />)}(${springFramework.HttpStatus}.valueOf(${statusCode as number}));
                        `}
                    </>
                  );

                  // prettier-ignore
                  return (
                    <>
                      <SpringServiceEndpoint op={op}>
                        {errorResponses.length > 0 ? (
                          <>
                            {code`try {`}
                            <Indent>{serviceBody}</Indent>
                            {"}"} {mapJoin(
                              errorResponses,
                              (res) => {
                                return code`
                                catch (${refkey(res.type)} e) {
                                  return new ${springFramework.ResponseEntity}${(<jv.Generics />)}(e, ${springFramework.HttpStatus}.valueOf(${res.statusCodes as number}));
                                }
                              `;
                              },
                              {
                                joiner: " ",
                              },
                            )}
                          </>
                        ) : (
                          serviceBody
                        )}
                      </SpringServiceEndpoint>
                    </>
                  );
                },
                { joiner: "\n\n" },
              )}
            </RestController>
          </jv.SourceFile>
        );
      })}
    </>
  );
}

/**
 * Emit services to implement business logic. Will generate interface, then class to be implemented by user
 *
 * @param context Emit context
 * @param ops List of http operations
 */
export function emitServices(context: EmitContext, ops: Record<string, OperationsGroup>) {
  return (
    <>
      <jv.PackageDirectory package="services">
        {Object.values(ops).map((nsOps) => {
          if (nsOps.container === undefined) return null;

          return (
            <jv.SourceFile path={`${nsOps.container?.name}Service.java`}>
              <jv.Interface public name={`${nsOps.container?.name}Service`}>
                {mapJoin(
                  nsOps.operations,
                  (op) => {
                    // Generated function will take parameters that are passed to endpoint (combination of query, body, path variable etc)
                    // Return type will be return type of operation
                    const namePolicy = useJavaNamePolicy();

                    const bodyParams = op.parameters.body;
                    const headerParams = $.httpRequest.getParameters(op, "header");
                    const pathParams = $.httpRequest.getParameters(op, "path");
                    const queryParams = $.httpRequest.getParameters(op, "query");

                    // Parameters (query, path, and headers)
                    const params: Record<string, Child> = {};

                    // Request body
                    if (bodyParams && bodyParams.property) {
                      params[bodyParams?.property?.name ?? "body"] = (
                        <TypeExpression type={bodyParams.property} />
                      );
                    }

                    const modelProperties: ModelProperty[] = [];

                    if (headerParams) {
                      for (const prop of headerParams.properties.values()) {
                        modelProperties.push(prop);
                      }
                    }

                    if (pathParams) {
                      for (const prop of pathParams.properties.values()) {
                        modelProperties.push(prop);
                      }
                    }

                    if (queryParams) {
                      for (const prop of queryParams.properties.values()) {
                        modelProperties.push(prop);
                      }
                    }

                    modelProperties.forEach((param) => {
                      params[namePolicy.getName(param.name, "parameter")] = (
                        <TypeExpression type={param} />
                      );
                    });

                    // Determine return type of the business logic interface
                    // - If single status code and body, return type is Model
                    // - If multiple status codes, returns custom object that has a property for each of the
                    //   codes, type of property is body Model (or Void if no body)
                    // - If error model part of response, add `throws <CustomError>` clause
                    //   to specify the error that should be thrown if any

                    const nonErrorResponses = getNonErrorResponses(op);
                    const requiresCustomModel = nonErrorResponses.length > 1;

                    const response: FlatHttpResponse = $.httpOperation.getResponses(
                      op.operation,
                    )[0];

                    const responseBodyType = response.responseContent.body?.type;

                    const errorResponses = getErrorResponses(op);
                    const throwsClause = mapJoin(
                      errorResponses,
                      (res) => {
                        return refkey(res.type);
                      },
                      {
                        joiner: ", ",
                      },
                    );

                    return (
                      <jv.Method
                        name={op.operation?.name}
                        throws={errorResponses.length >= 1 ? throwsClause : undefined}
                        // Interface will usually always return the type of our body, and void if body is undefined
                        return={
                          requiresCustomModel ? (
                            refkey(getCustomResponseModelName(op))
                          ) : responseBodyType ? (
                            <TypeExpression type={responseBodyType} />
                          ) : undefined
                        }
                        parameters={params}
                      />
                    );
                  },
                  { joiner: "\n" },
                )}
              </jv.Interface>
            </jv.SourceFile>
          );
        })}
      </jv.PackageDirectory>
    </>
  );
}

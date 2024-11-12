// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
// Code generated by Microsoft (R) TypeSpec Code Generator.

package com.cadl.specialheaders;

import com.azure.core.annotation.Generated;
import com.azure.core.annotation.ReturnType;
import com.azure.core.annotation.ServiceClient;
import com.azure.core.annotation.ServiceMethod;
import com.azure.core.exception.ClientAuthenticationException;
import com.azure.core.exception.HttpResponseException;
import com.azure.core.exception.ResourceModifiedException;
import com.azure.core.exception.ResourceNotFoundException;
import com.azure.core.http.HttpHeaderName;
import com.azure.core.http.MatchConditions;
import com.azure.core.http.RequestConditions;
import com.azure.core.http.rest.PagedIterable;
import com.azure.core.http.rest.RequestOptions;
import com.azure.core.http.rest.Response;
import com.azure.core.util.BinaryData;
import com.azure.core.util.DateTimeRfc1123;
import com.cadl.specialheaders.implementation.EtagHeadersImpl;
import com.cadl.specialheaders.implementation.JsonMergePatchHelper;
import com.cadl.specialheaders.models.Resource;
import java.time.OffsetDateTime;

/**
 * Initializes a new instance of the synchronous SpecialHeadersClient type.
 */
@ServiceClient(builder = SpecialHeadersClientBuilder.class)
public final class EtagHeadersClient {
    @Generated
    private final EtagHeadersImpl serviceClient;

    /**
     * Initializes an instance of EtagHeadersClient class.
     * 
     * @param serviceClient the service client implementation.
     */
    @Generated
    EtagHeadersClient(EtagHeadersImpl serviceClient) {
        this.serviceClient = serviceClient;
    }

    /**
     * Create or replace operation template.
     * <p><strong>Header Parameters</strong></p>
     * <table border="1">
     * <caption>Header Parameters</caption>
     * <tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr>
     * <tr><td>If-Match</td><td>String</td><td>No</td><td>The request should only proceed if an entity matches this
     * string.</td></tr>
     * <tr><td>If-None-Match</td><td>String</td><td>No</td><td>The request should only proceed if no entity matches this
     * string.</td></tr>
     * <tr><td>If-Unmodified-Since</td><td>OffsetDateTime</td><td>No</td><td>The request should only proceed if the
     * entity was not modified after this time.</td></tr>
     * <tr><td>If-Modified-Since</td><td>OffsetDateTime</td><td>No</td><td>The request should only proceed if the entity
     * was modified after this time.</td></tr>
     * </table>
     * You can add these to a request with {@link RequestOptions#addHeader}
     * <p><strong>Request Body Schema</strong></p>
     * 
     * <pre>
     * {@code
     * {
     *     id: String (Required)
     *     name: String (Required)
     *     description: String (Optional)
     *     type: String (Optional, Required on create)
     * }
     * }
     * </pre>
     * 
     * <p><strong>Response Body Schema</strong></p>
     * 
     * <pre>
     * {@code
     * {
     *     id: String (Required)
     *     name: String (Required)
     *     description: String (Optional)
     *     type: String (Optional, Required on create)
     * }
     * }
     * </pre>
     * 
     * @param name The name parameter.
     * @param resource The resource instance.
     * @param requestOptions The options to configure the HTTP request before HTTP client sends it.
     * @throws HttpResponseException thrown if the request is rejected by server.
     * @throws ClientAuthenticationException thrown if the request is rejected by server on status code 401.
     * @throws ResourceNotFoundException thrown if the request is rejected by server on status code 404.
     * @throws ResourceModifiedException thrown if the request is rejected by server on status code 409.
     * @return the response body along with {@link Response}.
     */
    @Generated
    @ServiceMethod(returns = ReturnType.SINGLE)
    public Response<BinaryData> putWithRequestHeadersWithResponse(String name, BinaryData resource,
        RequestOptions requestOptions) {
        return this.serviceClient.putWithRequestHeadersWithResponse(name, resource, requestOptions);
    }

    /**
     * Create or update operation template.
     * <p><strong>Header Parameters</strong></p>
     * <table border="1">
     * <caption>Header Parameters</caption>
     * <tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr>
     * <tr><td>If-Match</td><td>String</td><td>No</td><td>The request should only proceed if an entity matches this
     * string.</td></tr>
     * <tr><td>If-None-Match</td><td>String</td><td>No</td><td>The request should only proceed if no entity matches this
     * string.</td></tr>
     * </table>
     * You can add these to a request with {@link RequestOptions#addHeader}
     * <p><strong>Request Body Schema</strong></p>
     * 
     * <pre>
     * {@code
     * {
     *     id: String (Required)
     *     name: String (Required)
     *     description: String (Optional)
     *     type: String (Optional, Required on create)
     * }
     * }
     * </pre>
     * 
     * <p><strong>Response Body Schema</strong></p>
     * 
     * <pre>
     * {@code
     * {
     *     id: String (Required)
     *     name: String (Required)
     *     description: String (Optional)
     *     type: String (Optional, Required on create)
     * }
     * }
     * </pre>
     * 
     * @param name The name parameter.
     * @param resource The resource instance.
     * @param requestOptions The options to configure the HTTP request before HTTP client sends it.
     * @throws HttpResponseException thrown if the request is rejected by server.
     * @throws ClientAuthenticationException thrown if the request is rejected by server on status code 401.
     * @throws ResourceNotFoundException thrown if the request is rejected by server on status code 404.
     * @throws ResourceModifiedException thrown if the request is rejected by server on status code 409.
     * @return the response body along with {@link Response}.
     */
    @Generated
    @ServiceMethod(returns = ReturnType.SINGLE)
    public Response<BinaryData> patchWithMatchHeadersWithResponse(String name, BinaryData resource,
        RequestOptions requestOptions) {
        return this.serviceClient.patchWithMatchHeadersWithResponse(name, resource, requestOptions);
    }

    /**
     * Resource list operation template.
     * <p><strong>Response Body Schema</strong></p>
     * 
     * <pre>
     * {@code
     * {
     *     id: String (Required)
     *     name: String (Required)
     *     description: String (Optional)
     *     type: String (Optional, Required on create)
     * }
     * }
     * </pre>
     * 
     * @param requestOptions The options to configure the HTTP request before HTTP client sends it.
     * @throws HttpResponseException thrown if the request is rejected by server.
     * @throws ClientAuthenticationException thrown if the request is rejected by server on status code 401.
     * @throws ResourceNotFoundException thrown if the request is rejected by server on status code 404.
     * @throws ResourceModifiedException thrown if the request is rejected by server on status code 409.
     * @return paged collection of Resource items as paginated response with {@link PagedIterable}.
     */
    @Generated
    @ServiceMethod(returns = ReturnType.COLLECTION)
    public PagedIterable<BinaryData> listWithEtag(RequestOptions requestOptions) {
        return this.serviceClient.listWithEtag(requestOptions);
    }

    /**
     * Create or replace operation template.
     * 
     * @param name The name parameter.
     * @param resource The resource instance.
     * @param requestConditions Specifies HTTP options for conditional requests based on modification time.
     * @throws IllegalArgumentException thrown if parameters fail the validation.
     * @throws HttpResponseException thrown if the request is rejected by server.
     * @throws ClientAuthenticationException thrown if the request is rejected by server on status code 401.
     * @throws ResourceNotFoundException thrown if the request is rejected by server on status code 404.
     * @throws ResourceModifiedException thrown if the request is rejected by server on status code 409.
     * @throws RuntimeException all other wrapped checked exceptions if the request fails to be sent.
     * @return the response.
     */
    @Generated
    @ServiceMethod(returns = ReturnType.SINGLE)
    public Resource putWithRequestHeaders(String name, Resource resource, RequestConditions requestConditions) {
        // Generated convenience method for putWithRequestHeadersWithResponse
        RequestOptions requestOptions = new RequestOptions();
        String ifMatch = requestConditions == null ? null : requestConditions.getIfMatch();
        String ifNoneMatch = requestConditions == null ? null : requestConditions.getIfNoneMatch();
        OffsetDateTime ifUnmodifiedSince = requestConditions == null ? null : requestConditions.getIfUnmodifiedSince();
        OffsetDateTime ifModifiedSince = requestConditions == null ? null : requestConditions.getIfModifiedSince();
        if (ifMatch != null) {
            requestOptions.setHeader(HttpHeaderName.IF_MATCH, ifMatch);
        }
        if (ifNoneMatch != null) {
            requestOptions.setHeader(HttpHeaderName.IF_NONE_MATCH, ifNoneMatch);
        }
        if (ifUnmodifiedSince != null) {
            requestOptions.setHeader(HttpHeaderName.IF_UNMODIFIED_SINCE,
                String.valueOf(new DateTimeRfc1123(ifUnmodifiedSince)));
        }
        if (ifModifiedSince != null) {
            requestOptions.setHeader(HttpHeaderName.IF_MODIFIED_SINCE,
                String.valueOf(new DateTimeRfc1123(ifModifiedSince)));
        }
        return putWithRequestHeadersWithResponse(name, BinaryData.fromObject(resource), requestOptions).getValue()
            .toObject(Resource.class);
    }

    /**
     * Create or replace operation template.
     * 
     * @param name The name parameter.
     * @param resource The resource instance.
     * @throws IllegalArgumentException thrown if parameters fail the validation.
     * @throws HttpResponseException thrown if the request is rejected by server.
     * @throws ClientAuthenticationException thrown if the request is rejected by server on status code 401.
     * @throws ResourceNotFoundException thrown if the request is rejected by server on status code 404.
     * @throws ResourceModifiedException thrown if the request is rejected by server on status code 409.
     * @throws RuntimeException all other wrapped checked exceptions if the request fails to be sent.
     * @return the response.
     */
    @Generated
    @ServiceMethod(returns = ReturnType.SINGLE)
    public Resource putWithRequestHeaders(String name, Resource resource) {
        // Generated convenience method for putWithRequestHeadersWithResponse
        RequestOptions requestOptions = new RequestOptions();
        return putWithRequestHeadersWithResponse(name, BinaryData.fromObject(resource), requestOptions).getValue()
            .toObject(Resource.class);
    }

    /**
     * Create or update operation template.
     * 
     * @param name The name parameter.
     * @param resource The resource instance.
     * @param matchConditions Specifies HTTP options for conditional requests.
     * @throws IllegalArgumentException thrown if parameters fail the validation.
     * @throws HttpResponseException thrown if the request is rejected by server.
     * @throws ClientAuthenticationException thrown if the request is rejected by server on status code 401.
     * @throws ResourceNotFoundException thrown if the request is rejected by server on status code 404.
     * @throws ResourceModifiedException thrown if the request is rejected by server on status code 409.
     * @throws RuntimeException all other wrapped checked exceptions if the request fails to be sent.
     * @return the response.
     */
    @Generated
    @ServiceMethod(returns = ReturnType.SINGLE)
    public Resource patchWithMatchHeaders(String name, Resource resource, MatchConditions matchConditions) {
        // Generated convenience method for patchWithMatchHeadersWithResponse
        RequestOptions requestOptions = new RequestOptions();
        String ifMatch = matchConditions == null ? null : matchConditions.getIfMatch();
        String ifNoneMatch = matchConditions == null ? null : matchConditions.getIfNoneMatch();
        if (ifMatch != null) {
            requestOptions.setHeader(HttpHeaderName.IF_MATCH, ifMatch);
        }
        if (ifNoneMatch != null) {
            requestOptions.setHeader(HttpHeaderName.IF_NONE_MATCH, ifNoneMatch);
        }
        JsonMergePatchHelper.getResourceAccessor().prepareModelForJsonMergePatch(resource, true);
        BinaryData resourceInBinaryData = BinaryData.fromObject(resource);
        // BinaryData.fromObject() will not fire serialization, use getLength() to fire serialization.
        resourceInBinaryData.getLength();
        JsonMergePatchHelper.getResourceAccessor().prepareModelForJsonMergePatch(resource, false);
        return patchWithMatchHeadersWithResponse(name, resourceInBinaryData, requestOptions).getValue()
            .toObject(Resource.class);
    }

    /**
     * Create or update operation template.
     * 
     * @param name The name parameter.
     * @param resource The resource instance.
     * @throws IllegalArgumentException thrown if parameters fail the validation.
     * @throws HttpResponseException thrown if the request is rejected by server.
     * @throws ClientAuthenticationException thrown if the request is rejected by server on status code 401.
     * @throws ResourceNotFoundException thrown if the request is rejected by server on status code 404.
     * @throws ResourceModifiedException thrown if the request is rejected by server on status code 409.
     * @throws RuntimeException all other wrapped checked exceptions if the request fails to be sent.
     * @return the response.
     */
    @Generated
    @ServiceMethod(returns = ReturnType.SINGLE)
    public Resource patchWithMatchHeaders(String name, Resource resource) {
        // Generated convenience method for patchWithMatchHeadersWithResponse
        RequestOptions requestOptions = new RequestOptions();
        JsonMergePatchHelper.getResourceAccessor().prepareModelForJsonMergePatch(resource, true);
        BinaryData resourceInBinaryData = BinaryData.fromObject(resource);
        // BinaryData.fromObject() will not fire serialization, use getLength() to fire serialization.
        resourceInBinaryData.getLength();
        JsonMergePatchHelper.getResourceAccessor().prepareModelForJsonMergePatch(resource, false);
        return patchWithMatchHeadersWithResponse(name, resourceInBinaryData, requestOptions).getValue()
            .toObject(Resource.class);
    }

    /**
     * Resource list operation template.
     * 
     * @throws HttpResponseException thrown if the request is rejected by server.
     * @throws ClientAuthenticationException thrown if the request is rejected by server on status code 401.
     * @throws ResourceNotFoundException thrown if the request is rejected by server on status code 404.
     * @throws ResourceModifiedException thrown if the request is rejected by server on status code 409.
     * @throws RuntimeException all other wrapped checked exceptions if the request fails to be sent.
     * @return paged collection of Resource items as paginated response with {@link PagedIterable}.
     */
    @Generated
    @ServiceMethod(returns = ReturnType.COLLECTION)
    public PagedIterable<Resource> listWithEtag() {
        // Generated convenience method for listWithEtag
        RequestOptions requestOptions = new RequestOptions();
        return serviceClient.listWithEtag(requestOptions)
            .mapPage(bodyItemValue -> bodyItemValue.toObject(Resource.class));
    }
}

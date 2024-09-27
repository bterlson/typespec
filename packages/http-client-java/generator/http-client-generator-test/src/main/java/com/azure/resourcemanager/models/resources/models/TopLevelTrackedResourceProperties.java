// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
// Code generated by Microsoft (R) TypeSpec Code Generator.

package com.azure.resourcemanager.models.resources.models;

import com.azure.core.annotation.Fluent;
import com.azure.json.JsonReader;
import com.azure.json.JsonSerializable;
import com.azure.json.JsonToken;
import com.azure.json.JsonWriter;
import java.io.IOException;

/**
 * Top Level Arm Resource Properties.
 */
@Fluent
public final class TopLevelTrackedResourceProperties implements JsonSerializable<TopLevelTrackedResourceProperties> {
    /*
     * The status of the last operation.
     */
    private ProvisioningState provisioningState;

    /*
     * The description of the resource.
     */
    private String description;

    /**
     * Creates an instance of TopLevelTrackedResourceProperties class.
     */
    public TopLevelTrackedResourceProperties() {
    }

    /**
     * Get the provisioningState property: The status of the last operation.
     * 
     * @return the provisioningState value.
     */
    public ProvisioningState provisioningState() {
        return this.provisioningState;
    }

    /**
     * Get the description property: The description of the resource.
     * 
     * @return the description value.
     */
    public String description() {
        return this.description;
    }

    /**
     * Set the description property: The description of the resource.
     * 
     * @param description the description value to set.
     * @return the TopLevelTrackedResourceProperties object itself.
     */
    public TopLevelTrackedResourceProperties withDescription(String description) {
        this.description = description;
        return this;
    }

    /**
     * Validates the instance.
     * 
     * @throws IllegalArgumentException thrown if the instance is not valid.
     */
    public void validate() {
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public JsonWriter toJson(JsonWriter jsonWriter) throws IOException {
        jsonWriter.writeStartObject();
        jsonWriter.writeStringField("description", this.description);
        return jsonWriter.writeEndObject();
    }

    /**
     * Reads an instance of TopLevelTrackedResourceProperties from the JsonReader.
     * 
     * @param jsonReader The JsonReader being read.
     * @return An instance of TopLevelTrackedResourceProperties if the JsonReader was pointing to an instance of it, or
     * null if it was pointing to JSON null.
     * @throws IOException If an error occurs while reading the TopLevelTrackedResourceProperties.
     */
    public static TopLevelTrackedResourceProperties fromJson(JsonReader jsonReader) throws IOException {
        return jsonReader.readObject(reader -> {
            TopLevelTrackedResourceProperties deserializedTopLevelTrackedResourceProperties
                = new TopLevelTrackedResourceProperties();
            while (reader.nextToken() != JsonToken.END_OBJECT) {
                String fieldName = reader.getFieldName();
                reader.nextToken();

                if ("provisioningState".equals(fieldName)) {
                    deserializedTopLevelTrackedResourceProperties.provisioningState
                        = ProvisioningState.fromString(reader.getString());
                } else if ("description".equals(fieldName)) {
                    deserializedTopLevelTrackedResourceProperties.description = reader.getString();
                } else {
                    reader.skipChildren();
                }
            }

            return deserializedTopLevelTrackedResourceProperties;
        });
    }
}

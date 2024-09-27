// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
// Code generated by Microsoft (R) TypeSpec Code Generator.

package com.cadl.patch.models;

import com.azure.core.annotation.Fluent;
import com.azure.core.annotation.Generated;
import com.azure.json.JsonReader;
import com.azure.json.JsonSerializable;
import com.azure.json.JsonToken;
import com.azure.json.JsonWriter;
import com.cadl.patch.implementation.JsonMergePatchHelper;
import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * The Resource model.
 */
@Fluent
public final class Resource implements JsonSerializable<Resource> {
    /*
     * The id property.
     */
    @Generated
    private String id;

    /*
     * The name property.
     */
    @Generated
    private String name;

    /*
     * The description property.
     */
    @Generated
    private String description;

    /*
     * The map property.
     */
    @Generated
    private Map<String, InnerModel> map;

    /*
     * The longValue property.
     */
    @Generated
    private Long longValue;

    /*
     * The intValue property.
     */
    @Generated
    private Integer intValue;

    /*
     * The enumValue property.
     */
    @Generated
    private ResourceEnumValue enumValue;

    /*
     * The wireNameForInnerModelProperty property.
     */
    @Generated
    private InnerModel innerModelProperty;

    /*
     * The array property.
     */
    @Generated
    private List<InnerModel> array;

    /*
     * The fish property.
     */
    @Generated
    private Fish fish;

    /**
     * Stores updated model property, the value is property name, not serialized name.
     */
    @Generated
    private final Set<String> updatedProperties = new HashSet<>();

    @Generated
    private boolean jsonMergePatch;

    @Generated
    private void serializeAsJsonMergePatch(boolean jsonMergePatch) {
        this.jsonMergePatch = jsonMergePatch;
    }

    static {
        JsonMergePatchHelper.setResourceAccessor(new JsonMergePatchHelper.ResourceAccessor() {
            @Override
            public Resource prepareModelForJsonMergePatch(Resource model, boolean jsonMergePatchEnabled) {
                model.serializeAsJsonMergePatch(jsonMergePatchEnabled);
                return model;
            }

            @Override
            public boolean isJsonMergePatch(Resource model) {
                return model.jsonMergePatch;
            }
        });
    }

    /**
     * Creates an instance of Resource class.
     */
    @Generated
    public Resource() {
    }

    /**
     * Get the id property: The id property.
     * 
     * @return the id value.
     */
    @Generated
    public String getId() {
        return this.id;
    }

    /**
     * Get the name property: The name property.
     * 
     * @return the name value.
     */
    @Generated
    public String getName() {
        return this.name;
    }

    /**
     * Get the description property: The description property.
     * 
     * @return the description value.
     */
    @Generated
    public String getDescription() {
        return this.description;
    }

    /**
     * Set the description property: The description property.
     * 
     * @param description the description value to set.
     * @return the Resource object itself.
     */
    @Generated
    public Resource setDescription(String description) {
        this.description = description;
        this.updatedProperties.add("description");
        return this;
    }

    /**
     * Get the map property: The map property.
     * 
     * @return the map value.
     */
    @Generated
    public Map<String, InnerModel> getMap() {
        return this.map;
    }

    /**
     * Set the map property: The map property.
     * <p>Required when create the resource.</p>
     * 
     * @param map the map value to set.
     * @return the Resource object itself.
     */
    @Generated
    public Resource setMap(Map<String, InnerModel> map) {
        this.map = map;
        this.updatedProperties.add("map");
        return this;
    }

    /**
     * Get the longValue property: The longValue property.
     * 
     * @return the longValue value.
     */
    @Generated
    public Long getLongValue() {
        return this.longValue;
    }

    /**
     * Set the longValue property: The longValue property.
     * 
     * @param longValue the longValue value to set.
     * @return the Resource object itself.
     */
    @Generated
    public Resource setLongValue(Long longValue) {
        this.longValue = longValue;
        this.updatedProperties.add("longValue");
        return this;
    }

    /**
     * Get the intValue property: The intValue property.
     * 
     * @return the intValue value.
     */
    @Generated
    public Integer getIntValue() {
        return this.intValue;
    }

    /**
     * Set the intValue property: The intValue property.
     * 
     * @param intValue the intValue value to set.
     * @return the Resource object itself.
     */
    @Generated
    public Resource setIntValue(Integer intValue) {
        this.intValue = intValue;
        this.updatedProperties.add("intValue");
        return this;
    }

    /**
     * Get the enumValue property: The enumValue property.
     * 
     * @return the enumValue value.
     */
    @Generated
    public ResourceEnumValue getEnumValue() {
        return this.enumValue;
    }

    /**
     * Set the enumValue property: The enumValue property.
     * 
     * @param enumValue the enumValue value to set.
     * @return the Resource object itself.
     */
    @Generated
    public Resource setEnumValue(ResourceEnumValue enumValue) {
        this.enumValue = enumValue;
        this.updatedProperties.add("enumValue");
        return this;
    }

    /**
     * Get the innerModelProperty property: The wireNameForInnerModelProperty property.
     * 
     * @return the innerModelProperty value.
     */
    @Generated
    public InnerModel getInnerModelProperty() {
        return this.innerModelProperty;
    }

    /**
     * Set the innerModelProperty property: The wireNameForInnerModelProperty property.
     * 
     * @param innerModelProperty the innerModelProperty value to set.
     * @return the Resource object itself.
     */
    @Generated
    public Resource setInnerModelProperty(InnerModel innerModelProperty) {
        this.innerModelProperty = innerModelProperty;
        this.updatedProperties.add("innerModelProperty");
        return this;
    }

    /**
     * Get the array property: The array property.
     * 
     * @return the array value.
     */
    @Generated
    public List<InnerModel> getArray() {
        return this.array;
    }

    /**
     * Set the array property: The array property.
     * 
     * @param array the array value to set.
     * @return the Resource object itself.
     */
    @Generated
    public Resource setArray(List<InnerModel> array) {
        this.array = array;
        this.updatedProperties.add("array");
        return this;
    }

    /**
     * Get the fish property: The fish property.
     * 
     * @return the fish value.
     */
    @Generated
    public Fish getFish() {
        return this.fish;
    }

    /**
     * Set the fish property: The fish property.
     * 
     * @param fish the fish value to set.
     * @return the Resource object itself.
     */
    @Generated
    public Resource setFish(Fish fish) {
        this.fish = fish;
        this.updatedProperties.add("fish");
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Generated
    @Override
    public JsonWriter toJson(JsonWriter jsonWriter) throws IOException {
        if (jsonMergePatch) {
            return toJsonMergePatch(jsonWriter);
        } else {
            jsonWriter.writeStartObject();
            jsonWriter.writeStringField("description", this.description);
            jsonWriter.writeMapField("map", this.map, (writer, element) -> writer.writeJson(element));
            jsonWriter.writeNumberField("longValue", this.longValue);
            jsonWriter.writeNumberField("intValue", this.intValue);
            jsonWriter.writeStringField("enumValue", this.enumValue == null ? null : this.enumValue.toString());
            jsonWriter.writeJsonField("wireNameForInnerModelProperty", this.innerModelProperty);
            jsonWriter.writeArrayField("array", this.array, (writer, element) -> writer.writeJson(element));
            jsonWriter.writeJsonField("fish", this.fish);
            return jsonWriter.writeEndObject();
        }
    }

    @Generated
    private JsonWriter toJsonMergePatch(JsonWriter jsonWriter) throws IOException {
        jsonWriter.writeStartObject();
        if (updatedProperties.contains("description")) {
            if (this.description == null) {
                jsonWriter.writeNullField("description");
            } else {
                jsonWriter.writeStringField("description", this.description);
            }
        }
        if (updatedProperties.contains("map")) {
            if (this.map == null) {
                jsonWriter.writeNullField("map");
            } else {
                jsonWriter.writeMapField("map", this.map, (writer, element) -> {
                    if (element != null) {
                        JsonMergePatchHelper.getInnerModelAccessor().prepareModelForJsonMergePatch(element, true);
                        writer.writeJson(element);
                        JsonMergePatchHelper.getInnerModelAccessor().prepareModelForJsonMergePatch(element, false);
                    } else {
                        writer.writeNull();
                    }
                });
            }
        }
        if (updatedProperties.contains("longValue")) {
            if (this.longValue == null) {
                jsonWriter.writeNullField("longValue");
            } else {
                jsonWriter.writeNumberField("longValue", this.longValue);
            }
        }
        if (updatedProperties.contains("intValue")) {
            if (this.intValue == null) {
                jsonWriter.writeNullField("intValue");
            } else {
                jsonWriter.writeNumberField("intValue", this.intValue);
            }
        }
        if (updatedProperties.contains("enumValue")) {
            if (this.enumValue == null) {
                jsonWriter.writeNullField("enumValue");
            } else {
                jsonWriter.writeStringField("enumValue", this.enumValue.toString());
            }
        }
        if (updatedProperties.contains("innerModelProperty")) {
            if (this.innerModelProperty == null) {
                jsonWriter.writeNullField("wireNameForInnerModelProperty");
            } else {
                JsonMergePatchHelper.getInnerModelAccessor()
                    .prepareModelForJsonMergePatch(this.innerModelProperty, true);
                jsonWriter.writeJsonField("wireNameForInnerModelProperty", this.innerModelProperty);
                JsonMergePatchHelper.getInnerModelAccessor()
                    .prepareModelForJsonMergePatch(this.innerModelProperty, false);
            }
        }
        if (updatedProperties.contains("array")) {
            if (this.array == null) {
                jsonWriter.writeNullField("array");
            } else {
                jsonWriter.writeArrayField("array", this.array, (writer, element) -> writer.writeJson(element));
            }
        }
        if (updatedProperties.contains("fish")) {
            if (this.fish == null) {
                jsonWriter.writeNullField("fish");
            } else {
                JsonMergePatchHelper.getFishAccessor().prepareModelForJsonMergePatch(this.fish, true);
                jsonWriter.writeJsonField("fish", this.fish);
                JsonMergePatchHelper.getFishAccessor().prepareModelForJsonMergePatch(this.fish, false);
            }
        }
        return jsonWriter.writeEndObject();
    }

    /**
     * Reads an instance of Resource from the JsonReader.
     * 
     * @param jsonReader The JsonReader being read.
     * @return An instance of Resource if the JsonReader was pointing to an instance of it, or null if it was pointing
     * to JSON null.
     * @throws IllegalStateException If the deserialized JSON object was missing any required properties.
     * @throws IOException If an error occurs while reading the Resource.
     */
    @Generated
    public static Resource fromJson(JsonReader jsonReader) throws IOException {
        return jsonReader.readObject(reader -> {
            Resource deserializedResource = new Resource();
            while (reader.nextToken() != JsonToken.END_OBJECT) {
                String fieldName = reader.getFieldName();
                reader.nextToken();

                if ("id".equals(fieldName)) {
                    deserializedResource.id = reader.getString();
                } else if ("name".equals(fieldName)) {
                    deserializedResource.name = reader.getString();
                } else if ("description".equals(fieldName)) {
                    deserializedResource.description = reader.getString();
                } else if ("map".equals(fieldName)) {
                    Map<String, InnerModel> map = reader.readMap(reader1 -> InnerModel.fromJson(reader1));
                    deserializedResource.map = map;
                } else if ("longValue".equals(fieldName)) {
                    deserializedResource.longValue = reader.getNullable(JsonReader::getLong);
                } else if ("intValue".equals(fieldName)) {
                    deserializedResource.intValue = reader.getNullable(JsonReader::getInt);
                } else if ("enumValue".equals(fieldName)) {
                    deserializedResource.enumValue = ResourceEnumValue.fromString(reader.getString());
                } else if ("wireNameForInnerModelProperty".equals(fieldName)) {
                    deserializedResource.innerModelProperty = InnerModel.fromJson(reader);
                } else if ("array".equals(fieldName)) {
                    List<InnerModel> array = reader.readArray(reader1 -> InnerModel.fromJson(reader1));
                    deserializedResource.array = array;
                } else if ("fish".equals(fieldName)) {
                    deserializedResource.fish = Fish.fromJson(reader);
                } else {
                    reader.skipChildren();
                }
            }

            return deserializedResource;
        });
    }
}

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
// Code generated by Microsoft (R) TypeSpec Code Generator.

package tsptest.flatten.generated;

import com.azure.core.util.Configuration;
import tsptest.flatten.FlattenClient;
import tsptest.flatten.FlattenClientBuilder;
import tsptest.flatten.models.SendLongOptions;
import tsptest.flatten.models.SendLongRequestStatus;
import tsptest.flatten.models.User;

public class FlattenOpSendLong {
    public static void main(String[] args) {
        FlattenClient flattenClient
            = new FlattenClientBuilder().endpoint(Configuration.getGlobalConfiguration().get("ENDPOINT")).buildClient();
        // BEGIN:tsptest.flatten.generated.sendlong.flattenopsendlong
        flattenClient.sendLong(
            new SendLongOptions("myRequiredId", "myRequiredInput", 11, null, "title", SendLongRequestStatus.NOT_STARTED)
                .setFilter("name=myName")
                .setUser(new User("myOptionalUser"))
                .setDataIntOptional(12)
                .setDataLong(13L)
                .setDataFloat(14.0D)
                .setDescription("description"));
        // END:tsptest.flatten.generated.sendlong.flattenopsendlong
    }
}
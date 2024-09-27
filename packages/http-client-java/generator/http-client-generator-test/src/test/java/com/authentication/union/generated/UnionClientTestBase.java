// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
// Code generated by Microsoft (R) TypeSpec Code Generator.

package com.authentication.union.generated;

// The Java test files under 'generated' package are generated for your reference.
// If you wish to modify these files, please copy them out of the 'generated' package, and modify there.
// See https://aka.ms/azsdk/dpg/java/tests for guide on adding a test.

import com.authentication.union.UnionClient;
import com.authentication.union.UnionClientBuilder;
import com.azure.core.http.HttpClient;
import com.azure.core.http.policy.HttpLogDetailLevel;
import com.azure.core.http.policy.HttpLogOptions;
import com.azure.core.test.TestMode;
import com.azure.core.test.TestProxyTestBase;
import com.azure.core.test.utils.MockTokenCredential;
import com.azure.core.util.Configuration;
import com.azure.identity.DefaultAzureCredentialBuilder;

class UnionClientTestBase extends TestProxyTestBase {
    protected UnionClient unionClient;

    @Override
    protected void beforeTest() {
        UnionClientBuilder unionClientbuilder = new UnionClientBuilder()
            .endpoint(Configuration.getGlobalConfiguration().get("ENDPOINT", "http://localhost:3000"))
            .httpClient(HttpClient.createDefault())
            .httpLogOptions(new HttpLogOptions().setLogLevel(HttpLogDetailLevel.BASIC));
        if (getTestMode() == TestMode.PLAYBACK) {
            unionClientbuilder.httpClient(interceptorManager.getPlaybackClient()).credential(new MockTokenCredential());
        } else if (getTestMode() == TestMode.RECORD) {
            unionClientbuilder.addPolicy(interceptorManager.getRecordPolicy())
                .credential(new DefaultAzureCredentialBuilder().build());
        } else if (getTestMode() == TestMode.LIVE) {
            unionClientbuilder.credential(new DefaultAzureCredentialBuilder().build());
        }
        unionClient = unionClientbuilder.buildClient();

    }
}

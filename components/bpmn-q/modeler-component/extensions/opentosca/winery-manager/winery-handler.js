/**
 * Copyright (c) 2023 Institute of Architecture of Application Systems -
 * University of Stuttgart
 *
 * This program and the accompanying materials are made available under the
 * terms the Apache Software License 2.0
 * which is available at https://www.apache.org/licenses/LICENSE-2.0.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { getWineryEndpoint } from "../framework-config/config-manager";

const QUANTME_NAMESPACE_PUSH = 'http://quantil.org/quantme/push';

export async function createArtifactTemplate(name, artifactType) {
    const artifactTemplate = {
        localname: name,
        namespace: QUANTME_NAMESPACE_PUSH + '/artifacttemplates',
        type: artifactType,
    };
    const response = await fetch(getWineryEndpoint() + '/artifacttemplates', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/plain'
        },
        body: JSON.stringify(artifactTemplate)
    });
    return response.text();
}

export async function addFileToArtifactTemplate(artifactTemplateId, file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(getWineryEndpoint() + '/artifacttemplates/' + artifactTemplateId + 'files', {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': '*/*'
        },
    });
    return response.json();
}

export async function createArtifactTemplateWithFile(name, artifactType, file) {
    const artifactTemplateId = await createArtifactTemplate(name, artifactType);
    await addFileToArtifactTemplate(artifactTemplateId, file);
    return artifactTemplateId;
}
import { any } from "bluebird";
import e from "express";

interface PathsObject {
    [key: string]: any;
}

export const useGetSwaggerJson = (api: {
    name: string;
    data: {
        CM?: {
            properties: any;
            required: string[];
        };
        UM?: {
            properties: any;
            required: string[];
        };
    };
    extension?: {
        name: string;
        data: {
            VM?: any;
            CM?: {
                properties: any;
                required: string[];
            };
            UM?: {
                properties: any;
                required: string[];
            };
        };
    }[];
}) => {
    let tag_name = api.name;
    let api_name = api.name;
    let model_name = api.name;

    var definitions: { [x: string]: any } = {};
    if (api_name === "Auth"&& api.data.CM){
        definitions = {
            ...definitions,
            [model_name + "GM"]: {
                additionalProperties: false,
                properties: api.data.CM.properties,
                required: api.data.CM.required,
                type: "object",
            },
        }
    } else {
        if (api.data.CM && api.data.UM) {
            definitions = {
                ...definitions,
                [model_name + "CM"]: {
                    additionalProperties: false,
                    properties: api.data.CM.properties,
                    required: api.data.CM.required,
                    type: "object",
                },
                [model_name + "UM"]: {
                    additionalProperties: false,
                    properties: api.data.UM.properties,
                    required: api.data.UM.required,
                    type: "object",
                },
            }
        }
    }
    var paths: PathsObject = {};
    if (api_name === "Auth") {
        paths = {
            ...paths,
            [`/api/${api_name}`]: {
                get: {
                    tags: [tag_name],
                    operationId: api_name + "_Get",
                    consumes: [
                        "application/json",
                        "application/json-patch+json",
                        "text/json",
                        "application/*+json",
                    ],
                    responses: {
                        200: {
                            "x-nullable": true,
                            description: "",
                        },
                    },
                    security: [
                        {
                            JWT: [],
                        },
                    ],
                },
            },
            [`/api/${api_name}/Token`]: {
                post: {
                    tags: [tag_name],
                    operationId: api_name + "_PostToken",
                    consumes: [
                        "application/json",
                        "application/json-patch+json",
                        "text/json",
                        "application/*+json",
                    ],
                    parameters: [
                        {
                            name: "model",
                            in: "body",
                            required: true,
                            schema: {
                                $ref: "#/definitions/" + model_name + "GM",
                            },
                            "x-nullable": false,
                        },
                    ],
                    responses: {
                        200: {
                            "x-nullable": true,
                            description: "",
                        },
                    },
                    security: [
                        {
                            JWT: [],
                        },
                    ],
                },
            },
        }
    } else {
        if (api.data.CM && api.data.UM) {
            paths = {
                ...paths,
                [`/api/${api_name}`]: {
                    get: {
                        tags: [tag_name],
                        operationId: api_name + "_Get",
                        consumes: [
                            "application/json",
                            "application/json-patch+json",
                            "text/json",
                            "application/*+json",
                        ],
                        responses: {
                            200: {
                                "x-nullable": true,
                                description: "",
                            },
                        },
                        security: [
                            {
                                JWT: [],
                            },
                        ],
                    },
                    post: {
                        tags: [tag_name],
                        operationId: api_name + "_Post",
                        consumes: [
                            "application/json",
                            "application/json-patch+json",
                            "text/json",
                            "application/*+json",
                        ],
                        parameters: [
                            {
                                name: "model",
                                in: "body",
                                required: true,
                                schema: {
                                    $ref: "#/definitions/" + model_name + "CM",
                                },
                                "x-nullable": false,
                            },
                        ],
                        responses: {
                            200: {
                                "x-nullable": true,
                                description: "",
                            },
                        },
                        security: [
                            {
                                JWT: [],
                            },
                        ],
                    },
                    put: {
                        tags: [tag_name],
                        operationId: api_name + "_Put",
                        consumes: [
                            "application/json",
                            "application/json-patch+json",
                            "text/json",
                            "application/*+json",
                        ],
                        parameters: [
                            {
                                name: "model",
                                in: "body",
                                required: true,
                                schema: {
                                    $ref: "#/definitions/" + model_name + "UM",
                                },
                                "x-nullable": false,
                            },
                        ],
                        responses: {
                            200: {
                                "x-nullable": true,
                                description: "",
                            },
                        },
                        security: [
                            {
                                JWT: [],
                            },
                        ],
                    },
                },
                [`/api/${api_name}/{id}`]: {
                    get: {
                        tags: [tag_name],
                        operationId: api_name + "_GetById",
                        consumes: [
                            "application/json",
                            "application/json-patch+json",
                            "text/json",
                            "application/*+json",
                        ],
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                type: "number",
                                required: true,
                                "x-nullable": false,
                            },
                        ],
                        responses: {
                            200: {
                                "x-nullable": true,
                                description: "",
                            },
                        },
                        security: [
                            {
                                JWT: [],
                            },
                        ],
                    },
                    delete: {
                        tags: [tag_name],
                        operationId: api_name + "_Delete",
                        consumes: [
                            "application/json",
                            "application/json-patch+json",
                            "text/json",
                            "application/*+json",
                        ],
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                type: "number",
                                required: true,
                                "x-nullable": false,
                            },
                        ],
                        responses: {
                            200: {
                                "x-nullable": true,
                                description: "",
                            },
                        },
                        security: [
                            {
                                JWT: [],
                            },
                        ],
                    },
                },
            };
        } else {
            paths = {
                ...paths,
                [`/api/${api_name}`]: {
                    get: {
                        tags: [tag_name],
                        operationId: api_name + "_Get",
                        consumes: [
                            "application/json",
                            "application/json-patch+json",
                            "text/json",
                            "application/*+json",
                        ],
                        responses: {
                            200: {
                                "x-nullable": true,
                                description: "",
                            },
                        },
                        security: [
                            {
                                JWT: [],
                            },
                        ],
                    },
                }
            }
        }
    }
    if (api.extension) {
        api.extension.map((e) => {
            tag_name = api.name;
            api_name = api.name + "/" + e.name;
            model_name = e.name;

            if (e.data.VM) {
                if (e.data.VM.type) {
                    paths[`/api/${api.name}/${e.name}`] = {
                        get: {
                            tags: [tag_name],
                            operationId: api_name + `_GetBy${e.data.VM.queryName}`,
                            consumes: [
                                "application/json",
                                "application/json-patch+json",
                                "text/json",
                                "application/*+json",
                            ],
                            parameters: [
                                {
                                    name: `${e.data.VM.queryName}`,
                                    in: "query",
                                    // type: `${e.data.VM.queryType}`,
                                    type: "string",
                                    items: {
                                        // type: `${e.data.VM.queryType}`,
                                        "type": "string",
                                    },
                                    required: true,
                                }
                            ],
                            responses: {
                                200: {
                                    "x-nullable": true,
                                    description: "",
                                },
                            },
                            security: [
                                {
                                    JWT: [],
                                },
                            ],
                        },
                    };
                } else {
                    paths[`/api/${api.name}/{id}/${e.name}`] = {
                        get: {
                            tags: [tag_name],
                            operationId: api_name + "_GetById",
                            consumes: [
                                "application/json",
                                "application/json-patch+json",
                                "text/json",
                                "application/*+json",
                            ],
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    type: "number",
                                    required: true,
                                    "x-nullable": false,
                                },
                            ],
                            responses: {
                                200: {
                                    "x-nullable": true,
                                    description: "",
                                },
                            },
                            security: [
                                {
                                    JWT: [],
                                },
                            ],
                        },
                    };
                }
            }
            if (e.data.CM) {
                definitions[model_name + "CM"] = {
                    additionalProperties: false,
                    properties: e.data.CM.properties,
                    required: e.data.CM.required,
                    type: "object",
                };
                paths[`/api/${api_name}`] = {
                    ...paths,
                    post: {
                        tags: [tag_name],
                        operationId: api_name + "_Post",
                        consumes: [
                            "application/json",
                            "application/json-patch+json",
                            "text/json",
                            "application/*+json",
                        ],
                        parameters: [
                            {
                                name: "model",
                                in: "body",
                                required: true,
                                schema: {
                                    $ref: "#/definitions/" + model_name + "CM",
                                },
                                "x-nullable": false,
                            },
                        ],
                        responses: {
                            200: {
                                "x-nullable": true,
                                description: "",
                            },
                        },
                        security: [
                            {
                                JWT: [],
                            },
                        ],
                    },
                };
            }
            if (e.data.UM) {
                paths[`/api/${api.name}/{id}/${e.name}`] = {
                    ...paths,
                    put: {
                        tags: [tag_name],
                        operationId: api_name + "_Put",
                        consumes: [
                            "application/json",
                            "application/json-patch+json",
                            "text/json",
                            "application/*+json",
                        ],
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                type: "number",
                                required: true,
                                "x-nullable": false,
                            },
                        ],
                        responses: {
                            200: {
                                "x-nullable": true,
                                description: "",
                            },
                        },
                        security: [
                            {
                                JWT: [],
                            },
                        ],
                    },
                };
            }
        });
    }
    return {
        definitions,
        paths,
    };
};
